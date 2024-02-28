import { Architecture } from './architecture/architecture';
import { GraphicElement } from './gfx/gfx';
import { Type as GraphicElementType } from './gfx/types';
import { Style as GraphicElementStyle } from './gfx/styles';
import { NextpnrJSON } from './pnr-json/pnr-json';
import { Renderer as RendererInterface, ColorConfig } from './renderer.interface';
import { Line } from './webgl/line';
import { Program } from './webgl/program';
import { WebGLElement, ElementType } from './webgl/webgl';
import { getElementGroup } from 'edacation';
import { Rectangle } from './webgl/rectangle';

type Elements = {
    [key in ElementType]: Record<string, GraphicElement[]>
}

export class Renderer<T> implements RendererInterface {
    private animationFrameId?: number;

    private _gl: WebGL2RenderingContext;
    private _renderingProgram: Program;
    private _elements: Elements;
    private _colorCanvasCtx: CanvasRenderingContext2D | null;

    private _renderingElems: WebGLElement[];

    constructor(
        private canvas: HTMLCanvasElement,
        private architecture: Architecture<T>,
        private _colors: ColorConfig,
        private _scale: number = 15,
        private _offX: number = -10.25,
        private _offY: number = -52.1,
        private _visibleWidth = 0,
        private _visibleHeight = 0,
        private _viewMode = { showWires: true, showGroups: true, showBels: true },
    ) {
        const gl: WebGL2RenderingContext|null = this.canvas.getContext('webgl2');
        if (!gl) throw 'couldnt get gl2 context';

        this._gl = gl;
        this._renderingProgram = new Program(this._gl);

        this._visibleWidth = this.canvas.width;
        this._visibleHeight = this.canvas.height;

        this._elements = this.createGraphicElements();
        this._renderingElems = this._updateWebGLElements();

        this._colorCanvasCtx = document.createElement('canvas').getContext('2d');
    }

    public render(): void {
        if (this.animationFrameId) window.cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = window.requestAnimationFrame(() => {
            this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

            const bgColor = this.colorStrToObj(this._colors.background);
            this._gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1.0);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);

            for (const elem of this._renderingElems) {
                if (elem.type === 'wire' && !this._viewMode.showWires) continue;
                if ((elem.type === 'group' || elem.type === 'pip') && !this._viewMode.showGroups) continue;
                if (elem.type === 'bel' && !this._viewMode.showBels) continue;

                elem.draw(this._offX, this._offY, this._scale, this.canvas.width, this.canvas.height);
            }

            this.animationFrameId = undefined;
        });
    }

    public zoom(amt: number, x: number, y: number) {
        amt = Math.exp(-amt);

        const oldScale = this._scale;
        this._scale *= amt;
        this._scale = Math.min(4000, Math.max(10, this._scale));
        amt = this._scale / oldScale;
        if (amt === 1) return;

        this._offX -= x/(this._scale*amt) - x/this._scale;
        this._offY -= y/(this._scale*amt) - y/this._scale;

        this._visibleWidth = this.canvas.width / this._scale;
        this._visibleHeight = this.canvas.height / this._scale;

        this.render();
    }

    public pan(x: number, y: number) {
        this._offX -= x / this._scale;
        this._offY -= y / this._scale;

        this.render();
    }

    public loadJson(json: string|object) {
        const active = NextpnrJSON.load(typeof json === 'string' ? JSON.parse(json) : json);

        active.wire.forEach(w => {
            const ge = this._elements.wire[w];
            if (ge === undefined) {
                return;
            }
            ge.forEach(ge => ge.style = GraphicElementStyle.Active);
        });

        active.bel.forEach(w => {
            const ge = this._elements.bel[w.nextpnrBel];
            if (ge === undefined) {
                return;
            }
            const cellName = w.origType?.replace("$", "") || "";
            const elemColor = getElementGroup(cellName)?.color || null;
            ge.forEach(ge => {
                ge.style = GraphicElementStyle.Active;
                ge.color = elemColor;

                // Only fill BELs that we can actually trace back to a cell
                if (cellName) ge.type = GraphicElementType.FilledBox;
            });
        });

        this._elements.pip = {};
        active.pip.forEach(({location, pip_from, pip_to, pip_name}) => {
            const pip_decal = this.architecture.findPipDecalByLocFromTo(location, pip_from, pip_to);
            if (!pip_decal) {
                console.warn(
                    `Could not find pip decal ${pip_name}: 
                    ${JSON.stringify(location)} - ${JSON.stringify(pip_from)} - ${JSON.stringify(pip_to)}`
                    )
                return;
            }

            let ges = this.architecture.getDecalGraphics(pip_decal.decal);
            ges.forEach(ge => ge.style = GraphicElementStyle.Active);

            this._elements.pip[pip_decal.id] = ges;
        });

        this._renderingElems = this._updateWebGLElements();
        
        this.render();
    }

    public changeViewMode(viewMode: {
        showWires?: boolean,
        showGroups?: boolean,
        showBels?: boolean,
    }) {
        if (viewMode.showWires !== undefined)  this._viewMode.showWires = viewMode.showWires;
        if (viewMode.showGroups !== undefined) this._viewMode.showGroups = viewMode.showGroups;
        if (viewMode.showBels !== undefined)   this._viewMode.showBels = viewMode.showBels;
    }

    public get viewMode() {
        return Object.assign({}, this._viewMode); // Ensure readonly
    }

    private createGraphicElements(): Elements {
        const elements: Elements = {
            wire: {},
            bel: {},
            group: {},
            pip: {}
        };

        this.architecture.getWireDecals().forEach(decal => {
            const graphics = this.architecture.getDecalGraphics(decal.decal);
            elements.wire[decal.id] = graphics;
        });

        this.architecture.getBelDecals().forEach(decal => {
            const graphics = this.architecture.getDecalGraphics(decal.decal);
            elements.bel[decal.id] = graphics;
        });

        this.architecture.getGroupDecals().forEach(decal => {
            const graphics = this.architecture.getDecalGraphics(decal.decal);
            elements.group[decal.id] = graphics;
        });

        // this.architecture.getPipDecals().forEach(decal => {
        //     elements.pip[decal.id] = this.architecture.getDecalGraphics(decal.decal);
        // });

        return elements;
    }

    private toWebGLElements(ges: Array<GraphicElement>): WebGLElement[] {
        const groups = ges.filter((v, i, self) =>
            self.findIndex(e => e.style === v.style && e.type === v.type && e.color === v.color) === i
        ).map(g =>
            ges.filter(e => e.style === g.style && e.type === g.type && e.color === g.color)
        );

        const ret: WebGLElement[] = [];
        groups.forEach(g => {
            if (g.length === 0 || g[0].style === GraphicElementStyle.Hidden) return;
            if (g[0].type === GraphicElementType.Box) {
                const ls = g.flatMap(e => {
                    return [
                        {x1: e.x1, x2: e.x2, y1: e.y1, y2: e.y1},
                        {x1: e.x1, x2: e.x2, y1: e.y2, y2: e.y2},
                        {x1: e.x1, x2: e.x1, y1: e.y1, y2: e.y2},
                        {x1: e.x2, x2: e.x2, y1: e.y1, y2: e.y2},
                    ];
                });
                ret.push(new Line(
                    this._gl, this._renderingProgram,
                    ls, this.getColorObj(g[0])
                ));
            } else if (g[0].type === GraphicElementType.FilledBox) {
                ret.push(new Rectangle(
                    this._gl, this._renderingProgram,
                    g.map(e => ({x1: e.x1, x2: e.x2, y1: e.y1, y2: e.y2})), this.getColorObj(g[0])
                ));
            } else {
                ret.push(new Line(
                    this._gl, this._renderingProgram,
                    g.map(g => ({x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2})), this.getColorObj(g[0])
                ));
            }
        });
        return ret;
    }

    private colorStrToObj(col: string): {r: number, g: number, b: number} {
        // Normalize CSS color names to hex
        if (this._colorCanvasCtx) {
            this._colorCanvasCtx.fillStyle = col;
            col = this._colorCanvasCtx.fillStyle;
        }

        col = col.replace('#', '');
        const rstr = col.slice(0,2);
        const gstr = col.slice(2,4);
        const bstr = col.slice(4,6);

        return {r: parseInt(rstr, 16) / 255, g: parseInt(gstr, 16) / 255, b: parseInt(bstr, 16) / 255};
    }

    private getColorObj(elem: GraphicElement): {r: number, g: number, b: number} {
        const col = this.getColor(elem);
        return this.colorStrToObj(col);
    }

    private getColor(elem: GraphicElement): string {
        switch (elem.style) {
            case GraphicElementStyle.Active: return elem.color || this._colors.active;
            case GraphicElementStyle.Inactive: return this._colors.inactive;
            case GraphicElementStyle.Frame: return this._colors.frame;
            case GraphicElementStyle.Hidden: throw 'can not color a hidden element!';
        }
    }

    private _updateWebGLElements(): WebGLElement[] {
        let newElements: WebGLElement[] = [];

        for (let typeKey in this._elements) {
            const type = <ElementType>typeKey;

            const elem = this._elements[type];
            const webGLElems = this.toWebGLElements(Object.values(elem).flat());
            webGLElems.forEach(elem => elem.type = type);

            newElements.push(...webGLElems);
        }

        return newElements;
    }
}
