use std::collections::HashMap;
use std::f32::consts::E;

use anyhow::{bail, Result};
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGl2RenderingContext};

use crate::architecture::Architecture;
use crate::gfx::{Color, GraphicElement, Style, Type};
use crate::webgl::{
    ElementType, Line, LineCoords, Rectangle, RectangleCoords, RenderingProgram, WebGlElement,
};

type GraphicElementCollection = HashMap<String, Vec<GraphicElement>>;

pub struct Renderer<'a, T> {
    architecture: Box<dyn Architecture<T>>,
    program: RenderingProgram,

    graphic_elements: HashMap<ElementType, GraphicElementCollection>,
    webgl_elements: Vec<Box<dyn WebGlElement<'a> + 'a>>,

    canvas_size: (f32, f32),
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

fn to_webgl_elements<'a>(
    program: &RenderingProgram,
    ges: &Vec<GraphicElement>,
    r#type: &ElementType,
) -> Result<Vec<Box<dyn WebGlElement<'a>>>> {
    // Create 'groups' of elements with the same style, type and color so we can batch them
    // when rendering.
    let mut groups: HashMap<(Style, Type, Option<Color>), Vec<&GraphicElement>> = HashMap::new();
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

        if key.1 == Type::Box {
            let ls = group
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

            let mut line = Line::new(program, ls, Color { r: 100, g: 0, b: 0 })?;
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

            let mut rect = Rectangle::new(program, ls, Color { r: 100, g: 0, b: 0 })?;
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

            let mut line = Line::new(program, ls, Color { r: 100, g: 0, b: 0 })?;
            line.set_type(r#type.to_owned());
            res.push(Box::new(line));
        }
    }

    return Ok(res);
}

impl<'a, T> Renderer<'a, T> {
    pub fn new(
        canvas: HtmlCanvasElement,
        architecture: impl Architecture<T> + 'static,
    ) -> Result<Self> {
        let gl = create_rendering_context(&canvas)?;
        let program = RenderingProgram::new(gl)?;

        let mut graphic_elements = HashMap::new();
        graphic_elements.insert(ElementType::Wire, HashMap::new());
        graphic_elements.insert(ElementType::Bel, HashMap::new());
        graphic_elements.insert(ElementType::Group, HashMap::new());
        graphic_elements.insert(ElementType::Pip, HashMap::new());

        return Ok(Self {
            architecture: Box::new(architecture),
            program,

            graphic_elements,
            webgl_elements: vec![],

            canvas_size: (canvas.width() as f32, canvas.height() as f32),
            scale: 15.0,
            offset: (-10.25, -25.1),
        });
    }

    pub fn render(&self) -> Result<()> {
        let gl = self.program.get_gl();

        gl.viewport(0, 0, self.canvas_size.0 as i32, self.canvas_size.1 as i32);
        gl.clear_color(200.0, 200.0, 200.0, 1.0);
        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

        for elem in &self.webgl_elements {
            elem.draw(
                &self.program,
                self.offset.0,
                self.offset.1,
                self.scale,
                self.canvas_size.0,
                self.canvas_size.1,
            )?;
        }

        return Ok(());
    }

    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<()> {
        let mut amt = E.powf(-amt);

        let old_scale = self.scale;
        self.scale *= amt;
        self.scale = f32::min(4000.0, f32::max(5.0, self.scale));
        amt = self.scale / old_scale;
        if amt as u32 == 1 {
            return Ok(());
        };

        self.offset.0 -= x / (self.scale * amt) - x / self.scale;
        self.offset.1 -= y / (self.scale * amt) - y / self.scale;

        self.render()?;
        return Ok(());
    }

    pub fn create_graphic_elements(&mut self) {
        let wire_decals = self.architecture.get_wire_decals();
        for decal in wire_decals {
            let g = self.architecture.get_decal_graphics(decal.decal);
            self.graphic_elements
                .get_mut(&ElementType::Wire)
                .unwrap()
                .insert(decal.id, g);
        }

        let bel_decals = self.architecture.get_bel_decals();
        for decal in bel_decals {
            let g = self.architecture.get_decal_graphics(decal.decal);
            self.graphic_elements
                .get_mut(&ElementType::Bel)
                .unwrap()
                .insert(decal.id, g);
        }

        let group_decals = self.architecture.get_group_decals();
        for decal in group_decals {
            let g = self.architecture.get_decal_graphics(decal.decal);
            self.graphic_elements
                .get_mut(&ElementType::Group)
                .unwrap()
                .insert(decal.id, g);
        }
    }

    pub fn update_webgl_elements(&mut self) -> Result<()> {
        self.webgl_elements.clear();

        for (r#type, g_elems) in self.graphic_elements.iter() {
            let elems: Vec<GraphicElement> =
                g_elems.values().map(|e| e.clone()).flatten().collect();

            let new_elems = to_webgl_elements(&self.program, &elems, r#type)?;
            self.webgl_elements.extend(new_elems);
        }

        return Ok(());
    }
}
