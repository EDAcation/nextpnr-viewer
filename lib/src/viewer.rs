use crate::{
    architecture::{ECP5Arch, ICE40Arch},
    chipdb,
    decal::{ECP5DecalID, ICE40DecalID},
    pnrjson::{Chip, INextpnrJSON, IReportJSON, PnrInfo},
    renderer::{CellColorConfig, ColorConfig, Renderer},
    webgl::ElementType,
};

use wasm_bindgen::prelude::*;
use web_sys::{js_sys, HtmlCanvasElement};

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
    critical: Color,
    highlight: Color,
    selected: Color,
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

        let db = match chipdb::decode_min_chipinfo(chipdata) {
            Ok(db) => db,
            Err(e) => return Err(JsError::from(&*e)),
        };

        let arch = ECP5Arch::new(db);

        let renderer = match Renderer::new(canvas, arch, colors_conf, cell_colors_conf) {
            Ok(r) => r,
            Err(e) => return Err(JsError::from(&*e)),
        };

        Ok(Self { renderer })
    }

    #[wasm_bindgen]
    pub fn render(&mut self) -> Result<(), JsError> {
        self.renderer.render().map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn show_json(
        &mut self,
        obj: INextpnrJSON,
        report: Option<IReportJSON>,
    ) -> Result<(), JsError> {
        let pnr_info = PnrInfo::from_jsobj(Chip::ECP5, obj, report)
            .map_err(|e| JsError::new(&e.to_string()))?;
        return self
            .renderer
            .show_json(pnr_info)
            .map_err(|e| JsError::new(&e.to_string()));
    }

    #[wasm_bindgen]
    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer
            .zoom(amt, x, y)
            .map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn pan(&mut self, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer.pan(x, y).map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn select_at_coords(
        &mut self,
        x: f32,
        y: f32,
        only_highlight: bool,
    ) -> Result<JsValue, JsError> {
        let selection = self
            .renderer
            .select_decal_at_canvas(x, y, only_highlight)
            .map_err(|e| JsError::from(&*e))?;

        Ok(selection
            .map(|(_, et, s)| {
                let arr = js_sys::Array::new();
                arr.push(&JsValue::from_f64(et as u8 as f64));
                arr.push(&JsValue::from_str(&s));
                arr.into()
            })
            .unwrap_or(JsValue::NULL))
    }

    #[wasm_bindgen]
    pub fn select(&mut self, element_type: ElementType, decal_id: &str) -> Result<(), JsError> {
        self.renderer
            .select_decal(element_type, decal_id, true, false)
            .map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn get_decal_ids(&mut self, decal_type: ElementType) -> Result<Vec<String>, JsError> {
        Ok(self.renderer.get_decal_ids(decal_type))
    }

    #[wasm_bindgen]
    pub fn get_decals(
        &mut self,
        decal_type: ElementType,
        decal_ids: Vec<String>,
    ) -> Result<js_sys::Map, JsError> {
        let decal_info = self.renderer.get_decal_info(decal_type, &decal_ids);
        let map = js_sys::Map::new();
        for (id, info) in decal_info {
            map.set(
                &JsValue::from_str(&id),
                &serde_wasm_bindgen::to_value(&info).map_err(|e| JsError::new(&e.to_string()))?,
            );
        }
        Ok(map)
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

        let db = match chipdb::decode_min_chipinfo(chipdata) {
            Ok(db) => db,
            Err(e) => return Err(JsError::from(&*e)),
        };

        let arch = ICE40Arch::new(db);

        let renderer = match Renderer::new(canvas, arch, colors_conf, cell_colors_conf) {
            Ok(r) => r,
            Err(e) => return Err(JsError::from(&*e)),
        };

        Ok(Self { renderer })
    }

    #[wasm_bindgen]
    pub fn render(&mut self) -> Result<(), JsError> {
        self.renderer.render().map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn show_json(
        &mut self,
        obj: INextpnrJSON,
        report: Option<IReportJSON>,
    ) -> Result<(), JsError> {
        let pnr_info = PnrInfo::from_jsobj(Chip::ICE40, obj, report)
            .map_err(|e| JsError::new(&e.to_string()))?;
        return self
            .renderer
            .show_json(pnr_info)
            .map_err(|e| JsError::new(&e.to_string()));
    }

    #[wasm_bindgen]
    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer
            .zoom(amt, x, y)
            .map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn pan(&mut self, x: f32, y: f32) -> Result<(), JsError> {
        self.renderer.pan(x, y).map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn select_at_coords(
        &mut self,
        x: f32,
        y: f32,
        only_highlight: bool,
    ) -> Result<JsValue, JsError> {
        let selection = self
            .renderer
            .select_decal_at_canvas(x, y, only_highlight)
            .map_err(|e| JsError::from(&*e))?;

        Ok(selection
            .map(|(_, et, s)| {
                let arr = js_sys::Array::new();
                arr.push(&JsValue::from_f64(et as u8 as f64));
                arr.push(&JsValue::from_str(&s));
                arr.into()
            })
            .unwrap_or(JsValue::NULL))
    }

    #[wasm_bindgen]
    pub fn select(&mut self, element_type: ElementType, decal_id: &str) -> Result<(), JsError> {
        self.renderer
            .select_decal(element_type, decal_id, true, false)
            .map_err(|e| JsError::from(&*e))
    }

    #[wasm_bindgen]
    pub fn get_decal_ids(&mut self, decal_type: ElementType) -> Result<Vec<String>, JsError> {
        Ok(self.renderer.get_decal_ids(decal_type))
    }

    #[wasm_bindgen]
    pub fn get_decals(
        &mut self,
        decal_type: ElementType,
        decal_ids: Vec<String>,
    ) -> Result<js_sys::Map, JsError> {
        let decal_info = self.renderer.get_decal_info(decal_type, &decal_ids);
        let map = js_sys::Map::new();
        for (id, info) in decal_info {
            map.set(
                &JsValue::from_str(&id),
                &serde_wasm_bindgen::to_value(&info).map_err(|e| JsError::new(&e.to_string()))?,
            );
        }
        Ok(map)
    }
}
