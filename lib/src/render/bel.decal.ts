import { DecalXY } from '../decal/decal';
import { GraphicElement, GraphicElementType, GraphicElementStyle } from './types';
import { BelData } from '../chipdb/types';

enum BelType {
    id_ICESTORM_LC  = 404,
    id_ICESTORM_RAM = 405,
    id_SB_IO        = 406,
    id_SB_GB        = 407,
    id_ICESTORM_PLL = 408,
    id_SB_WARMBOOT  = 409
}

export function getBelDecalGraphics(g: Array<GraphicElement>, decal: DecalXY) {
    const bel = decal.decal.obj as BelData;
    const type = bel.type as BelType;

    console.log(type === 405);
    if (type === BelType.id_ICESTORM_LC) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE;

        el.x1 = bel.x + logic_cell_x1;
        el.x2 = bel.x + logic_cell_x2;
        el.y1 = bel.y + logic_cell_y1 +
                (bel.z) * logic_cell_pitch;
        el.y2 = bel.y + logic_cell_y2 +
                (bel.z) * logic_cell_pitch;
        g.push(el);
    }

    if (type === BelType.id_SB_IO) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE;

        el.x1 = bel.x + lut_swbox_x1;
        el.x2 = bel.x + logic_cell_x2;
        el.y1 = bel.y + logic_cell_y1 +
                (4 * bel.z) * logic_cell_pitch;
        el.y2 = bel.y + logic_cell_y2 +
                (4 * bel.z + 3) * logic_cell_pitch;
        g.push(el);
    }

    if (type === BelType.id_ICESTORM_RAM) {
        for (let i = 0; i < 2; i++) {
            const el = new GraphicElement();

            el.type = GraphicElementType.TYPE_BOX;
            el.style = decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE;

            el.x1 = bel.x + lut_swbox_x1;
            el.x2 = bel.x + logic_cell_x2;
            el.y1 = bel.y + logic_cell_y1 + i;
            el.y2 = bel.y + logic_cell_y2 + i + 7 * logic_cell_pitch;
            g.push(el);
        }
    }

    if (type === BelType.id_SB_GB) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE;

        el.x1 = bel.x + local_swbox_x1 + 0.05;
        el.x2 = bel.x + logic_cell_x2 - 0.05;
        el.y1 = bel.y + main_swbox_y2 - 0.05;
        el.y2 = bel.y + main_swbox_y2 - 0.10;
        g.push(el);
    }

    if (type === BelType.id_ICESTORM_PLL || type === BelType.id_SB_WARMBOOT) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = decal.decal.active ? GraphicElementStyle.STYLE_ACTIVE : GraphicElementStyle.STYLE_INACTIVE;

        el.x1 = bel.x + local_swbox_x1 + 0.05;
        el.x2 = bel.x + logic_cell_x2 - 0.05;
        el.y1 = bel.y + main_swbox_y2;
        el.y2 = bel.y + main_swbox_y2 + 0.05;
        g.push(el);
    }
}

const main_swbox_x1 = 0.35;
const main_swbox_x2 = 0.60;
const main_swbox_y1 = 0.05;
const main_swbox_y2 = 0.73;

const local_swbox_x1 = 0.63;
const local_swbox_x2 = 0.73;
const local_swbox_y1 = 0.05;
const local_swbox_y2 = 0.55;

const lut_swbox_x1 = 0.76;
const lut_swbox_x2 = 0.80;

const logic_cell_x1 = 0.83;
const logic_cell_x2 = 0.95;
const logic_cell_y1 = 0.05;
const logic_cell_y2 = 0.10;
const logic_cell_pitch = 0.0625;
