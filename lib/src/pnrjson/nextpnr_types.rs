#![allow(non_snake_case)]

use std::collections::HashMap;

use serde::Deserialize;
use wasm_bindgen::prelude::*;

// === RUST ===

#[derive(Deserialize)]
pub struct CellAttributes {
    pub NEXTPNR_BEL: String,
    pub cellType: Option<String>,
}

#[derive(Deserialize)]
pub struct Cell {
    pub attributes: CellAttributes,
}

#[derive(Deserialize)]
pub struct NetnameAttributes {
    pub ROUTING: String,
}

#[derive(Deserialize)]
pub struct Netname {
    pub attributes: NetnameAttributes,
}

#[derive(Deserialize)]
pub struct Top {
    pub cells: HashMap<String, Cell>,
    pub netnames: HashMap<String, Netname>,
}

#[derive(Deserialize)]
pub struct Modules {
    pub top: Top,
}

#[derive(Deserialize)]
pub struct NextpnrJson {
    pub modules: Modules,
}

// === TYPESCRIPT ===

#[wasm_bindgen(typescript_custom_section)]
const INEXTPNR_JSON: &'static str = r#"
interface CellAttributes {
    NEXTPNR_BEL: string,
    cellType?: string,
}

interface Cell {
    attributes: CellAttributes,
}

interface NetnameAttributes {
    ROUTING: string,
}

interface Netname {
    attributes: NetnameAttributes,
}

interface Top {
    cells: Record<string, Cell>,
    netnames: Record<string, Netname>,
}

interface Modules {
    top: Top,
}

interface NextpnrJson {
    modules: Modules,
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "NextpnrJson")]
    pub type INextpnrJSON;
}
