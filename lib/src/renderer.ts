import { Architecture } from './architecture/architecture';
import { GraphicElement } from './gfx/gfx';
import { Type as GraphicElementType } from './gfx/types';
import { Style as GraphicElementStyle } from './gfx/styles';
import { NextpnrJSON } from './pnr-json/pnr-json';
import { Renderer as RendererInterface, ColorConfig } from './renderer.interface';
import { Line } from './webgl/line';

type ElementType = 'wire'|'group'|'bel';

export class Renderer<T> implements RendererInterface {
    private animationFrameId?: number;

    private lines: Array<{line: Line, type: ElementType}> = [];

    constructor(
        private canvas: HTMLCanvasElement,
        private architecture: Architecture<T>,
        private _colors: ColorConfig,
        private _scale: number = 15,
        private _offX: number = -10.25,
        private _offY: number = -52.1,
        private _visibleWidth = 0,
        private _visibleHeight = 0,
        private _elements: {
            wire: Array<GraphicElement>,
            group: Array<GraphicElement>,
            bel: Array<GraphicElement>
        } = { wire: [], group: [], bel: [] },
        private _viewMode = { showWires: true, showGroups: true, showBels: true },
    ) {
        this._visibleWidth = this.canvas.width;
        this._visibleHeight = this.canvas.height;

        this.createGraphicElements();
    }

    public render(): void {
        if (this.animationFrameId) window.cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = window.requestAnimationFrame(() => {
            const gl: WebGL2RenderingContext|null = this.canvas.getContext('webgl2');
            if (!gl) throw 'couldnt get gl2 context';
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.clearColor(0.1568627450980392, 0.16470588235294117, 0.21176470588235294, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            this.lines.forEach(l => {
                if (this._viewMode.showWires && l.type === 'wire')
                    l.line.draw(this._offX, this._offY, this._scale, this.canvas.width, this.canvas.height)
                if (this._viewMode.showGroups && l.type === 'group')
                    l.line.draw(this._offX, this._offY, this._scale, this.canvas.width, this.canvas.height)
                if (this._viewMode.showBels && l.type === 'bel')
                    l.line.draw(this._offX, this._offY, this._scale, this.canvas.width, this.canvas.height)
            });

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
        NextpnrJSON.load(this.architecture, typeof json === 'string' ? JSON.parse(json) : json);
        this.createGraphicElements();
        this.render();
    }

    public changeViewMode(viewMode: {
        showWires?: boolean,
        showGroups?: boolean,
        showBels?: boolean,
    }) {
        if (viewMode.showWires !== undefined)    this._viewMode.showWires = viewMode.showWires;
        if (viewMode.showGroups !== undefined)   this._viewMode.showGroups = viewMode.showGroups;
        if (viewMode.showBels !== undefined)     this._viewMode.showBels = viewMode.showBels;

        this.render();
    }

    public get viewMode() {
        return Object.assign({}, this._viewMode); // Ensure readonly
    }

    private createGraphicElements() {
        this._elements.wire = this.architecture.getWireDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this._elements.bel = this.architecture.getBelDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this._elements.group = this.architecture.getGroupDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this.lines = [];
        this.lines = this.lines.concat(this.toLines(this._elements.bel).map(line => ({line, type: 'bel'})));
        this.lines = this.lines.concat(this.toLines(this._elements.group).map(line => ({line, type: 'group'})));
        this.lines = this.lines.concat(this.toLines(this._elements.wire).map(line => ({line, type: 'wire'})));
    }

    private toLines(ges: Array<GraphicElement>): Array<Line> {
        const groups = ges.filter((v, i, self) => self.findIndex(e => e.style === v.style && e.type === e.type) === i)
                          .map(g => ges.filter(e => e.style === g.style && e.type === g.type));
        
        const ret: Array<Line> = [];
        groups.forEach(g => {
            if (g.length === 0) return;
            if (g[0].type === GraphicElementType.Box) {
                const ls = g.flatMap(e => {
                    return [
                        {x1: e.x1, x2: e.x2, y1: e.y1, y2: e.y1},
                        {x1: e.x1, x2: e.x2, y1: e.y2, y2: e.y2},
                        {x1: e.x1, x2: e.x1, y1: e.y1, y2: e.y2},
                        {x1: e.x2, x2: e.x2, y1: e.y1, y2: e.y2},
                    ];
                });
                ret.push(new Line(this.canvas, ls, this.getColorObj(g[0].style)));
            } else {
                ret.push(new Line(this.canvas, g.map(g => ({x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2})), this.getColorObj(g[0].style)));
            }
        });
        return ret;
    }

    private getColorObj(style: GraphicElementStyle): {r: number, g: number, b: number} {
        const col = this.getColor(style).replace('#', '');
        const rstr = col.slice(0,2);
        const gstr = col.slice(2,4);
        const bstr = col.slice(4,6);

        return {r: parseInt(rstr, 16) / 255, g: parseInt(gstr, 16) / 255, b: parseInt(bstr, 16) / 255};
    }

    private getColor(style: GraphicElementStyle): string {
        switch (style) {
            case GraphicElementStyle.Active: return this._colors.active;
            case GraphicElementStyle.Inactive: return this._colors.inactive;
            case GraphicElementStyle.Frame: return this._colors.frame;
        }

        //return "#FF0000";
    }
}
