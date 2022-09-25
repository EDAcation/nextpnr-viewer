import { DecalXY } from '../decal/decal';
import { GraphicElement, GraphicElementType, GraphicElementStyle } from './types';
import { GroupId, GroupIdType } from '../chipdb/types';

export function getGroupDecalGraphics(g: Array<GraphicElement>, decal: DecalXY) {
    const group = decal.decal.obj as GroupId;

    const x = group.x;
    const y = group.y;
    const type = group.type;
    
    if (type === GroupIdType.TYPE_FRAME) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_LINE;
        el.style = GraphicElementStyle.STYLE_FRAME;

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y + 0.01;
        el.y2 = y + 0.01;
        g.push(el.clone());

        el.x1 = x + 0.01;
        el.x2 = x + 0.01;
        el.y1 = y + 0.01;
        el.y2 = y + 0.02;
        g.push(el.clone());

        el.x1 = x + 0.99;
        el.x2 = x + 0.98;
        el.y1 = y + 0.01;
        el.y2 = y + 0.01;
        g.push(el.clone());

        el.x1 = x + 0.99;
        el.x2 = x + 0.99;
        el.y1 = y + 0.01;
        el.y2 = y + 0.02;
        g.push(el.clone());

        el.x1 = x + 0.99;
        el.x2 = x + 0.98;
        el.y1 = y + 0.99;
        el.y2 = y + 0.99;
        g.push(el.clone());

        el.x1 = x + 0.99;
        el.x2 = x + 0.99;
        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        g.push(el.clone());

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y + 0.99;
        el.y2 = y + 0.99;
        g.push(el.clone());

        el.x1 = x + 0.01;
        el.x2 = x + 0.01;
        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        g.push(el.clone());
    }

    if (type === GroupIdType.TYPE_MAIN_SW) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = GraphicElementStyle.STYLE_FRAME;

        el.x1 = x + main_swbox_x1;
        el.x2 = x + main_swbox_x2;
        el.y1 = y + main_swbox_y1;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    if (type === GroupIdType.TYPE_LOCAL_SW) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = GraphicElementStyle.STYLE_FRAME;

        el.x1 = x + local_swbox_x1;
        el.x2 = x + local_swbox_x2;
        el.y1 = y + local_swbox_y1;
        el.y2 = y + local_swbox_y2;
        g.push(el.clone());
    }

    if (GroupIdType.TYPE_LC0_SW <= type && type <= GroupIdType.TYPE_LC7_SW) {
        const el = new GraphicElement();

        el.type = GraphicElementType.TYPE_BOX;
        el.style = GraphicElementStyle.STYLE_FRAME;

        el.x1 = x + lut_swbox_x1;
        el.x2 = x + lut_swbox_x2;
        el.y1 = y + logic_cell_y1 + logic_cell_pitch * (type - GroupIdType.TYPE_LC0_SW);
        el.y2 = y + logic_cell_y2 + logic_cell_pitch * (type - GroupIdType.TYPE_LC0_SW);
        g.push(el.clone());
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
