mod architecture;
mod chipdb;
mod decal;
mod gfx;
mod pnrjson;
mod renderer;
mod utils;
mod viewer;
mod webgl;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
fn start() {
    utils::set_panic_hook();
}

pub use viewer::ViewerECP5;
