
export class Line {
    private _vao: WebGLVertexArrayObject;
    private _vbo: WebGLBuffer;
    private _gl: WebGL2RenderingContext;
    private static _program?: WebGLProgram;

    private _amount: number;

    constructor(canvas: HTMLCanvasElement,
                lines: Array<{x1: number, x2: number, y1: number, y2: number}>,
                private _color: {r: number, g: number, b: number}) {
        const gl: WebGL2RenderingContext|null = canvas.getContext('webgl2');
        if (gl === null) throw 'webgl not supported';

        this._gl = gl;

        var vertexShaderSrc = `#version 300 es
        layout(location = 0) in vec2 position;

        out vec4 color;

        uniform vec2 u_offset;
        uniform float u_scale;
        uniform vec4 u_color;

        void main() {
            vec2 pos = vec2((position.x - u_offset.x) / 1280.0, (-position.y - u_offset.y) / 720.0);
            vec2 pos0to1 = pos * u_scale;
            vec2 posfull = pos0to1 * 2.0 - vec2(1, 1);
            gl_Position = vec4(posfull.x, -posfull.y, 0, 1);
            color = u_color;
        }
        `;

        var fragmentShaderSrc = `#version 300 es
        precision mediump float;

        in vec4 color;

        out vec4 outColor;

        void main() {
            outColor = color;
        }
        `;

        if (!Line._program) Line._program = createProgram(gl, vertexShaderSrc, fragmentShaderSrc);

        const vao = gl.createVertexArray();
        if (vao === null) throw 'unable to create vao';
        this._vao = vao;

        const vbo = gl.createBuffer();
        if (vbo === null) throw 'unable to create vbo';
        this._vbo = vbo;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        const verts = new Float32Array(lines.flatMap(l => [l.x1, l.y1, l.x2, l.y2]));
        this._amount = lines.length * 2; // 2 verts per line
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        gl.bindVertexArray(this._vao);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    public draw(offsetX: number, offsetY: number, scale: number): void {
        const gl = this._gl;
        if (Line._program === undefined) throw 'can\'t draw without a program';

        gl.useProgram(Line._program);

        const offLoc = gl.getUniformLocation(Line._program, 'u_offset');
        gl.uniform2f(offLoc, offsetX, offsetY);

        const scaleLoc = gl.getUniformLocation(Line._program, 'u_scale');
        gl.uniform1f(scaleLoc, scale);

        const colorLoc = gl.getUniformLocation(Line._program, 'u_color');
        gl.uniform4f(colorLoc, this._color.r, this._color.g, this._color.b, 1);

        gl.bindVertexArray(this._vao);
        gl.drawArrays(gl.LINES, 0, this._amount);
    }
}

function createProgram(gl: WebGL2RenderingContext, src1: string, src2: string) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    if (vertexShader === null || fragmentShader === null) throw 'unable to create shaders';

    gl.shaderSource(vertexShader, src1);
    gl.shaderSource(fragmentShader, src2);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vertexShader);
        throw `could not compile vertex shader ${info}`;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fragmentShader);
        throw `could not compile fragment shader ${info}`;
    }

    const program = gl.createProgram();
    if (program === null) throw 'could not create program';

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw 'could not link the program';
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return program;
}
