#![allow(non_snake_case)]

use serde::Deserialize;
use wasm_bindgen::prelude::*;

// === RUST ===

#[derive(Deserialize)]
pub struct Cell {
    pub cell: String,
    pub loc: (i32, i32),
    pub port: String,
}

#[derive(Deserialize)]
pub struct CriticalPathSegment {
    // pub delay: f32,
    // pub from: Cell,
    // pub to: Cell,
    pub net: Option<String>,
    // pub r#type: String,
}

#[derive(Deserialize)]
pub struct CriticalPath {
    // pub from: String,
    pub path: Vec<CriticalPathSegment>,
    // pub to: String,
}

#[derive(Deserialize)]
pub struct ReportJson {
    pub critical_paths: Vec<CriticalPath>,
}

// === TYPESCRIPT ===

#[wasm_bindgen(typescript_custom_section)]
const IREPORT_JSON: &'static str = r#"
interface Cell {
    cell: string;
    loc: [number, number];
    port: string;
}

interface CriticalPathSegment {
    delay: number;
    from: Cell;
    to: Cell;
    type: string;
}

interface CriticalPath {
    from: string;
    path: CriticalPathSegment[];
    to: string;
}

interface ReportJson {
    critical_paths: CriticalPath[],
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "ReportJson")]
    pub type IReportJSON;
}
