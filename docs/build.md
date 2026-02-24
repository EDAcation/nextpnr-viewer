# Build Process

This document explains how `lib/` (the `nextpnr-viewer` npm package) is built, from Rust source code all the way to the bundled JavaScript/WebAssembly artifact that consumers install.

## Overview

The build pipeline has three sequential phases:

```
1. Chipdb minimization  (Rust CLI → binary assets)
         ↓
2. WebAssembly compilation  (Rust → WASM + JS bindings via wasm-pack)
         ↓
3. JavaScript bundling  (TypeScript + WASM assets → dist/ via rollup)
```

All three are wired together by the `build` script in `lib/package.json`:

```json
"build-minifier": "cargo build --release",
"build-wasm":     "wasm-pack build --release --target web",
"build":          "npm run build-minifier && npm run build-wasm && npm exec rollup -- -c"
```

A faster development variant skips the minimizer step and uses a debug WASM build:

```json
"build-dev": "npm run build-wasm-dev && npm exec rollup -- -c"
```

## Phase 1: Chipdb minimization

### What is a chipdb?

Nextpnr ships architecture databases for each supported FPGA family. These *chipdbs* describe every BEL (basic element of logic), wire, and PIP (programmable interconnect point) on the chip. They are typically several megabytes each — too large to ship to every browser session.

The raw chipdb format is a flat binary blob produced by compiling nextpnr. It uses relative-pointer arrays (see `lib/src/chipdb/reltypes.rs`) that are efficient in C++ but contain a lot of data that the viewer never needs (timing delays, switch masks, etc.).

### The minimizer CLI

`lib/src/main.rs` is a small Rust binary (`nextpnr-renderer`) with a single job: read a full nextpnr chipdb, strip it down to only the fields the viewer uses, and write a compact binary. It is invoked as:

```sh
./target/release/nextpnr-renderer \
  --arch  <ice40|ecp5> \
  --input  static/chipdb/ice40/1k.bin \
  --output static/chipdb/ice40/1k-min.bin
```

Internally the minimizer:
1. Parses the raw chipdb using the architecture-specific POD readers in `lib/src/chipdb/{ice40,ecp5}/impl.rs`, which walk the relative-pointer layout.
2. Constructs a `Minimized*` version of each struct that contains only the fields tagged with `#[include]` in the type definitions (`lib/src/chipdb/{ice40,ecp5}/types.rs`).
3. Serialises the minimized data with [bincode](https://github.com/bincode-org/bincode) and then compresses it with zlib (via `miniz_oxide`) at compression level 1.

The `Minimize` derive macro (defined in `macros/minimize_derive/`) automates step 2: it reads a struct, generates a `Minimized<Struct>` sibling that keeps only the `#[include]`-annotated fields, and implements a `From` conversion between them. This makes it easy to extend the set of retained fields without manually maintaining two parallel type definitions.

The result is a file like `1k-min.bin` — a zlib-compressed bincode stream that is an order of magnitude smaller than the original and can be efficiently decoded in WASM.

### The Rollup plugin

`lib/chipdbMinimizer.mjs` wraps the CLI in a [Rollup](https://rollupjs.org) build plugin:

```js
export default function chipdbMinimizer(options = {}) {
  // ...
  return {
    name: 'chipdb-minimizer',
    async buildStart() {
      for (const arch of ['ecp5', 'ice40']) {
        // for each *.bin file that doesn't already end with -min.bin:
        //   run: nextpnr-renderer --arch <arch> --input <file> --output <file-min.bin>
      }
    },
  };
}
```

It is registered in `lib/rollup.config.mjs` as the first plugin in the chain so that the minimized files exist before Rollup processes any asset imports:

```js
plugins: [
  chipdbMinimizer({
    baseDir: 'static/chipdb',
    cliPath: './target/release/nextpnr-renderer',
  }),
  nodeResolve(),
  typescript(),
  importMetaAssets(),
],
```

The `build-dev` flow does **not** include the chipdb minimizer plugin; it relies on the `-min.bin` files that are already committed to the repository.

## Phase 2: WebAssembly compilation

```sh
wasm-pack build --release --target web
```

This compiles `lib/src/lib.rs` (and the Rust crate it pulls in) to `wasm32-unknown-unknown` and uses `wasm-bindgen` to generate:

- `lib/pkg/nextpnr_renderer_bg.wasm` — the compiled WebAssembly module.
- `lib/pkg/nextpnr_renderer.js` — ES module glue code that loads the WASM.
- `lib/pkg/nextpnr_renderer.d.ts` — TypeScript type declarations for all `#[wasm_bindgen]`-annotated Rust types.

The `--target web` flag produces output that is loaded with a plain `import` statement and an explicit `init()` call, which is how `lib/src/index.ts` initialises the module.

## Phase 3: JavaScript bundling

```sh
rollup -c   # reads lib/rollup.config.mjs
```

Rollup takes `lib/src/index.ts` as the entry point and produces `lib/dist/index.js`. Key plugins:

| Plugin | Role |
|--------|------|
| `@rollup/plugin-typescript` | Compiles TypeScript to JavaScript. |
| `@rollup/plugin-node-resolve` | Resolves bare module imports (e.g. `../pkg`). |
| `@web/rollup-plugin-import-meta-assets` | Detects `new URL('../static/chipdb/...', import.meta.url)` expressions and copies the referenced `.bin` files into `dist/`, rewriting the URLs to match. |
| `chipdbMinimizer` (custom) | Runs the minimizer CLI before bundling (release only). |

After bundling, `lib/dist/` contains:

```
dist/
  index.js          ← entire library entry point
  index.d.ts        ← TypeScript declarations
  *.wasm            ← WebAssembly module (copied by wasm-pack / node-resolve)
  chipdb/...        ← minimized binary chipdb assets
```

This is the directory listed in the `"files"` field of `lib/package.json` and is what gets published to npm.
