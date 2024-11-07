mod architecture;
mod chipdb;
mod decal;
mod gfx;
mod utils;
use wasm_bindgen::prelude::*;

use crate::architecture::Architecture;

#[wasm_bindgen]
pub fn do_something() -> usize {
    utils::set_panic_hook();

    let arch = architecture::ECP5Arch::new(chipdb::ecp5::ChipInfoPOD {
        width: 32,
        height: 32,
        num_tiles: 64,
        const_id_count: 1,
        locations: vec![],
        location_type: vec![],
        location_glbinfo: vec![],
        tiletype_names: vec![],
        package_info: vec![],
        pio_info: vec![],
        tile_info: vec![],
        speed_grades: vec![],
    });
    let d = arch.get_bel_decals();

    return d.len();
}
