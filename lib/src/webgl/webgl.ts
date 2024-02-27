import {type Program} from './program';

export abstract class WebGLElement {
    private _gl: WebGL2RenderingContext;  // Rendering context
    private _program: Program;            // Rendering program

    constructor(gl: WebGL2RenderingContext, program: Program) {
        this._gl = gl;
        this._program = program;
    }

    protected get gl(): WebGL2RenderingContext {
        return this._gl;
    }

    protected get program(): Program {
        return this._program;
    }

    abstract draw(offsetX: number, offsetY: number, scale: number, canvasWidth: number, canvasHeight: number): void;
}
