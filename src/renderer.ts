import { ChipDb, WireData } from './chipdb/types';
import { DecalXY, DecalType } from './decal/decal';
import { gfxTileWire } from './render/gfx';
import { GraphicElement, GraphicElementStyle, GraphicElementType } from './render/types';
import { getGroupDecalGraphics } from './render/group.decal';
import { getBelDecalGraphics } from './render/bel.decal';

export class Renderer {
    constructor(
        private context: CanvasRenderingContext2D,
        private db: ChipDb,
        private _scale: number = 55,
        private _offX: number = -3,
        private _offY: number = -10.5,
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

        const wireDecals: Array<DecalXY> = this.db.wire_data.map(wd => DecalXY.from_wire(wd));
        const groupDecals: Array<DecalXY> = this.db.group_data.map(gd => DecalXY.from_group(gd));
        const belDecals: Array<DecalXY> = this.db.bel_data.map(bd => DecalXY.from_bel(bd));
        console.log(this.db);

        for (const decal of wireDecals) {
            if (decal.decal.type === DecalType.TYPE_WIRE) {
                const wd: WireData = decal.decal.obj as WireData;

                for (const segment of wd.segments) {
                    gfxTileWire(this._elements.wire, segment.x, segment.y,
                                this.db.width, this.db.height, segment.index,
                                decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE);
                }
            }
        }

        for (const decal of groupDecals) {
            getGroupDecalGraphics(this._elements.group, decal);
        }

        for (const decal of belDecals) {
            getBelDecalGraphics(this._elements.bel, decal);
        }

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
        this._scale = Math.min(4000, Math.max(55, this._scale));
        amt = this._scale / oldScale;

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
        this.context.strokeStyle = this.getColor(elements[0].style);
        this.context.beginPath();
        for (const ge of elements) {

            if (ge.type === GraphicElementType.TYPE_BOX) {
                this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
                this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y2) * this._scale);
                this.context.lineTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
            }

            else if (ge.type === GraphicElementType.TYPE_LINE || ge.type === GraphicElementType.TYPE_ARROW ||
                ge.type === GraphicElementType.TYPE_LOCAL_LINE || ge.type === GraphicElementType.TYPE_LOCAL_ARROW) {
                this.context.moveTo((-this._offX + ge.x1) * this._scale, (-this._offY + -ge.y1) * this._scale);
                this.context.lineTo((-this._offX + ge.x2) * this._scale, (-this._offY + -ge.y2) * this._scale);
            }

        }
        this.context.stroke();
    }

    private getColor(style: GraphicElementStyle): string {
        switch (style) {
            case GraphicElementStyle.STYLE_ACTIVE:
                return "#F8F8F2";
            case GraphicElementStyle.STYLE_INACTIVE:
                return "#6272A4";
            case GraphicElementStyle.STYLE_FRAME:
                return "#BD93F9";
        }

        return "#FF0000";
    }
}
