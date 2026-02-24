# Documentation

## For users

- [Installation](installation.md) — how to add `nextpnr-viewer` to your project.
- [Usage](usage.md) — API reference, configuration options, and a minimal integration example.

## For contributors

- [Development](development.md) — setting up a dev environment (Nix/direnv, dependencies, running the dev server).
- [Build process](build.md) — detailed walkthrough of the three-phase build pipeline (chipdb minimization, WASM compilation, JS bundling).
- [Architecture](architecture.md) — introduction to the codebase, the rendering data pipeline, JSON ingestion, and the role of `index.ts`.
- [Adding chip support](chipsupport.md) — step-by-step guide to porting a new FPGA family: chipdb types, the minimizer, decals, porting gfx from C++, and wiring up the viewer.
