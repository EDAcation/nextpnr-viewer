use wasm_bindgen::prelude::*;

// TODO

#[wasm_bindgen(typescript_custom_section)]
const INEXTPNR_JSON: &'static str = r#"
interface NextpnrJson {
    r: number,
    g: number,
    b: number,
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "NextpnrJson")]
    pub type INextpnrJSON;
}
