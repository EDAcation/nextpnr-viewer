import { Architecture } from './architecture/architecture';
import { GraphicElement } from './gfx/gfx';
import { Type as GraphicElementType } from './gfx/types';
import { Style as GraphicElementStyle } from './gfx/styles';
import { NextpnrJSON } from './pnr-json/pnr-json';
import { Renderer as RendererInterface, ColorConfig } from './renderer.interface';

export class Renderer<T> implements RendererInterface {
    private animationFrameId?: number;

    constructor(
        private context: CanvasRenderingContext2D,
        private architecture: Architecture<T>,
        private _colors: ColorConfig,
        private _scale: number = 15,
        private _offX: number = -10.25,
        private _offY: number = -52.1,
        private _visibleWidth = 0,
        private _visibleHeight = 0,
        private _elements: {
            wire: Array<GraphicElement>,
            long_wire: Array<GraphicElement>,
            group: Array<GraphicElement>,
            bel: Array<GraphicElement>
        } = { wire: [], long_wire: [], group: [], bel: [] },
        private _viewMode = { showWires: true, showGroups: true, showBels: true, noSmallWires: true },
    ) {
        this._visibleWidth = this.context.canvas.width;
        this._visibleHeight = this.context.canvas.height;

        this.createGraphicElements();
    }

    public render(): void {
        if (this.animationFrameId) window.cancelAnimationFrame(this.animationFrameId);

        this.animationFrameId = window.requestAnimationFrame(() => {
            this.context.fillStyle = "#282A36";
            this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

            if (this._viewMode.showWires) {
                if (this._viewMode.noSmallWires) {
                    this.renderElements(this._elements.long_wire);
                } else {
                    this.renderElements(this._elements.wire);
                }
            }

            if (this._viewMode.showGroups) {
                this.renderElements(this._elements.group);
            }

            if (this._viewMode.showBels) {
                this.renderElements(this._elements.bel);
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

        this._visibleWidth = this.context.canvas.width / this._scale;
        this._visibleHeight = this.context.canvas.height / this._scale;

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
        noSmallWires?: boolean
    }) {
        if (viewMode.showWires !== undefined)    this._viewMode.showWires = viewMode.showWires;
        if (viewMode.showGroups !== undefined)   this._viewMode.showGroups = viewMode.showGroups;
        if (viewMode.showBels !== undefined)     this._viewMode.showBels = viewMode.showBels;
        if (viewMode.noSmallWires !== undefined) this._viewMode.noSmallWires = viewMode.noSmallWires;

        this.render();
    }

    public get viewMode() {
        return Object.assign({}, this._viewMode); // Ensure readonly
    }

    private createGraphicElements() {
        this._elements.wire = this.architecture.getWireDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this._elements.long_wire = this._elements.wire.filter(ge => {
            const xlen = Math.abs(ge.x1-ge.x2);
            const ylen = Math.abs(ge.y1-ge.y2);

            const cutoff = 3;
            if (xlen < cutoff && ylen < cutoff)
                return false;
            return true;
        });

        this._elements.bel = this.architecture.getBelDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this._elements.group = this.architecture.getGroupDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();
    }

    private renderElements(elements: Array<GraphicElement>) {
        if (elements.length === 0) return;

        
        const groups = elements
                            .map(e => e.style)
                            .filter((v,i,self) => self.indexOf(v) === i)
                            .map(s => elements.filter(e => e.style === s));


        for (const group of groups) {
            this.context.beginPath();
            this.context.strokeStyle = this.getColor(group[0].style);

            for (const ge of group) {

                if (ge.type === GraphicElementType.Box) {
                    this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                    this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y1) * this._scale);
                    this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
                    this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y2) * this._scale);
                    this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                }

                else if (ge.type === GraphicElementType.Line ||
                         ge.type === GraphicElementType.ARROW ||
                         ge.type === GraphicElementType.LOCAL_LINE ||
                         ge.type === GraphicElementType.LOCAL_ARROW) {
                    /*
                    if (this._scale < 100 && i++ % 10 !== 0) continue;
                    if (ge.x2 < this._offX || ge.x1 > this._offX + this._visibleWidth ||
                       -ge.y2 < this._offY || -ge.y1 > this._offY + this._visibleHeight) continue;
                    */

                    this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                    this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
                }

            }
            this.context.stroke();
        }
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
