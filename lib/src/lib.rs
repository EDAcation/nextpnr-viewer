mod architecture;
mod chipdb;
mod decal;
mod gfx;
mod utils;

use std::collections::HashMap;

use architecture::Architecture;
use chipdb::ecp5::get_chipdb;
use utils::log;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn do_something(chipdata: &[u8]) -> Result<String, JsError> {
    utils::set_panic_hook();

    let db = get_chipdb(chipdata);
    if let Err(e) = db.as_ref() {
        log(format!("{:?}", e));
        return Err(JsError::new("f"));
    }

    let arch = architecture::ECP5Arch::new(db.unwrap());

    let wire_decals = arch.get_wire_decals();
    let mut wires = HashMap::<String, Vec<gfx::GraphicElement>>::with_capacity(wire_decals.len());
    for decal in wire_decals {
        let g = arch.get_decal_graphics(decal.decal);
        wires.insert(decal.id, g);
    }

    let bel_decals = arch.get_bel_decals();
    let mut bels = HashMap::<String, Vec<gfx::GraphicElement>>::with_capacity(bel_decals.len());
    for decal in bel_decals {
        let g = arch.get_decal_graphics(decal.decal);
        bels.insert(decal.id, g);
    }

    let group_decals = arch.get_group_decals();
    let mut groups = HashMap::<String, Vec<gfx::GraphicElement>>::with_capacity(group_decals.len());
    for decal in group_decals {
        let g = arch.get_decal_graphics(decal.decal);
        groups.insert(decal.id, g);
    }

    // let pip_decals = arch.get_group_decals();
    // let mut pips = HashMap::<String, Vec<gfx::GraphicElement>>::with_capacity(pip_decals.len());
    // for decal in pip_decals {
    //     let g = arch.get_decal_graphics(decal.decal);
    //     pips.insert(decal.id, g);
    // }

    return Ok(format!(
        "wire: {}, bel: {}, group: {}, pip: {}",
        wires.len(),
        bels.len(),
        groups.len(),
        0
    ));
}
