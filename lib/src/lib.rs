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

struct Elements {
    wire: HashMap<String, Vec<gfx::GraphicElement>>,
    bel: HashMap<String, Vec<gfx::GraphicElement>>,
    group: HashMap<String, Vec<gfx::GraphicElement>>,
    pip: HashMap<String, Vec<gfx::GraphicElement>>,
}

#[wasm_bindgen]
pub fn do_something(chipdata: &[u8]) -> Result<String, JsError> {
    utils::set_panic_hook();

    log(format!("recv chipdata: {}", chipdata.len()));

    log("Conversion done, starting parse".to_string());

    let db = get_chipdb(chipdata);
    if let Err(e) = db.as_ref() {
        log(format!("{:?}", e));
        return Err(JsError::new("f"));
    }

    log("db parse done".to_string());

    let arch = architecture::ECP5Arch::new(db.unwrap());

    log("parse done".to_string());

    let mut elems = Elements {
        wire: HashMap::new(),
        bel: HashMap::new(),
        group: HashMap::new(),
        pip: HashMap::new(),
    };

    log("getting wire decals".to_string());
    for decal in arch.get_wire_decals() {
        let g = arch.get_decal_graphics(decal.decal);
        elems.wire.insert(decal.id, g);
    }

    log("getting bel decals".to_string());
    for decal in arch.get_bel_decals() {
        let g = arch.get_decal_graphics(decal.decal);
        elems.bel.insert(decal.id, g);
    }

    log("getting group decals".to_string());
    for decal in arch.get_group_decals() {
        let g = arch.get_decal_graphics(decal.decal);
        elems.group.insert(decal.id, g);
    }

    log("element create done".to_string());

    // for decal in arch.get_pip_decals() {
    //     let g = arch.get_decal_graphics(decal.decal);
    //     log(&format!("pip decals: {} - {:?}", decal.id, g)[..]);
    //     elems.pip.insert(decal.id, g);
    // }

    return Ok(format!(
        "wire: {}, bel: {}, group: {}, pip: {}",
        elems.wire.len(),
        elems.bel.len(),
        elems.group.len(),
        elems.pip.len()
    ));
}
