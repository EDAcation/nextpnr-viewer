use anyhow::Result;

use super::RenderingProgram;

#[derive(Clone, Hash, PartialEq, Eq)]
pub enum ElementType {
    Wire,
    Group,
    Bel,
    Pip,
}

pub trait WebGlElement<'a> {
    fn draw(
        &self,
        program: &RenderingProgram,
        offset_x: f32,
        offset_y: f32,
        scale: f32,
        canvas_width: f32,
        canvas_height: f32,
    ) -> Result<()>;
}
