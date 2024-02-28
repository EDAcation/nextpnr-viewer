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
const defaultVertexSource: string = `#version 300 es
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
`;

/** Default fragment shader (GLSL)

    Takes in a color from the vertex shader and uses that directly to color the fragment.
    @constant
    @type {string}
    @default
*/
const defaultFragmentSource: string = `#version 300 es
precision mediump float;

in vec4 color;

out vec4 outColor;

void main() {
    outColor = color;
}
`;

enum ShaderType {
    Vertex,
    Fragment,
}

function shaderTypeToGlType(type: ShaderType): number {
    switch (type) {
        case ShaderType.Vertex:
            return WebGL2RenderingContext.VERTEX_SHADER;
        case ShaderType.Fragment:
            return WebGL2RenderingContext.FRAGMENT_SHADER;
    }
}

function shaderTypeToString(type: ShaderType): "vertex" | "fragment" {
    switch (type) {
        case ShaderType.Vertex:
            return "vertex";
        case ShaderType.Fragment:
            return "fragment";
    }
}

/** Name describing the type of error */
export type ErrorName = 'CREATE_SHADER_FAILED'
                      | 'SHADER_COMPILATION_FAILED'
                      | 'CREATE_PROGRAM_FAILED'
                      | 'SHADER_LINK_FAILED'
                      | 'SET_UNIFORM_FAILED';

/** Common error class for all errors thrown by this modules Program class */
export class WebGlProgramError extends Error {
    name: ErrorName;
    message: string;

    constructor(name: ErrorName, message: string) {
        super();
        this.name = name;
        this.message = message;
    }
}

/** High level wrapper around a WebGLProgram

    # Examples
    ```ts
    const program = new Program(glContext, vertexSource, FragmentSource);
    program.use();
    program.setUniformVec2f('u_offset', 10, 20);
    glContext.drawArrays(glContext.LINES, 0, 2);
    ```
*/
export class Program {
    private context: WebGL2RenderingContext;
    private program: WebGLProgram;

    constructor(glContext: WebGL2RenderingContext,
                vertexSource: string = defaultVertexSource, 
                fragmentSource: string = defaultFragmentSource) {
        this.context = glContext;

        const vertexShader = this.compileShader(vertexSource, ShaderType.Vertex);
        const fragmentShader = this.compileShader(fragmentSource, ShaderType.Fragment);

        this.program = this.linkShaders(vertexShader, fragmentShader);
    }

    /** Marks the program for use on the context that was passed in the constructor */
    public use() {
        this.context.useProgram(this.program);
    }

    /** Sets a float uniform by name */
    public setUniformFloat(name: string, a: number) {
        const location = this.getUniformLocation(name);
        this.context.uniform1f(location, a);
    }

    /** Sets a Vec2f uniform by name */
    public setUniformVec2f(name: string, a: number, b: number) {
        const location = this.getUniformLocation(name);
        this.context.uniform2f(location, a, b);
    }

    /** Sets a Vec3f uniform by name */
    public setUniformVec3f(name: string, a: number, b: number, c: number) {
        const location = this.getUniformLocation(name);
        this.context.uniform3f(location, a, b, c);
    }

    /** Sets a Vec4f uniform by name */
    public setUniformVec4f(name: string, a: number, b: number, c: number, d: number) {
        const location = this.getUniformLocation(name);
        this.context.uniform4f(location, a, b, c, d);
    }

    private getUniformLocation(name: string): WebGLUniformLocation {
        const location = this.context.getUniformLocation(this.program, name);
        
        if (location === null) {
            throw new WebGlProgramError(
                'SET_UNIFORM_FAILED',
                `Failed to lookup location of uniform "${name}"`
            );
        }

        return location;
    }

    private compileShader(source: string, type: ShaderType): WebGLShader {
        // Create the shader
        const shader = this.context.createShader(shaderTypeToGlType(type));

        if (shader === null) {
            const typeString = shaderTypeToString(type);

            throw new WebGlProgramError(
                'CREATE_SHADER_FAILED',
                `Call to createShader failed, unable to create ${typeString} shader object`
            );
        }

        // Add the source to the shader and compile it
        this.context.shaderSource(shader, source);
        this.context.compileShader(shader);

        // Check whether compilation was succesful and throw an error if it wasn't
        if (!this.context.getShaderParameter(shader, this.context.COMPILE_STATUS)) {
            const info = this.context.getShaderInfoLog(shader);
            const typeString = shaderTypeToString(type);

            throw new WebGlProgramError(
                'SHADER_COMPILATION_FAILED',
                `Failed to compile ${typeString} shader:\n${info}`
            );
        }

        return shader;
    }

    private linkShaders(vertex: WebGLShader, fragment: WebGLShader): WebGLProgram {
        // Create the shader
        const program = this.context.createProgram();

        if (program === null) {
            throw new WebGlProgramError(
                'CREATE_PROGRAM_FAILED',
                `Call to createProgram failed, unable to create shader program object`
            );
        }

        // Attach the shaders to the program
        this.context.attachShader(program, vertex);
        this.context.attachShader(program, fragment);

        // Link the program
        this.context.linkProgram(program);

        // Check whether linking was succesful and throw an error if it wasn't
        if (!this.context.getProgramParameter(program, this.context.LINK_STATUS)) {
            const info = this.context.getProgramInfoLog(program);

            throw new WebGlProgramError(
                'SHADER_LINK_FAILED',
                `Failed to link program:\n${info}`
            );
        }

        return program;
    }
}
