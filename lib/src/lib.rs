mod gfx;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn do_something() -> usize {
    let mut g = vec![];
    gfx::ecp5::gfx_tile_bel(
        &mut g,
        0.0,
        0.0,
        0,
        0,
        0,
        &gfx::ConstId::TRELLIS_COMB,
        &gfx::Style::Inactive,
    );

    return g.len();
}
