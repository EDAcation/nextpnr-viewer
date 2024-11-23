use crate::{
    architecture::ECP5Arch,
    chipdb::ecp5::get_chipdb,
    decal::ECP5DecalID,
    pnrjson::INextpnrJSON,
    renderer::{ColorConfig, Renderer},
};

use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

#[wasm_bindgen(typescript_custom_section)]
const ICOLOR_CONFIG: &'static str = r#"
interface Color {
    r: number,
    g: number,
    b: number,
}

interface ColorConfig {
    active: Color,
    inactive: Color,
    frame: Color,
    background: Color,
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "ColorConfig")]
    pub type IColorConfig;
}

#[wasm_bindgen]
pub struct ViewerECP5 {
    renderer: Renderer<'static, ECP5DecalID>,
}

#[wasm_bindgen]
impl ViewerECP5 {
    #[wasm_bindgen(constructor)]
    pub fn new(
        canvas: HtmlCanvasElement,
        chipdata: &[u8],
        colors: IColorConfig,
    ) -> Result<Self, JsError> {
        let colors_conf: ColorConfig = match serde_wasm_bindgen::from_value(colors.obj) {
            Ok(colors_conf) => colors_conf,
            Err(e) => return Err(JsError::from(e)),
        };

        let db = match get_chipdb(chipdata) {
            Ok(db) => db,
            Err(e) => return Err(JsError::from(&*e)),
        };

        let arch = ECP5Arch::new(db);

        let renderer = match Renderer::new(canvas, arch, colors_conf) {
            Ok(r) => r,
            Err(e) => return Err(JsError::from(&*e)),
        };

        return Ok(Self { renderer });
    }

    #[wasm_bindgen]
    pub fn render(&mut self) -> Result<(), JsError> {
        self.renderer.render();

        return Ok(());
    }

    #[wasm_bindgen]
    pub fn show_json(&mut self, obj: INextpnrJSON) -> Result<(), JsError> {
        self.renderer.show_json(obj);

        return Ok(());
    }

    #[wasm_bindgen]
    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer.zoom(amt, x, y);

        return Ok(());
    }

    #[wasm_bindgen]
    pub fn pan(&mut self, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer.pan(x, y);

        return Ok(());
    }
}
