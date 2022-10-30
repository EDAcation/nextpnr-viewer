/*
import { ChipDb, WireData } from './chipdb/types';
import { DecalXY, DecalType } from './decal/decal';
import { gfxTileWire } from './render/gfx';
import { GraphicElement, GraphicElementStyle, GraphicElementType } from './render/types';
import { getGroupDecalGraphics } from './render/group.decal';
import { getBelDecalGraphics } from './render/bel.decal';
*/
import { Architecture } from './architecture/architecture';
import { GraphicElement } from './gfx/gfx';
import { Type as GraphicElementType } from './gfx/types';
import { Style as GraphicElementStyle } from './gfx/styles';
import { from } from 'rxjs';

export class Renderer<T> {
    constructor(
        private context: CanvasRenderingContext2D,
        private architecture: Architecture<T>,
        private _scale: number = 10,
        private _offX: number = -3,
        private _offY: number = -75.5,
        private _visibleWidth = 0,
        private _visibleHeight = 0,
        private _elements: {
            wire: Array<GraphicElement>,
            group: Array<GraphicElement>,
            bel: Array<GraphicElement>
        } = { wire: [], group: [], bel: [] },
        public config = { showWires: true, showGroups: true, showBels: true }
    ) {
        this._visibleWidth = this.context.canvas.width;
        this._visibleHeight = this.context.canvas.height;

        this._elements.wire = this.architecture.getWireDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();

        this._elements.bel = this.architecture.getBelDecals().map(decal => {
            return this.architecture.getDecalGraphics(decal.decal);
        }).flat();
        console.log(this._elements);
    }

    public render(): void {
        this.context.fillStyle = "#282A36";
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        if (this.config.showWires) {
            this.renderElements(this._elements.wire);
        }

        if (this.config.showGroups) {
            this.renderElements(this._elements.group);
        }

        if (this.config.showBels) {
            this.renderElements(this._elements.bel);
        }
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

    private renderElements(elements: Array<GraphicElement>) {
        if (elements.length === 0) return;

        this.context.strokeStyle = this.getColor(elements[0].style);
        this.context.beginPath();
        let i = 0;
        for (const ge of elements) {

            if (ge.type === GraphicElementType.Box) {
                this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
                this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y2) * this._scale);
                this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
            }

            else if (ge.type === GraphicElementType.Line /*|| ge.type === GraphicElementType.TYPE_ARROW ||
                ge.type === GraphicElementType.TYPE_LOCAL_LINE || ge.type === GraphicElementType.TYPE_LOCAL_ARROW*/) {
                if (this._scale < 100 && i++ % 10 !== 0) continue;
                if (ge.x2 < this._offX || ge.x1 > this._offX + this._visibleWidth ||
                   -ge.y2 < this._offY || -ge.y1 > this._offY + this._visibleHeight) continue;

                this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
            }

        }
        this.context.stroke();
    }

    private getColor(style: GraphicElementStyle): string {
        switch (style) {
            case GraphicElementStyle.Active:
                return "#F8F8F2";
            case GraphicElementStyle.Inactive:
                return "#6272A4";
            //case GraphicElementStyle.STYLE_FRAME:
                //return "#BD93F9";
        }

        //return "#FF0000";
    }
}
