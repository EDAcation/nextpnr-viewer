use wasm_bindgen::prelude::*;

// TODO

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
