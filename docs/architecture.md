# Codebase Architecture

This document explains how the `nextpnr-viewer` codebase is structured and how data flows through it at runtime.

## High-level structure

The codebase lives in `lib/` and is split into two languages that each occupy a distinct role:

| Layer           | Language      | Location           | Role                                       |
| --------------- | ------------- | ------------------ | ------------------------------------------ |
| Public API / UI | TypeScript    | `lib/src/index.ts` | Browser-facing class, sidebar, interaction |
| Core rendering  | Rust (→ WASM) | `lib/src/`         | Geometry, data parsing, WebGL dispatch     |

The Rust code is compiled to WebAssembly so it can run in the browser. `wasm-bindgen` generates the JavaScript/TypeScript bindings that `index.ts` calls.

---

## Data pipeline

The end goal is to paint colored lines and rectangles on a `<canvas>` element using WebGL 2. The pipeline that takes raw chip information and placement/routing data to that result is:

```
Chipdb (binary)
      │  decode_min_chipinfo()
      ▼
Architecture struct  (ice40::ChipInfoPOD / ecp5::ChipInfoPOD)
      │  Architecture trait: get_bel_decals(), get_wire_decals(), ...
      ▼
DecalXY<DecalID>  (positioned symbolic references)
      │  Architecture trait: get_decal_graphics(decal)
      ▼
GraphicElement  (geometry: Line, Box, Arrow, … with Style)
      │  Renderer: map Style → Color, convert to WebGL primitives
      ▼
WebGlElement  (Line / Rectangle with GPU-ready float coords)
      │  RenderingProgram::draw()
      ▼
<canvas>  (WebGL 2)
```

Each step is described in detail below.

---

### Step 1 — Chipdb → Architecture

`lib/src/chipdb/` contains the logic for reading the binary chipdb files.

The raw nextpnr chipdb uses a C-style layout with relative pointers (`RelPtr`, `RelSlice`). The `reltypes.rs` module provides `read_relstring`, `read_relarr`, and `read_relptr` helpers that walk this layout from a `Cursor<&[u8]>`.

The architecture-specific parsers (`chipdb/ice40/impl.rs` and `chipdb/ecp5/impl.rs`) use those helpers to deserialise the full `ChipInfoPOD` from a raw `.bin` file.

The _minimized_ chipdb format (_-min.bin_) used at runtime is different. It contains only the fields the viewer needs, serialised with bincode + zlib:

```rust
// lib/src/chipdb/encoder.rs
pub fn decode_min_chipinfo<T: DeserializeOwned>(chipdata: &[u8]) -> Result<T> {
    let decompressed = inflate::decompress_to_vec(chipdata)?;
    Ok(bincode::serde::decode_from_slice(&decompressed, BINCODE_CFG)?.0)
}
```

The decoded value is passed into the architecture constructor (`ECP5Arch::new(db)` / `ICE40Arch::new(db)`), which owns the chip information for the lifetime of the viewer.

---

### Step 2 — Architecture → Decals

The `Architecture` trait (`lib/src/architecture/types.rs`) is the central abstraction over chip families:

```rust
pub trait Architecture<DecalID> {
    fn get_decal_graphics(&self, decal: &DecalID) -> Vec<GraphicElement>;
    fn get_bel_decals  (&self) -> Vec<DecalXY<DecalID>>;
    fn get_wire_decals (&self) -> Vec<DecalXY<DecalID>>;
    fn get_pip_decals  (&self) -> Vec<DecalXY<DecalID>>;
    fn get_group_decals(&self) -> Vec<DecalXY<DecalID>>;
    fn find_pip_decal_by_loc_from_to(&self, ...) -> Option<DecalXY<DecalID>>;
}
```

A **Decal** (terminology borrowed from nextpnr) is a symbolic, positioned reference to a visual element on the chip. `DecalXY<DecalID>` pairs a chip-specific `DecalID` enum value with floating-point `(x, y)` coordinates (in chip-grid units) and a string identifier:

```rust
// lib/src/decal/mod.rs
pub struct DecalXY<DecalID> {
    pub decal: DecalID,
    pub x: f64,
    pub y: f64,
    pub id: String,
}
```

The concrete `DecalID` types (`ECP5DecalID`, `ICE40DecalID`) encode what kind of element is being referenced — a BEL, a wire, a PIP, or a group — and carry the indices needed to look it up.

`get_bel_decals()` returns one `DecalXY` per occupied site on the chip. `get_wire_decals()` and `get_group_decals()` do the same for wires and logical groups. These are called once when the viewer initialises.

---

### Step 3 — Decals → GraphicElements

`get_decal_graphics(decal)` takes a single `DecalXY` and returns a `Vec<GraphicElement>` — a list of primitive geometry items that visually represent that element.

`GraphicElement` (`lib/src/gfx/types.rs`) is adapted directly from nextpnr's own C++ type:

```rust
pub struct GraphicElement {
    pub r#type: Type,   // Line, Box, FilledBox, Arrow, Circle, …
    pub style: Style,   // Grid, Frame, Active, Inactive, Hidden, CritPath
    pub color: Option<Color>,
    pub x1: f64, pub y1: f64,
    pub x2: f64, pub y2: f64,
    // …
}
```

The `Style` field determines _how_ the element is rendered rather than _where_:

| Style      | Meaning                                 |
| ---------- | --------------------------------------- |
| `Grid`     | Static chip grid / outline              |
| `Frame`    | Structural outline of a cell            |
| `Active`   | High-contrast (occupied / routed)       |
| `Inactive` | Low-contrast (available but unused)     |
| `Hidden`   | Only shown when selected or highlighted |
| `CritPath` | Part of the timing-critical path        |

The actual geometry code is in `lib/src/gfx/{ice40,ecp5}/gfx.rs`. These files are essentially ports of the C++ gfx functions from nextpnr's own GUI code.

---

### Step 4 — GraphicElements → WebGL

The `Renderer` (`lib/src/renderer.rs`) owns all state and coordinates the pipeline. It groups `GraphicElement` values by `ElementType` (BEL, Wire, PIP, Group) and by a string element ID, storing them in a `FxHashMap<ElementType, FxHashMap<String, Vec<GraphicElement>>>`.

When it is time to render, the renderer maps each `GraphicElement` to a `WebGlElement`:

- `Type::Line` / `Type::LocalLine` → `Line` (two `vec2` vertices + colour + thickness)
- `Type::Box` / `Type::FilledBox` / `Type::Arrow` → `Rectangle`

The `Style` is resolved to a concrete `Color` using the `ColorConfig` (configured by the caller):

```rust
Style::Active   → colors.active
Style::Inactive → colors.inactive
Style::Frame    → colors.frame
Style::CritPath → colors.critical
// etc.
```

Cell-type colors (`cellColors` config) override `Style::Active` for BELs whose cell type matches a key in the map.

The `WebGlElement` objects are packed into GPU buffers by `RenderingProgram` (`lib/src/webgl/program.rs`) and drawn with a single `drawArrays` call per element type.

An R-tree (using the `rstar` crate) is maintained over the rendered elements so that mouse pick queries (`find element at cursor position`) run in sub-linear time.

---

## JSON ingestion (`pnrjson/`)

When the user calls `viewer.showJson(nextpnrJson, reportJson)`, nextpnr's placement and routing JSON is parsed and layered on top of the chip geometry.

### nextpnr JSON format

Two top-level pieces of data are extracted from the nextpnr JSON (`lib/src/pnrjson/nextpnr_types.rs`):

- **Cells** — each cell carries a `NEXTPNR_BEL` attribute (the site on the chip it was placed on) and an optional `cellType`.
- **Netnames** — each net carries a `ROUTING` attribute: a semicolon-separated list of `(wire_id, pip_name, ...)` triples that encode the routed path.

```rust
pub struct CellAttributes {
    pub NEXTPNR_BEL: String,
    pub cellType: Option<String>,
}

pub struct NetnameAttributes {
    pub ROUTING: String,  // "wire;X5Y3/...__>...;wire;X5Y4/..."
}
```

`NextpnrJson::from_jsobj` deserialises the JavaScript object passed from the browser using `serde_wasm_bindgen`.

### Routing parsing

`lib/src/pnrjson/nextpnr.rs` parses the `ROUTING` string into a `Vec<RoutingPart>`. Each part contains the wire ID and a `PipFromTo` struct that records:

- The tile location `(x, y)`.
- The source and destination `Wire` (with their own location and name).

The delimiter used to split pip names differs between architectures:

- ICE40: `".->."` (pip) and `"."` (wire)
- ECP5: `"->"` (pip) and `"_"` (wire)

### Timing report

If a `reportJson` is also provided (`lib/src/pnrjson/report_types.rs`), the viewer extracts the set of net names that fall on the critical path. The routing entries for those nets are then rendered with `Style::CritPath`.

---

## `lib/src/index.ts` — the TypeScript API layer

`index.ts` is the public surface of the npm package. Its responsibilities are:

1. **Chip resolution** — maps the `{ family, device }` config to the correct chipdb URL from the `CHIP_DBS` table (which covers all device aliases, e.g. `hx1k` and `lp1k` both point to the same `1k-min.bin`).

2. **Async initialisation** — calls `wasmInit()` once and fetches the chipdb binary in parallel. Until both are ready a loading indicator is shown over the canvas.

3. **Viewer instantiation** — picks the correct Rust-backed viewer class (`ViewerECP5` or `ViewerICE40`) and constructs it with the canvas element, chipdb bytes, and colour config.

4. **DOM management** — creates the two-panel layout (canvas + sidebar) inside the caller-supplied `container` div. Manages the sidebar with tabbed element lists (BELs, Wires, etc.), batched rendering to avoid blocking the main thread, and a "load more" pattern for large designs.

5. **Event handling** — handles pan (mouse drag), zoom (wheel), and click-to-select on the canvas. Selected elements are highlighted in the renderer and their details are shown in the sidebar.

6. **Public API** — exposes `render()`, `showJson()`, `resize()`, and the `isSupported()` helper to callers.

The TypeScript types for `NextpnrJson`, `ReportJson`, and the `ColorConfig` interface are generated from inline `#[wasm_bindgen(typescript_custom_section)]` snippets in the Rust viewer code, so the TypeScript and Rust type definitions stay in sync automatically.
