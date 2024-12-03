#![allow(non_snake_case)]

use std::collections::HashMap;

use serde::Deserialize;

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
