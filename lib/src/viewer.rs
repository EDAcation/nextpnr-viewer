use crate::{
    architecture::{ECP5Arch, ICE40Arch},
    chipdb::{ecp5, ice40},
    decal::{ECP5DecalID, ICE40DecalID},
    pnrjson::{Chip, INextpnrJSON},
    renderer::{CellColorConfig, ColorConfig, Renderer},
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

type CellColorConfig = Record<string, Color>;
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "ColorConfig")]
    pub type IColorConfig;

    #[wasm_bindgen(typescript_type = "CellColorConfig")]
    pub type ICellColorConfig;
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
        cell_colors: ICellColorConfig,
    ) -> Result<Self, JsError> {
        let colors_conf: ColorConfig = match serde_wasm_bindgen::from_value(colors.obj) {
            Ok(colors_conf) => colors_conf,
            Err(e) => return Err(JsError::from(e)),
        };
        let cell_colors_conf: CellColorConfig =
            match serde_wasm_bindgen::from_value(cell_colors.obj) {
                Ok(cell_colors_conf) => cell_colors_conf,
                Err(e) => return Err(JsError::from(e)),
            };

        let db = match ecp5::get_chipdb(chipdata) {
            Ok(db) => db,
            Err(e) => return Err(JsError::from(&*e)),
        };

        let arch = ECP5Arch::new(db);

        let renderer = match Renderer::new(canvas, arch, colors_conf, cell_colors_conf) {
            Ok(r) => r,
            Err(e) => return Err(JsError::from(&*e)),
        };

        return Ok(Self { renderer });
    }

    #[wasm_bindgen]
    pub fn render(&mut self, force_first: Option<bool>) -> Result<(), JsError> {
        self.renderer.render(force_first.unwrap_or(true));

        return Ok(());
    }

    #[wasm_bindgen]
    pub fn show_json(&mut self, obj: INextpnrJSON) -> Result<(), JsError> {
        self.renderer.show_json(obj, Chip::ECP5);

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

#[wasm_bindgen]
pub struct ViewerICE40 {
    renderer: Renderer<'static, ICE40DecalID>,
}

#[wasm_bindgen]
impl ViewerICE40 {
    #[wasm_bindgen(constructor)]
    pub fn new(
        canvas: HtmlCanvasElement,
        chipdata: &[u8],
        colors: IColorConfig,
        cell_colors: ICellColorConfig,
    ) -> Result<Self, JsError> {
        let colors_conf: ColorConfig = match serde_wasm_bindgen::from_value(colors.obj) {
            Ok(colors_conf) => colors_conf,
            Err(e) => return Err(JsError::from(e)),
        };
        let cell_colors_conf: CellColorConfig =
            match serde_wasm_bindgen::from_value(cell_colors.obj) {
                Ok(cell_colors_conf) => cell_colors_conf,
                Err(e) => return Err(JsError::from(e)),
            };

        let db = match ice40::get_chipdb(chipdata) {
            Ok(db) => db,
            Err(e) => return Err(JsError::from(&*e)),
        };

        let arch = ICE40Arch::new(db);

        let renderer = match Renderer::new(canvas, arch, colors_conf, cell_colors_conf) {
            Ok(r) => r,
            Err(e) => return Err(JsError::from(&*e)),
        };

        return Ok(Self { renderer });
    }

    #[wasm_bindgen]
    pub fn render(&mut self, force_first: Option<bool>) -> Result<(), JsError> {
        self.renderer.render(force_first.unwrap_or(true));

        return Ok(());
    }

    #[wasm_bindgen]
    pub fn show_json(&mut self, obj: INextpnrJSON) -> Result<(), JsError> {
        self.renderer.show_json(obj, Chip::ICE40);

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
