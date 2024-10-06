import {type Program} from './program';

export type ElementType = 'wire' | 'group' | 'bel' | 'pip';

export abstract class WebGLElement {
    private _gl: WebGL2RenderingContext; // Rendering context
    private _program: Program; // Rendering program

    private _type: ElementType | null;

    constructor(gl: WebGL2RenderingContext, program: Program) {
        this._gl = gl;
        this._program = program;

        this._type = null;
    }

    protected get gl(): WebGL2RenderingContext {
        return this._gl;
    }

    protected get program(): Program {
        return this._program;
    }

    public get type(): ElementType | null {
        return this._type;
    }

    public set type(type: ElementType | null) {
        this._type = type;
    }

    abstract draw(offsetX: number, offsetY: number, scale: number, canvasWidth: number, canvasHeight: number): void;
}
