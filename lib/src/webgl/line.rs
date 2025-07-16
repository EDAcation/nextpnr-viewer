use anyhow::{bail, Result};
use web_sys::{js_sys, WebGl2RenderingContext, WebGlVertexArrayObject};

use crate::gfx::Color;

use super::{types::WebGlElement, RenderingProgram};

/** Struct for rendering line primitives

    This is a helper class for webgl to render line primitives.

    The constructor takes in a rendering context and an array of lines plus a color.
    It then creates a Vertex buffer (GPU memory to store the locations of the lines)
    and a Vertex array (OpenGL state object that contains settings and the layout of the GPU memory).

    The draw() method passes some additional configruation about the viewport to the GPU
    and then batch renders all the lines that were passed in the constructor.

    For optimal performance try to batch as many lines in an object of this class as possible,
    because that allows the GPU to do as much of it as possible in parallel.
*/
pub struct LineCoords {
    pub x1: f32,
    pub x2: f32,
    pub y1: f32,
    pub y2: f32,
}

pub struct Line {
    color: Color,

    vao: WebGlVertexArrayObject,
    amount: i32,
}

impl Line {
    pub fn new(program: &RenderingProgram, lines: Vec<LineCoords>, color: Color) -> Result<Self> {
        let gl = program.get_gl();

        // Create vertex array object
        let Some(vao) = gl.create_vertex_array() else {
            bail!("Unable to create vao");
        };

        // Create vertex buffer object
        let Some(vbo) = gl.create_buffer() else {
            bail!("Unable to create vbo");
        };

        // Setup the data
        gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&vbo));
        let amount = lines.len() * 2; // 2 verts per line
        let vertex_data: Vec<f32> = lines
            .into_iter()
            .flat_map(|l| [l.x1, l.y1, l.x2, l.y2])
            .collect();

        // Pass it to the GPU
        // Unsafe because Float32Array::view creates a raw view into our wasm memory buffer.
        // Do NOT do any memory allocations before 'verts' is dropped.
        unsafe {
            let verts = js_sys::Float32Array::view(&vertex_data[..]);
            gl.buffer_data_with_array_buffer_view(
                WebGl2RenderingContext::ARRAY_BUFFER,
                &verts,
                WebGl2RenderingContext::STATIC_DRAW,
            );
        }

        gl.bind_vertex_array(Some(&vao));
        gl.enable_vertex_attrib_array(0);

        // This specifies the layout of the data in the vertex buffer to the gpu
        // The vertices are packed tightly as 2 float vectors, i.e. the gpu memory looks like:
        // [v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, ...etc]
        // index is 0 (which corresponds to the layout(location = 0) in the vertex shader, see program.rs:DEFAULT_VECTOR_SRC).
        // Data is not normalized to screen coordinates, we have custom logic for that in the
        // vertex shader to handle with zooming and panning.
        gl.vertex_attrib_pointer_with_f64(0, 2, WebGl2RenderingContext::FLOAT, false, 0, 0.0);

        // Reset bindings, technically not required, but can prevent nasty bugs once more vertex
        // arrays are used in the same rendering context.
        gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, None);
        gl.bind_vertex_array(None);

        Ok(Self {
            color,
            amount: amount.try_into().unwrap(),
            vao,
        })
    }
}

impl WebGlElement<'_> for Line {
    fn draw(
        &self,
        program: &RenderingProgram,
        offset_x: f32,
        offset_y: f32,
        scale: f32,
        canvas_width: f32,
        canvas_height: f32,
    ) -> Result<()> {
        let gl = program.get_gl();

        program.r#use();
        program.set_uniform_vec_2f(&"u_canvas_size".to_string(), canvas_width, canvas_height)?;
        program.set_uniform_vec_2f(&"u_offset".to_string(), offset_x, offset_y)?;
        program.set_uniform_float(&"u_scale".to_string(), scale)?;
        program.set_uniform_vec_4f(
            &"u_color".to_string(),
            self.color.float_r(),
            self.color.float_g(),
            self.color.float_b(),
            1.0,
        )?;

        gl.bind_vertex_array(Some(&self.vao));
        gl.draw_arrays(WebGl2RenderingContext::LINES, 0, self.amount);

        Ok(())
    }
}
