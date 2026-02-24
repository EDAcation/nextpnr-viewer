# Adding support for a new chip / family

This document explains how to port a new FPGA architecture into `nextpnr-viewer`. The viewer was
designed to be architecture-agnostic at its core; most new work lives in the pipeline that converts a
raw nextpnr chipdb into `GraphicElement`s. Everything downstream of that (the renderer, WebGL, the
sidebar, etc.) requires (almost) no changes at all.

The existing iCE40 support (added in [PR #8](https://github.com/EDAcation/nextpnr-viewer/pull/8))
is the best reference implementation. The steps below mirror exactly how that port was done.

---

## Step 0 — Obtain the chipdb binary

Before writing any code you need the raw binary chipdb file(s) for the target architecture. These
files are produced by compiling [nextpnr](https://github.com/YosysHQ/nextpnr) with support for your
architecture. The full procedure is documented in [development.md](development.md#obtaining-chip-databases).

Place the resulting `.bin` files under `lib/static/chipdb/<arch>/` (e.g. `lib/static/chipdb/ice40/1k.bin`). These chipdbs are not copied 1-to-1 into the resulting viewer
library; when defining the structs in the next step,
you need to indicate which fields of the chipdb will be
used by the viewer. You then need to add the new
architecture to `chipdbMinimizer.mjs` so that the chipdb
will be minimized at build time.

---

## Step 1 — Define the chipdb types (`lib/src/chipdb/<arch>/`)

Create a new module directory `lib/src/chipdb/<arch>/` with two files: `types.rs` and `impl.rs`.

### `types.rs` — mirror the nextpnr C++ structs

The nextpnr chipdb is a flat binary blob that uses a C-style layout with _relative pointers_ (arrays
and strings whose address is encoded as a byte offset relative to the field itself). The types you
define in Rust must exactly mirror the equivalent C++ structs in nextpnr's source.

Each struct that the minimizer should process gets `#[derive(Minimize)]` (from the
custom `minimize_derive` proc-macro). Individual fields are annotated to control what ends up in the
minimized chipdb that is available at runtime:

| Attribute            | Effect                                                                                                                                                                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| _(no attribute)_     | Field is read from the binary during parsing but **dropped** from the minimized output. Use this for fields that are necessary for the unminified chipdb to be parsed, but never used at runtime.                                                                                                    |
| `#[include]`         | Field is **kept** in the minimized chipdb as-is. Use this for names, coordinates, type identifiers, and indices the viewer reads at runtime.                                                                                                                                                         |
| `#[include_rewrite]` | Field is kept in the minimized chipdb **and** the `Minimize` macro recursively generates and uses a `Minimized*` version of the field's own type. Use this, for example, when the field itself holds a `Vec` of a struct that also has unneeded fields (e.g. `WireSegmentPOD` inside `WireInfoPOD`). |

Example from `lib/src/chipdb/ice40/types.rs` (include/drop decisions are arbitrary):

```rust
#[derive(Minimize)]
pub struct BelInfoPOD {
    #[include] pub name: String,   // keep: displayed in sidebar
    #[include] pub r#type: i32,    // keep: used to look up cell type name
    pub bel_wires: Vec<BelWirePOD>, // drop: wiring detail, not needed for rendering
    #[include] pub x: i8,          // keep: grid coordinates for decal placement
    #[include] pub y: i8,
    #[include] pub z: i8,
    pub padding_0: i8,              // drop
}

#[derive(Minimize)]
pub struct WireInfoPOD {
    #[include]         pub name: String,
    #[include_rewrite] pub segments: Vec<WireSegmentPOD>, // WireSegmentPOD is also Minimize-derived
    #[include]         pub x: i8,
    #[include]         pub y: i8,
    // timing fields → no attribute → dropped
    pub fast_delay: i32,
    pub slow_delay: i32,
}
```

The `Minimize` macro generates a `MinimizedBelInfoPOD` (etc.) struct containing only the `#[include]`
and `#[include_rewrite]` fields, and a `From<BelInfoPOD>` conversion that projects into it. The
minimizer CLI performs this conversion when building the `-min.bin` file, which is the file that is actually included in the final library.

### `impl.rs` — parse the raw binary

`impl.rs` implements the `POD` trait (from `lib/src/chipdb/reltypes.rs`) for every struct in
`types.rs`. `POD::new` reads fields in the exact order they appear in the C++ struct, using the
helper functions from `reltypes.rs`:

| Helper                            | C++ equivalent | What it reads                                   |
| --------------------------------- | -------------- | ----------------------------------------------- |
| `cur.read_i32::<LittleEndian>()?` | `int32_t`      | Plain 4-byte integer                            |
| `read_relstring(cur)?`            | `RelPtr<char>` | 4-byte relative offset → null-terminated string |
| `read_relslice::<T>(cur)?`        | `RelSlice<T>`  | 8-byte header (offset + length) → `Vec<T>`      |
| `read_relptr::<T>(cur)?`          | `RelPtr<T>`    | 4-byte relative offset → single `T`             |

The chip-level entry point is a function like `get_full_chipinfo(chipdata: &[u8]) -> Result<ChipInfoPOD>` that seeks to the root struct and calls `ChipInfoPOD::new(&mut cur)`.

---

## Step 2 — Register the minimizer

Add a call to the minimizer CLI for the new architecture in `lib/chipdbMinimizer.mjs` by adding the
architecture name to the `archList` array:

```js
const archList = ['ecp5', 'ice40', 'mynewarch'];
```

The plugin will then discover all `.bin` files under `lib/static/chipdb/mynewarch/` and produce
`*-min.bin` counterparts during a release build (see [build.md](build.md) for details).

---

## Step 3 — Define the Decal types (`lib/src/decal/<arch>.rs`)

A _decal_ is a lightweight symbolic token that identifies a single visual element on the chip (a
BEL, a wire, a PIP, or a group). Think of it as a typed index into the chipdb. The renderer never
touches chipdb data directly; it always goes through the `Architecture` trait which takes a
`DecalID` and returns geometry.

For your new architecture, create `lib/src/decal/<arch>.rs` and define:

- **`<Arch>DecalType`** — an enum with variants `TYPE_NONE`, `TYPE_BEL`, `TYPE_WIRE`, `TYPE_PIP`,
  `TYPE_GROUP` (mirror nextpnr's own decal type enum for the architecture).
- **`<Arch>DecalID`** — a small struct holding a `type`, an `index` (into the relevant chipdb
  array), and an `active` flag. This struct must implement `Clone`, `Copy`, `Serialize`, and
  `Deserialize`.
- Any group/tile-type enums your `gfx` implementation will need.

These types are simple value objects — no behaviour beyond construction and field access is required
at this stage.

---

## Step 4 — Port the graphics code (`lib/src/gfx/<arch>/`)

This is the most labour-intensive step. The graphics code maps a `DecalID` + chip coordinates to
a list of `GraphicElement`s (lines, boxes, arrows). The logic is a direct port of the C++ gfx
functions that nextpnr ships for its own GUI:

- **iCE40**: [`ice40/gfx.cc`](https://github.com/YosysHQ/nextpnr/blob/9c2d96f86ed56b77c9c325041b67654f26308270/ice40/gfx.cc)
- **ECP5**: [`ecp5/gfx.cc`](https://github.com/YosysHQ/nextpnr/blob/master/ecp5/gfx.cc)

The port is largely mechanical: C++ functions become Rust functions that push `GraphicElement`
values into a `Vec<gfx::GraphicElement>` instead of writing to the nextpnr canvas. The coordinate
formulas, magic constants, and tile-wire index ranges are copied verbatim (the Rust files are
intentionally dense with the same numeric literals you will find in the C++ originals).

Create the following files inside `lib/src/gfx/<arch>/`:

| File          | Contents                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| `mod.rs`      | Re-exports `tile_wire`, `tile_pip`, and the enums used by `architecture`. |
| `gfx.rs`      | The ported `tile_wire(...)` and `tile_pip(...)` functions.                |
| `tilewire.rs` | The `GfxTileWireId` enum — a direct port of the C++ `GfxTileWireId` enum. |
| `constids.rs` | The `ConstId` enum for cell/port identifiers.                             |
| `consts.rs`   | Floating-point layout constants (box boundaries, offsets).                |

The signatures follow the existing conventions:

```rust
pub fn tile_wire(
    g: &mut Vec<gfx::GraphicElement>,
    x: f64, y: f64,          // tile grid coordinates
    w: i32, h: i32,          // chip dimensions (for boundary checks)
    src_id: &GfxTileWireId,
    style: &gfx::Style,
) { /* push GraphicElement values */ }

pub fn tile_pip(
    g: &mut Vec<gfx::GraphicElement>,
    x: f64, y: f64,
    w: i32, h: i32,
    src_id: &GfxTileWireId,
    dst_id: &GfxTileWireId,
    style: &gfx::Style,
) { /* push GraphicElement values */ }
```

---

## Step 5 — Implement the `Architecture` trait (`lib/src/architecture/<arch>.rs`)

Create `lib/src/architecture/<arch>.rs` and implement the `Architecture<DecalID>` trait for a
new `<Arch>Arch` struct that owns the minimized chipdb:

```rust
pub struct MyArch {
    chipdb: chipdb::myarch::MinimizedChipInfoPOD,
}

impl Architecture<MyDecalID> for MyArch {
    fn get_bel_decals(&self) -> Vec<DecalXY<MyDecalID>> { ... }
    fn get_wire_decals(&self) -> Vec<DecalXY<MyDecalID>> { ... }
    fn get_pip_decals(&self) -> Vec<DecalXY<MyDecalID>> { ... }
    fn get_group_decals(&self) -> Vec<DecalXY<MyDecalID>> { ... }
    fn get_decal_graphics(&self, decal: &MyDecalID) -> Vec<GraphicElement> { ... }
    fn find_pip_decal_by_loc_from_to(&self, ...) -> Option<DecalXY<MyDecalID>> { ... }
}
```

This is again mostly a port of the equivalent functions in nextpnr's
[`arch.cc`](https://github.com/YosysHQ/nextpnr/blob/9c2d96f86ed56b77c9c325041b67654f26308270/ice40/arch.cc)
(`getBelDecals`, `getWireDecals`, etc.).

`get_decal_graphics` is where the gfx functions you wrote in step 4 are called. It matches on the
`DecalID` type and index, looks up the relevant chipdb arrays, and delegates to `tile_wire` /
`tile_pip` / the group drawing logic.

---

## Step 6 — Wire up the viewer and TypeScript

### Rust side (`lib/src/viewer.rs`)

Add a new `Viewer<Arch>` struct and expose it to JavaScript via `wasm_bindgen`, following the existing
`ViewerECP5` / `ViewerICE40` pattern:

```rust
#[wasm_bindgen]
pub struct ViewerMyArch {
    renderer: Renderer<'static, MyDecalID>,
}

#[wasm_bindgen]
impl ViewerMyArch {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: HtmlCanvasElement, chipdata: &[u8], colors: IColorConfig, cell_colors: ICellColorConfig) -> Result<Self, JsError> {
        let db = chipdb::decode_min_chipinfo(chipdata)?;
        let arch = MyArch::new(db);
        let renderer = Renderer::new(canvas, arch, ...)?;
        Ok(Self { renderer })
    }
    // render, show_json, zoom, pan, select_at_coords, select, get_decal_ids, get_decals
    // — copy the method bodies from ViewerECP5, they are identical
}
```

The `Renderer` itself is entirely chip-agnostic — it is generic over `DecalID` and works through the
`Architecture` trait. You only need to instantiate it with the right `Arch` type; none of the
rendering, WebGL, pan/zoom, or selection logic needs to change.

### TypeScript side (`lib/src/index.ts`)

Two additions are required:

1. **Add chipdb URLs** for the new device variants to `CHIP_DBS` and `SUPPORTED_DEVICES`:

    ```ts
    const CHIP_DBS = <const> {
        // ...existing entries...
        "myarch": {
            "variant1": new URL(`../static/chipdb/myarch/variant1-min.bin`, import.meta.url),
        },
    };

    export const SUPPORTED_DEVICES = <const> {
        // ...existing entries...
        myarch: {
            device_a: CHIP_DBS['myarch']['variant1'],
            device_b: CHIP_DBS['myarch']['variant1'],
        },
    };
    ```

2. **Register the viewer class** in the `VIEWERS` map so `NextPNRViewer` can instantiate the right viewer:

    ```ts
    const VIEWERS = <const> {
        'ecp5':   ViewerECP5,
        'ice40':  ViewerICE40,
        'myarch': ViewerMyArch,
    };
    ```

    `NextPNRViewer` already reads this map at construction time to pick the correct viewer for the
    chip family, so no further changes to the class are needed.

---

## Why only the chipdb → GraphicElement pipeline needs to be ported

Zooming out, the full rendering pipeline is:

```
Chipdb → Architecture → Decals → GraphicElements → WebGL → <canvas>
```

Everything from `GraphicElement` onwards is already implemented in a chip-agnostic way:

- The `Renderer<DecalID>` is generic. It stores graphic elements in a `HashMap<ElementType, HashMap<String, Vec<GraphicElement>>>` and converts them to GPU-ready `Line` / `Rectangle` objects without knowing anything about the architecture.
- The WebGL programs (`RenderingProgram`), color resolution, pan/zoom math, and element picking (R-tree) are shared by all architectures.
- The `PnrInfo` / `PnrJson` parser also does not know about chip specifics — it parses the standard nextpnr JSON format (`cells` with `NEXTPNR_BEL`, `netnames` with `ROUTING`) which is the same regardless of target.

The only chip-specific knowledge required is: _given this chipdb and this decal ID, what geometric shapes should be drawn?_ That question is answered entirely by the `Architecture` trait implementation and the `gfx` functions — everything else in the stack reuses the existing code unchanged.
