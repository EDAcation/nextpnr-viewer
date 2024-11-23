use std::collections::HashMap;
use std::f32::consts::E;

use anyhow::{bail, Result};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGl2RenderingContext};

use crate::architecture::Architecture;
use crate::gfx::{Color, GraphicElement, Style, Type};
use crate::pnrjson::{INextpnrJSON, NextpnrJson};
use crate::webgl::{
    ElementType, Line, LineCoords, Rectangle, RectangleCoords, RenderingProgram, WebGlElement,
};

type GraphicElementCollection = HashMap<String, Vec<GraphicElement>>;
type GraphicElements = HashMap<ElementType, GraphicElementCollection>;

type WebGlElements<'a> = Vec<Box<dyn WebGlElement<'a> + 'a>>;

#[derive(Serialize, Deserialize)]
pub struct ColorConfig {
    active: Color,
    inactive: Color,
    frame: Color,
    background: Color,
}

pub struct Renderer<'a, T> {
    architecture: Box<dyn Architecture<T>>,
    program: RenderingProgram,
    canvas: HtmlCanvasElement,

    graphic_elements: GraphicElements,
    graphic_elements_dirty: bool,
    webgl_elements: WebGlElements<'a>,
    webgl_elements_dirty: bool,
    colors: ColorConfig,

    offset: (f32, f32),
    scale: f32,
}

fn create_rendering_context(canvas: &HtmlCanvasElement) -> Result<WebGl2RenderingContext> {
    let Ok(Some(context_obj)) = canvas.get_context("webgl2") else {
        bail!("Could not get canvas context");
    };
    let Ok(context) = context_obj.dyn_into::<WebGl2RenderingContext>() else {
        bail!("Could not convert object into context");
    };

    return Ok(context);
}

impl<'a, T> Renderer<'a, T> {
    pub fn new(
        canvas: HtmlCanvasElement,
        architecture: impl Architecture<T> + 'static,
        colors: ColorConfig,
    ) -> Result<Self> {
        let gl = create_rendering_context(&canvas)?;
        let program = RenderingProgram::new(gl)?;

        return Ok(Self {
            architecture: Box::new(architecture),
            program,
            canvas,

            graphic_elements: HashMap::new(),
            graphic_elements_dirty: true,
            webgl_elements: vec![],
            webgl_elements_dirty: true,
            colors,

            scale: 15.0,
            offset: (-10.25, -25.1),
        });
    }

    pub fn render(&mut self) -> Result<()> {
        if self.webgl_elements_dirty {
            self.update_webgl_elements()?;
        }

        let gl = self.program.get_gl();
        let canvas = self.get_canvas();

        gl.viewport(0, 0, canvas.width() as i32, canvas.height() as i32);

        let bg_color = self.colors.background;
        gl.clear_color(
            bg_color.float_r(),
            bg_color.float_g(),
            bg_color.float_b(),
            1.0,
        );
        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

        for elem in &self.webgl_elements {
            elem.draw(
                &self.program,
                self.offset.0,
                self.offset.1,
                self.scale,
                canvas.width() as f32,
                canvas.height() as f32,
            )?;
        }

        return Ok(());
    }

    pub fn show_json(&mut self, obj: INextpnrJSON) -> Result<()> {
        let json = NextpnrJson::from_jsobj(obj)?;
        let elems = json.get_elements();

        let wire_map = self
            .graphic_elements
            .entry(ElementType::Wire)
            .or_insert_with(|| HashMap::new());
        for wire in elems.wires {
            let Some(ge) = wire_map.get_mut(&wire) else {
                continue;
            };
            for g in ge {
                g.style = Style::Active;
            }
        }

        let bel_map = self
            .graphic_elements
            .entry(ElementType::Bel)
            .or_insert_with(|| HashMap::new());
        for bel in elems.bels {
            let Some(ge) = bel_map.get_mut(bel.nextpnr_bel) else {
                continue;
            };

            ge.iter_mut().for_each(|g| g.style = Style::Active);
        }

        // TODO: make neater, we get a borrow error when using self.get_graphic_elems
        let pip_map = self
            .graphic_elements
            .entry(ElementType::Pip)
            .or_insert_with(|| HashMap::new());
        pip_map.clear();
        for pip in elems.pips {
            let Some(decal) =
                self.architecture
                    .find_pip_decal_by_loc_from_to(&pip.location, &pip.from, &pip.to)
            else {
                continue;
            };

            let mut ges = self.architecture.get_decal_graphics(&decal.decal);
            ges.iter_mut().for_each(|g| g.style = Style::Active);

            pip_map.insert(decal.id, ges);
        }

        self.webgl_elements_dirty = true;

        self.render()?;
        return Ok(());
    }

    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<()> {
        if self.graphic_elements_dirty {
            bail!("Graphic elements must be generated before zooming");
        }

        let mut amt = E.powf(-amt);

        let old_scale = self.scale;
        self.scale *= amt;
        self.scale = f32::min(4000.0, f32::max(10.0, self.scale));
        amt = self.scale / old_scale;
        if amt == 1.0 {
            return Ok(());
        };

        self.offset.0 -= x / (self.scale * amt) - x / self.scale;
        self.offset.1 -= y / (self.scale * amt) - y / self.scale;

        self.render()?;
        return Ok(());
    }

    pub fn pan(&mut self, x: f32, y: f32) -> Result<()> {
        if self.graphic_elements_dirty {
            bail!("Graphic elements must be generated before panning");
        }

        self.offset.0 -= x / self.scale;
        self.offset.1 -= y / self.scale;

        self.render()?;
        return Ok(());
    }

    fn get_canvas(&self) -> &HtmlCanvasElement {
        return &self.canvas;
    }

    fn update_graphic_elements(&mut self) {
        // Wires
        let wire_decals = self.architecture.get_wire_decals();
        let wire_map = self
            .graphic_elements
            .entry(ElementType::Wire)
            .or_insert_with(|| HashMap::new());
        for decal in wire_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            wire_map.insert(decal.id, g);
        }

        // BELs
        let bel_decals = self.architecture.get_bel_decals();
        let bel_map = self
            .graphic_elements
            .entry(ElementType::Bel)
            .or_insert_with(|| HashMap::new());
        for decal in bel_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            bel_map.insert(decal.id, g);
        }

        // Groups
        let group_decals = self.architecture.get_group_decals();
        let group_map = self
            .graphic_elements
            .entry(ElementType::Group)
            .or_insert_with(|| HashMap::new());
        for decal in group_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            group_map.insert(decal.id, g);
        }

        self.graphic_elements_dirty = false;
    }

    pub fn update_webgl_elements(&mut self) -> Result<()> {
        // Make sure graphic elements are updated first
        if self.graphic_elements_dirty {
            self.update_graphic_elements();
        }

        self.webgl_elements.clear();
        for (r#type, g_elems) in self.graphic_elements.iter() {
            let elems: Vec<GraphicElement> =
                g_elems.values().map(|e| e.clone()).flatten().collect();

            self.webgl_elements
                .extend(self.to_webgl_elements(&elems, r#type)?);
        }

        self.webgl_elements_dirty = false;

        return Ok(());
    }

    fn get_elem_color(&self, style: &Style, orig_color: &Option<Color>) -> Option<Color> {
        match style {
            Style::Active => Some(orig_color.unwrap_or(self.colors.active)),
            Style::Inactive => Some(self.colors.inactive),
            Style::Frame => Some(self.colors.frame),
            _ => None, // Hidden or some other style, cannot determine color
        }
    }

    fn to_webgl_elements(
        &self,
        ges: &Vec<GraphicElement>,
        r#type: &ElementType,
    ) -> Result<Vec<Box<dyn WebGlElement<'a>>>> {
        // Create 'groups' of elements with the same style, type and color so we can batch them
        // when rendering.
        let mut groups: HashMap<(Style, Type, Option<Color>), Vec<&GraphicElement>> =
            HashMap::new();
        for elem in ges {
            let key = (elem.style, elem.r#type, elem.color);
            groups
                .entry(key)
                .and_modify(|v| v.push(elem))
                .or_insert(vec![elem]);
        }

        let mut res: Vec<Box<dyn WebGlElement>> = vec![];
        for (key, group) in groups.into_iter() {
            if group.len() == 0 || key.0 == Style::Hidden {
                continue;
            }
            let Some(color) = self.get_elem_color(&key.0, &key.2) else {
                continue; // Invalid color
            };

            if key.1 == Type::Box {
                let ls: Vec<_> = group
                    .into_iter()
                    .flat_map(|e| {
                        [
                            LineCoords {
                                x1: e.x1 as f32,
                                x2: e.x2 as f32,
                                y1: e.y1 as f32,
                                y2: e.y1 as f32,
                            },
                            LineCoords {
                                x1: e.x1 as f32,
                                x2: e.x2 as f32,
                                y1: e.y2 as f32,
                                y2: e.y2 as f32,
                            },
                            LineCoords {
                                x1: e.x1 as f32,
                                x2: e.x1 as f32,
                                y1: e.y1 as f32,
                                y2: e.y2 as f32,
                            },
                            LineCoords {
                                x1: e.x2 as f32,
                                x2: e.x2 as f32,
                                y1: e.y1 as f32,
                                y2: e.y2 as f32,
                            },
                        ]
                    })
                    .collect();

                let mut line = Line::new(&self.program, ls, color)?;
                line.set_type(r#type.to_owned());
                res.push(Box::new(line));
            } else if key.1 == Type::FilledBox {
                let ls = group
                    .into_iter()
                    .map(|e| RectangleCoords {
                        x1: e.x1 as f32,
                        x2: e.x2 as f32,
                        y1: e.y1 as f32,
                        y2: e.y2 as f32,
                    })
                    .collect();

                let mut rect = Rectangle::new(&self.program, ls, color)?;
                rect.set_type(r#type.to_owned());
                res.push(Box::new(rect));
            } else {
                let ls = group
                    .into_iter()
                    .map(|e| LineCoords {
                        x1: e.x1 as f32,
                        y1: e.y1 as f32,
                        x2: e.x2 as f32,
                        y2: e.y2 as f32,
                    })
                    .collect();

                let mut line = Line::new(&self.program, ls, color)?;
                line.set_type(r#type.to_owned());
                res.push(Box::new(line));
            }
        }

        return Ok(res);
    }
}
