import {type Program} from './program';
import {WebGLElement} from './webgl';

/** Class for rendering line primitives

    This is a helper class for webgl to render line primitives.

    The constructor takes in a rendering context and an array of lines plus a color.
    It then creates a Vertex buffer (GPU memory to store the locations of the lines)
    and a Vertex array (OpenGL state object that contains settings and the layout of the GPU memory).
    
    The draw() method passes some additional configruation about the viewport to the GPU
    and then batch renders all the lines that were passed in the constructor.

    For optimal performance try to batch as many lines in an object of this class as possible,
    because that allows the GPU to do as much of it as possible in parallel.
*/
export class Line extends WebGLElement {
    private _vao: WebGLVertexArrayObject; // Vertex array object
    private _vbo: WebGLBuffer; // Vertex buffer object

    private _amount: number;

    constructor(
        gl: WebGL2RenderingContext,
        program: Program,
        lines: Array<{x1: number; x2: number; y1: number; y2: number}>,
        private _color: {r: number; g: number; b: number}
    ) {
        super(gl, program);

        // Create vertex array object
        const vao = gl.createVertexArray();
        if (vao === null) throw 'unable to create vao';
        this._vao = vao;

        // Create vertex buffer object
        const vbo = gl.createBuffer();
        if (vbo === null) throw 'unable to create vbo';
        this._vbo = vbo;

        // Setup the data and pass it to the GPU using gl.bufferData()
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        const verts = new Float32Array(lines.flatMap((l) => [l.x1, l.y1, l.x2, l.y2]));
        this._amount = lines.length * 2; // 2 verts per line
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        gl.bindVertexArray(this._vao);
        gl.enableVertexAttribArray(0);
        // This specifies the layout of the data in the vertex buffer to the gpu
        // The vertices are packed tightly as 2 float vectors, i.e. the gpu memory looks like:
        // [v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, ...etc]
        // index is 0 (which corresponds to the layout(location = 0) in the vertex shader, see program.ts:defaultVertexSource).
        // Data is not normalized to screen coordinates, we have custom logic for that in the
        // vertex shader to handle with zooming and panning.
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // Reset bindings, technically not required, but can prevent nasty bugs once more vertex
        // arrays are used in the same rendering context.
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public draw(offsetX: number, offsetY: number, scale: number, canvasWidth: number, canvasHeight: number): void {
        const gl = this.gl;

        this.program.use();
        this.program.setUniformVec2f('u_canvas_size', canvasWidth, canvasHeight);
        this.program.setUniformVec2f('u_offset', offsetX, offsetY);
        this.program.setUniformFloat('u_scale', scale);
        this.program.setUniformVec4f('u_color', this._color.r, this._color.g, this._color.b, 1);

        gl.bindVertexArray(this._vao);
        gl.drawArrays(gl.LINES, 0, this._amount);
    }
}
