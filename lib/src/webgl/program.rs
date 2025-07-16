use anyhow::{bail, Result};
use web_sys::{WebGl2RenderingContext, WebGlProgram, WebGlShader, WebGlUniformLocation};

/** Default vertex shader source (GLSL)
    Expects a vertex buffer (VBO) with vec2 positions for each of the vertices as input.

    Also expects the following uniforms to be set:
     - u_canvas_size : A vec2 indicating the canvas size in pixels
     - u_offset      : A vec2 specifying the offset of the viewport
     - u_scale       : A float specifying the zoom level/scale of the viewport
     - u_color       : A vec4 specifying the color of the corresponding vertex.
                       This color is directly passed as an output to the fragment shader.
    @constant
    @type {string}
    @default
*/
const DEFAULT_VERTEX_SRC: &str = "#version 300 es
layout(location = 0) in vec2 position;

out vec4 color;

uniform vec2 u_canvas_size;
uniform vec2 u_offset;
uniform float u_scale;
uniform vec4 u_color;

void main() {
    vec2 pos = vec2((position.x - u_offset.x) / u_canvas_size.x, (-position.y - u_offset.y) / u_canvas_size.y);
    vec2 pos0to1 = pos * u_scale;
    vec2 posfull = pos0to1 * 2.0 - vec2(1, 1);
    gl_Position = vec4(posfull.x, -posfull.y, 0, 1);
    color = u_color;
}
";

/** Default fragment shader (GLSL)

    Takes in a color from the vertex shader and uses that directly to color the fragment.
    @constant
    @type {string}
    @default
*/
const DEFAULT_FRAGMENT_SRC: &str = "#version 300 es
precision mediump float;

in vec4 color;

out vec4 outColor;

void main() {
    outColor = color;
}
";

enum ShaderType {
    Vertex,
    Fragment,
}

impl ShaderType {
    fn to_gl_type(&self) -> u32 {
        match self {
            ShaderType::Vertex => WebGl2RenderingContext::VERTEX_SHADER,
            ShaderType::Fragment => WebGl2RenderingContext::FRAGMENT_SHADER,
        }
    }

    fn to_string(&self) -> &str {
        match self {
            ShaderType::Vertex => "vertex",
            ShaderType::Fragment => "fragment",
        }
    }
}

fn compile_shader(
    context: &WebGl2RenderingContext,
    source: &str,
    r#type: ShaderType,
) -> Result<WebGlShader> {
    // Create the shader
    let Some(shader) = context.create_shader(r#type.to_gl_type()) else {
        bail!(
            "CREATE_SHADER_FAILED: Call to create_shader failed, unable to create {} shader object",
            r#type.to_string()
        );
    };

    // add source to shader and compile it
    context.shader_source(&shader, source);
    context.compile_shader(&shader);

    // Check whether compilation was succesful and return an error if it wasn't
    if context
        .get_shader_parameter(&shader, WebGl2RenderingContext::COMPILE_STATUS)
        .is_falsy()
    {
        let info = context.get_shader_info_log(&shader).unwrap_or_default();

        bail!(
            "SHADER_COMPILATION_FAILED: Failed to compile {} shader:\n{}",
            r#type.to_string(),
            info
        );
    }

    Ok(shader)
}

fn link_shaders(
    context: &WebGl2RenderingContext,
    vertex: WebGlShader,
    fragment: WebGlShader,
) -> Result<WebGlProgram> {
    // Create new program
    let Some(program) = context.create_program() else {
        bail!("CREATE_PROGRAM_FAILED: Call to create_program failed, unable to create shader program object");
    };

    // Attach shaders
    context.attach_shader(&program, &vertex);
    context.attach_shader(&program, &fragment);

    // Link the program
    context.link_program(&program);

    // Check whether linking was succesful and return an error if it wasn't
    if context
        .get_program_parameter(&program, WebGl2RenderingContext::LINK_STATUS)
        .is_falsy()
    {
        let info = context.get_program_info_log(&program).unwrap_or_default();

        bail!("SHADER_LINK_FAILED: Failed to link program:\n{}", info);
    }

    Ok(program)
}

pub struct RenderingProgram {
    context: WebGl2RenderingContext,
    program: WebGlProgram,
}

impl RenderingProgram {
    pub fn new(context: WebGl2RenderingContext) -> Result<Self> {
        let vertex_shader = compile_shader(&context, DEFAULT_VERTEX_SRC, ShaderType::Vertex)?;
        let fragment_shader = compile_shader(&context, DEFAULT_FRAGMENT_SRC, ShaderType::Fragment)?;
        let program = link_shaders(&context, vertex_shader, fragment_shader)?;

        Ok(RenderingProgram { context, program })
    }

    pub fn get_gl(&self) -> &WebGl2RenderingContext {
        &self.context
    }

    /** Marks the program for use on the context that was passed in the constructor */
    pub fn r#use(&self) {
        self.context.use_program(Some(&self.program));
    }

    /** Sets a float uniform by name */
    pub fn set_uniform_float(&self, name: &String, a: f32) -> Result<()> {
        let location = self.get_uniform_location(name)?;
        self.context.uniform1f(Some(&location), a);
        Ok(())
    }

    /** Sets a Vec2f uniform by name */
    pub fn set_uniform_vec_2f(&self, name: &String, a: f32, b: f32) -> Result<()> {
        let location = self.get_uniform_location(name)?;
        self.context.uniform2f(Some(&location), a, b);
        Ok(())
    }

    /** Sets a Vec3f uniform by name */
    #[allow(dead_code)]
    pub fn set_uniform_vec_3f(&self, name: &String, a: f32, b: f32, c: f32) -> Result<()> {
        let location = self.get_uniform_location(name)?;
        self.context.uniform3f(Some(&location), a, b, c);
        Ok(())
    }

    /** Sets a Vec4f uniform by name */
    pub fn set_uniform_vec_4f(&self, name: &String, a: f32, b: f32, c: f32, d: f32) -> Result<()> {
        let location = self.get_uniform_location(name)?;
        self.context.uniform4f(Some(&location), a, b, c, d);
        Ok(())
    }

    fn get_uniform_location(&self, name: &String) -> Result<WebGlUniformLocation> {
        let Some(location) = self.context.get_uniform_location(&self.program, name) else {
            bail!(
                "SET_UNIFORM_FAILED: Failed to lookup location of uniform '{}'",
                name
            );
        };

        Ok(location)
    }
}
