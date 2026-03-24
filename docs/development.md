# Development Environment

This document describes how to set up a local development environment for `nextpnr-viewer`.

## Prerequisites

The project has two main build components:

- **Rust + wasm-pack** — compiles the core rendering logic to WebAssembly.
- **Node.js (≥ 20) + npm** — bundles the TypeScript wrapper and ships the final library.

### Option A: Nix / direnv (recommended)

A `shell.nix` is provided at the repository root that provisions all required tools:

```nix
{ pkgs ? import <nixpkgs> {}}:

pkgs.mkShell {
  packages = with pkgs; [
    nodejs_20
    rustup
    wasm-pack
    coz
  ];
}
```

Enter the shell with:

```sh
nix-shell
```

If you use [direnv](https://direnv.net/) with [nix-direnv](https://github.com/nix-community/nix-direnv), add a `.envrc` to the root of the repo:

```sh
use nix
```

Then run `direnv allow`. From this point on, every time you `cd` into the project directory the correct toolchain will be activated automatically.

### Option B: Manual installation

Install the following tools manually:

| Tool         | Notes                                                             |
| ------------ | ----------------------------------------------------------------- |
| Node.js ≥ 20 | e.g. via [nvm](https://github.com/nvm-sh/nvm)                     |
| Rust stable  | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| wasm-pack    | `cargo install wasm-pack`                                         |

## Installing JavaScript dependencies

Both the library and the test viewer are situated in separate workspaces, but share one `package.json` for dependencies. Install them using a single `npm i` in the root of the repository.

## Running the development workflow

Development requires two long-running processes running **simultaneously**, each in its own terminal.

### 1. Build the library in watch mode

In the `lib/` directory:

```sh
npm run build-dev
```

This command:

1. Compiles Rust to a WASM module using `wasm-pack build --debug --target web`, generating JavaScript/TypeScript bindings under `lib/pkg/`.
2. Invokes `rollup -c`, which minimizes the FPGA chipdb files and then bundles `src/index.ts` together with the WASM artifact and binary assets into `lib/dist/`.

> **Note:** `build-dev` does _not_ build the chipdb minimizer (that step is part of the release `build` script only). If you have not compiled a release build of the viewer before, you may need to build the minifier once using `npm run build-minifier`. It is generally not necessary to do this again unless you modify which fields of the chipdb are used.

### 2. Serve the test viewer

In the `viewer-test/` directory:

```sh
npm run serve
```

This starts a local HTTP server (default port **10001**) using `rollup --watch`. Rollup watches `viewer-test/src/index.ts` and `index.html` and rebuilds automatically when either changes. Because `nextpnr-viewer` is declared as a local path dependency (`"nextpnr-viewer": "../lib"`), any rebuild of `lib/dist/` caused by step 1 will also trigger a rebuild here.

Open `http://localhost:10001` in your browser to interact with the viewer.

## Typical workflow

```
Terminal A (lib/)          Terminal B (viewer-test/)
──────────────────         ─────────────────────────
npm run build-dev          npm run serve
  → WASM compiled            → dev server starts on :10001
  → rollup bundles lib
  [edit Rust / TS]
  → wasm recompiled
  → rollup re-bundles      → rollup picks up new lib/dist/
```

Make changes to Rust source files under `lib/src/` or the TypeScript wrapper at `lib/src/index.ts`, and the toolchain will recompile automatically. The test viewer reflects the result in real time.

## Obtaining chip databases

The raw chipdb binary files (e.g. `1k.bin`, `25k.bin`) must be generated from a built copy of [nextpnr](https://github.com/YosysHQ/nextpnr) and placed under `lib/static/chipdb/<arch>/` before building. These are committed to git, so these steps are only necessary to implement chips that are currently unsupported by the viewer.

1. Clone and compile nextpnr following its own instructions. You can skip `make install`.
2. Navigate to the build directory containing chipdbs (e.g. `./build/ice40/`).
3. The `chipdb-*.cc` files contain C arrays with the binary chip data.

The data can be extracted as follows:

1. Modify each chipdb file to keep only the array definition:
    ```c
    const uint8_t chipdb_blob_xxx[1234] = { ... };
    ```
2. Write a small program to dump the array to a binary file:

    ```cpp
    #include <fstream>
    #include <cstdint>
    #include "chipdb-u4k.bin.cc"

    int main() {
        std::ofstream out("chipdb-u4k.bin", std::ios::binary);
        out.write(reinterpret_cast<const char*>(chipdb_blob_u4k), sizeof(chipdb_blob_u4k));
        return 0;
    }
    ```

3. Run the program and place the resulting `.bin` file under `lib/static/chipdb/<arch>/`.

The release build will then minimize these files automatically (see [build.md](build.md)).
