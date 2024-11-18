use anyhow::{bail, Result};
use web_sys::{js_sys, WebGl2RenderingContext, WebGlBuffer, WebGlVertexArrayObject};

use crate::gfx::Color;

use super::{
    types::{ElementType, WebGlElement},
    RenderingProgram,
};

/** Struct for rendering rectangle primitives

    This is a helper class for webgl to render rectangle primitives.

    The constructor takes in a rendering context and an array of rectangles plus a color.
    It then creates a Vertex buffer (GPU memory to store the locations of the rectangles)
    and a Vertex array (OpenGL state object that contains settings and the layout of the GPU memory).

    The draw() method passes some additional configruation about the viewport to the GPU
    and then batch renders all the rectangles that were passed in the constructor.

    For optimal performance try to batch as many rectangles in an object of this class as possible,
    because that allows the GPU to do as much of it as possible in parallel.
*/
pub struct RectangleCoords {
    pub x1: f32,
    pub x2: f32,
    pub y1: f32,
    pub y2: f32,
}

pub struct Rectangle {
    r#type: Option<ElementType>,

    color: Color,

    vao: WebGlVertexArrayObject,
    ebo: WebGlBuffer,

    amount: i32,
}

impl Rectangle {
    pub fn new(
        program: &RenderingProgram,
        rects: Vec<RectangleCoords>,
        color: Color,
    ) -> Result<Self> {
        let gl = program.get_gl();

        // Create vertex array object
        let Some(vao) = gl.create_vertex_array() else {
            bail!("Unable to create vao");
        };

        // Create vertex buffer object
        let Some(vbo) = gl.create_buffer() else {
            bail!("Unable to create vbo");
        };

        // Create element buffer object
        let Some(ebo) = gl.create_buffer() else {
            bail!("Unable to create ebo");
        };

        // Setup the data
        gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, Some(&vbo));
        let verts_data: Vec<f32> = rects
            .iter()
            .flat_map(|l| {
                [
                    l.x1, l.y1, // Vertex 0: Bottom left
                    l.x2, l.y1, // Vertex 1: Bottom right
                    l.x1, l.y2, // Vertex 2: Top left
                    l.x2, l.y2, // Vertex 3: Top right
                ]
            })
            .collect();
        // Pass it to the GPU
        // Unsafe because Float32Array::view creates a raw view into our wasm memory buffer.
        // Do NOT do any memory allocations before 'verts' is dropped.
        unsafe {
            let verts = js_sys::Float32Array::view(&verts_data[..]);
            gl.buffer_data_with_array_buffer_view(
                WebGl2RenderingContext::ARRAY_BUFFER,
                &verts,
                WebGl2RenderingContext::STATIC_DRAW,
            );
        }

        // Setup the indices and pass them to the element array buffer
        gl.bind_buffer(WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER, Some(&ebo));
        // A rectangle consist of two triangles
        // +--------+
        // |       /|
        // |  2   / |
        // |     /  |
        // |    /   |
        // |   /    |
        // |  /     |
        // | /   1  |
        // |/       |
        // +--------+
        let indices_data: Vec<f32> = (0..rects.len())
            .flat_map(|index| {
                [
                    (0 + 4 * index) as f32,
                    (1 + 4 * index) as f32,
                    (3 + 4 * index) as f32, // Triangle 1
                    (3 + 4 * index) as f32,
                    (2 + 4 * index) as f32,
                    (0 + 4 * index) as f32, // Triangle 2
                ]
            })
            .collect();
        let amount = rects.len() * 6; // 6 elements per rectangle

        // Pass it to the GPU
        // Unsafe because Float32Array::view creates a raw view into our wasm memory buffer.
        // Do NOT do any memory allocations before 'verts' is dropped.
        unsafe {
            let indices = js_sys::Float32Array::view(&indices_data[..]);
            gl.buffer_data_with_array_buffer_view(
                WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER,
                &indices,
                WebGl2RenderingContext::STATIC_DRAW,
            );
        }

        gl.bind_vertex_array(Some(&vao));
        gl.enable_vertex_attrib_array(0);

        // This specifies the layout of the data in the vertex buffer to the gpu
        // The vertices are packed tightly as 2 float vectors, i.e. the gpu memory looks like:
        // [v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, ...etc]
        // index is 0 (which corresponds to the layout(location = 0) in the vertex shader, see program.ts:defaultVertexSource).
        // Data is not normalized to screen coordinates, we have custom logic for that in the
        // vertex shader to handle with zooming and panning.
        gl.vertex_attrib_pointer_with_f64(0, 2, WebGl2RenderingContext::FLOAT, false, 0, 0.0);

        // Reset bindings, technically not required, but can prevent nasty bugs once more vertex
        // arrays are used in the same rendering context.
        gl.bind_buffer(WebGl2RenderingContext::ARRAY_BUFFER, None);
        gl.bind_buffer(WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER, None);
        gl.bind_vertex_array(None);

        return Ok(Rectangle {
            r#type: None,
            color,
            vao,
            ebo,
            amount: amount.try_into().unwrap(),
        });
    }
}

impl WebGlElement<'_> for Rectangle {
    fn set_type(&mut self, r#type: ElementType) {
        self.r#type = Some(r#type);
    }

    fn get_type(&self) -> Option<&ElementType> {
        return self.r#type.as_ref();
    }

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
            self.color.r as f32,
            self.color.g as f32,
            self.color.b as f32,
            1.0,
        )?;

        gl.bind_vertex_array(Some(&self.vao));
        gl.bind_buffer(
            WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER,
            Some(&self.ebo),
        );
        gl.draw_elements_with_f64(
            WebGl2RenderingContext::TRIANGLES,
            self.amount,
            WebGl2RenderingContext::UNSIGNED_INT,
            0.0,
        );

        return Ok(());
    }
}
