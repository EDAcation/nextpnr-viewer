use std::collections::{HashMap, HashSet};

use anyhow::{bail, Result};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsCast;
use web_sys::{HtmlCanvasElement, WebGl2RenderingContext};

use crate::architecture::Architecture;
use crate::gfx::{Color, GraphicElement, Style, Type};
use crate::pnrjson::{Chip, INextpnrJSON, IReportJSON, NextpnrJson, ReportJson};
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
    critical: Color,
}

pub type CellColorConfig = HashMap<String, Color>;

pub struct Renderer<'a, T> {
    architecture: Box<dyn Architecture<T>>,
    program: RenderingProgram,
    canvas: HtmlCanvasElement,

    graphic_elements: GraphicElements,
    graphic_elements_dirty: bool,
    webgl_elements: WebGlElements<'a>,
    webgl_elements_dirty: bool,

    colors: ColorConfig,
    cell_colors: CellColorConfig,

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

    Ok(context)
}

impl<'a, T> Renderer<'a, T> {
    pub fn new(
        canvas: HtmlCanvasElement,
        architecture: impl Architecture<T> + 'static,
        colors: ColorConfig,
        cell_colors: CellColorConfig,
    ) -> Result<Self> {
        let gl = create_rendering_context(&canvas)?;
        let program = RenderingProgram::new(gl)?;

        Ok(Self {
            architecture: Box::new(architecture),
            program,
            canvas,

            graphic_elements: HashMap::new(),
            graphic_elements_dirty: true,
            webgl_elements: vec![],
            webgl_elements_dirty: true,

            colors,
            cell_colors,

            scale: 15.0,
            offset: (-10.25, -25.1),
        })
    }

    pub fn render(&mut self) -> Result<()> {
        self.ensure_webgl_elements()?;

        let gl = self.program.get_gl();
        let canvas = &self.canvas;

        gl.viewport(0, 0, canvas.width() as i32, canvas.height() as i32);

        let bg_color = self.colors.background;
        gl.clear_color(
            bg_color.float_r(),
            bg_color.float_g(),
            bg_color.float_b(),
            1.0,
        );
        gl.clear(WebGl2RenderingContext::COLOR_BUFFER_BIT);

        // Draw rectangles before lines so that traces appear on top
        #[allow(clippy::borrowed_box)]
        let draw = |e: &Box<dyn WebGlElement<'a>>| -> Result<()> {
            e.draw(
                &self.program,
                self.offset.0,
                self.offset.1,
                self.scale,
                canvas.width() as f32,
                canvas.height() as f32,
            )
        };
        for elem in &self.webgl_elements {
            draw(elem)?
        }

        Ok(())
    }

    pub fn show_json(
        &mut self,
        obj: INextpnrJSON,
        report: Option<IReportJSON>,
        chip: Chip,
    ) -> Result<()> {
        self.ensure_graphic_elements();

        let json = NextpnrJson::from_jsobj(obj)?;
        let elems = json.get_elements(&chip);

        // parse report (if it exists) and extract critical path details
        let report = report.map(ReportJson::from_jsobj).transpose()?;
        let crit_routings = report.map_or(vec![], |r| {
            r.get_critical_netnames()
                .iter()
                .filter_map(|&n| json.get_netname(n))
                .flat_map(|n| n.get_routing(&chip))
                .collect()
        });
        let crit_wires: HashSet<&String> =
            HashSet::from_iter(crit_routings.iter().map(|r| &r.wire_id));
        let crit_pips: HashSet<&String> =
            HashSet::from_iter(crit_routings.iter().map(|r| &r.pip.name));

        let wire_map = self.graphic_elements.entry(ElementType::Wire).or_default();
        for wire in elems.wires {
            let Some(ge) = wire_map.get_mut(&wire) else {
                continue;
            };

            for g in ge {
                g.style = if crit_wires.contains(&wire) {
                    Style::CritPath
                } else {
                    Style::Active
                };
            }
        }

        let bel_map = self.graphic_elements.entry(ElementType::Bel).or_default();
        for bel in elems.bels {
            let Some(ge) = bel_map.get_mut(bel.nextpnr_bel) else {
                continue;
            };

            let cell_type = bel
                .cell_type
                .clone()
                .map_or(String::new(), |t| t.replace('$', ""));
            let color = self.cell_colors.get(&cell_type).copied();

            for g in ge {
                g.style = Style::Active;
                g.color = color;

                // Fill box if it can be traced back to a cell type
                if !cell_type.is_empty() {
                    g.r#type = Type::FilledBox;
                }
            }
        }

        let pip_map = self.graphic_elements.entry(ElementType::Pip).or_default();
        pip_map.clear();
        for pip in elems.pips {
            let Some(decal) =
                self.architecture
                    .find_pip_decal_by_loc_from_to(&pip.location, &pip.from, &pip.to)
            else {
                continue;
            };

            let mut ge = self.architecture.get_decal_graphics(&decal.decal);
            for g in ge.iter_mut() {
                g.style = if crit_pips.contains(&pip.name) {
                    Style::CritPath
                } else {
                    Style::Active
                };
            }
            pip_map.insert(decal.id, ge);
        }

        self.webgl_elements_dirty = true;

        self.render()?;
        Ok(())
    }

    pub fn zoom(&mut self, amt: f32, x: f32, y: f32) -> Result<()> {
        let mut amt = (-amt).exp();

        let old_scale = self.scale;
        self.scale *= amt;
        self.scale = self.scale.clamp(10.0, 4000.0);
        amt = self.scale / old_scale;
        if amt == 1.0 {
            return Ok(());
        };

        self.offset.0 -= x / (self.scale * amt) - x / self.scale;
        self.offset.1 -= y / (self.scale * amt) - y / self.scale;

        self.render()?;
        Ok(())
    }

    pub fn pan(&mut self, x: f32, y: f32) -> Result<()> {
        self.offset.0 -= x / self.scale;
        self.offset.1 -= y / self.scale;

        self.render()?;
        Ok(())
    }

    fn ensure_graphic_elements(&mut self) {
        if !self.graphic_elements_dirty {
            return;
        }

        // Wires
        let wire_decals = self.architecture.get_wire_decals();
        let wire_map = self.graphic_elements.entry(ElementType::Wire).or_default();
        for decal in wire_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            wire_map.insert(decal.id, g);
        }

        // BELs
        let bel_decals = self.architecture.get_bel_decals();
        let bel_map = self.graphic_elements.entry(ElementType::Bel).or_default();
        for decal in bel_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            bel_map.insert(decal.id, g);
        }

        // Groups
        let group_decals = self.architecture.get_group_decals();
        let group_map = self.graphic_elements.entry(ElementType::Group).or_default();
        for decal in group_decals {
            let g = self.architecture.get_decal_graphics(&decal.decal);
            group_map.insert(decal.id, g);
        }

        self.graphic_elements_dirty = false;
    }

    pub fn ensure_webgl_elements(&mut self) -> Result<()> {
        // Make sure graphic elements are updated first
        self.ensure_graphic_elements();

        if !self.webgl_elements_dirty {
            return Ok(());
        }

        let g_elems = self
            .graphic_elements
            .values()
            .flat_map(|h| h.values().flat_map(|g| g.iter()));

        self.webgl_elements = self.to_webgl_elements(g_elems)?;
        self.webgl_elements_dirty = false;

        Ok(())
    }

    fn get_elem_color(&self, style: &Style, orig_color: &Option<Color>) -> Option<Color> {
        match style {
            Style::Active => Some(orig_color.unwrap_or(self.colors.active)),
            Style::Inactive => Some(self.colors.inactive),
            Style::Frame => Some(self.colors.frame),
            Style::CritPath => Some(self.colors.critical),
            _ => None, // Hidden or some other style, cannot determine color
        }
    }

    fn to_webgl_elements<'b>(
        &self,
        ges: impl Iterator<Item = &'b GraphicElement>,
    ) -> Result<WebGlElements<'a>> {
        type Key = (Style, Type, Option<Color>);

        // Group elements by final draw state (style, type, resolved color).
        let mut groups: HashMap<Key, Vec<&GraphicElement>> = HashMap::new();
        for elem in ges {
            // Skip hidden or invalid early and compute resolved color once.
            let resolved = self.get_elem_color(&elem.style, &elem.color);
            if elem.style == Style::Hidden || resolved.is_none() {
                continue;
            }
            let key: Key = (elem.style, elem.r#type, resolved);
            groups.entry(key).or_default().push(elem);
        }

        let mut elems: HashMap<Key, WebGlElements> = HashMap::new();
        for (key, group) in groups.into_iter() {
            if group.is_empty() {
                continue;
            }
            let color = key.2.expect("color ensured above");

            let new_elem: Box<dyn WebGlElement<'a> + 'a>;
            if key.1 == Type::Box {
                // Pre-allocate: 4 line segments per box.
                let mut ls = Vec::with_capacity(group.len() * 4);
                for e in group {
                    let x1 = e.x1 as f32;
                    let x2 = e.x2 as f32;
                    let y1 = e.y1 as f32;
                    let y2 = e.y2 as f32;
                    ls.push(LineCoords { x1, x2, y1, y2: y1 });
                    ls.push(LineCoords { x1, x2, y1: y2, y2 });
                    ls.push(LineCoords { x1, x2: x1, y1, y2 });
                    ls.push(LineCoords { x1: x2, x2, y1, y2 });
                }
                new_elem = Box::new(Line::new(&self.program, ls, color)?);
            } else if key.1 == Type::FilledBox {
                let mut ls = Vec::with_capacity(group.len());
                for e in group {
                    ls.push(RectangleCoords {
                        x1: e.x1 as f32,
                        x2: e.x2 as f32,
                        y1: e.y1 as f32,
                        y2: e.y2 as f32,
                    });
                }
                new_elem = Box::new(Rectangle::new(&self.program, ls, color)?);
            } else {
                let mut ls = Vec::with_capacity(group.len());
                for e in group {
                    ls.push(LineCoords {
                        x1: e.x1 as f32,
                        y1: e.y1 as f32,
                        x2: e.x2 as f32,
                        y2: e.y2 as f32,
                    });
                }
                new_elem = Box::new(Line::new(&self.program, ls, color)?);
            }

            elems.entry(key).or_default().push(new_elem);
        }

        let res: WebGlElements = elems
            .into_iter()
            .sorted_by_key(|(key, _)| {
                (
                    // Draw order: Box-* -> Box-Active -> Line-* -> Line-Active
                    match key.1 {
                        Type::FilledBox => 0,
                        _ => 1,
                    },
                    match key.0 {
                        Style::CritPath => 2,
                        Style::Active => 1,
                        _ => 0,
                    },
                )
            })
            .flat_map(|(_, vec)| vec)
            .collect();
        Ok(res)
    }
}
