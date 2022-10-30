import { GraphicElement, GraphicElementStyle, GraphicElementType } from './types';

/*
 * THIS CODE WAS TRANSLATED FROM https://github.com/YosysHQ/nextpnr/blob/master/ice40/gfx.cc
 *
 * ORIGINAL COPYRIGHT NOTICE:
 *
 * nextpnr -- Next Generation Place and Route
 *
 * Copyright (C) 2018  Claire Xenia Wolf <claire@yosyshq.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

export function gfxTileWire(g: Array<GraphicElement>,
                            x: number, y: number, w: number, h: number, id: number,
                            style: GraphicElementStyle): void
{
    const el: GraphicElement = new GraphicElement();
    el.type = GraphicElementType.TYPE_LINE;
    el.style = style;

    // Horizontal Span-4 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SP4_H_L_36 && id <= GfxTileWireId.TILE_WIRE_SP4_H_L_47) {
        const idx: number = (id - GfxTileWireId.TILE_WIRE_SP4_H_L_36) + 48;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1)));
        const y2: number = y + 1.0 - (0.03 + 0.0025 * (60 - idx));

        el.x1 = x;
        el.x2 = x + 0.01;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el.clone());

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y1;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + 0.02;
        el.x2 = x + 0.9;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * (idx + 35);
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SP4_H_R_0 && id <= GfxTileWireId.TILE_WIRE_SP4_H_R_47) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SP4_H_R_0;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (60 - idx));
        const y2: number = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1)));
        const y3: number = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1) - 12));

        if (idx >= 12) {
            el.x1 = x;
            el.x2 = x + 0.01;
            el.y1 = y1;
            el.y2 = y1;
            g.push(el.clone());

            el.x1 = x + 0.01;
            el.x2 = x + 0.02;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el.clone());
        }

        el.x1 = x + 0.02;
        el.x2 = x + 0.9;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + 0.9;
        el.x2 = x + 1.0;
        el.y1 = y2;
        el.y2 = y3;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35);
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    // Vertical Span-4 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SP4_V_T_36 && id <= GfxTileWireId.TILE_WIRE_SP4_V_T_47) {
        const idx: number = (id - GfxTileWireId.TILE_WIRE_SP4_V_T_36) + 48;

        const x1: number = x + 0.03 + 0.0025 * (60 - (idx ^ 1));
        const x2: number = x + 0.03 + 0.0025 * (60 - idx);

        el.y1 = y + 1.00;
        el.y2 = y + 0.99;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el.clone());

        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        el.x1 = x1;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 0.98;
        el.y2 = y + 0.10;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - idx));
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SP4_V_B_0 && id <= GfxTileWireId.TILE_WIRE_SP4_V_B_47) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SP4_V_B_0;

        const x1: number = x + 0.03 + 0.0025 * (60 - idx);
        const x2: number = x + 0.03 + 0.0025 * (60 - (idx ^ 1));
        const x3: number = x + 0.03 + 0.0025 * (60 - (idx ^ 1) - 12);

        if (idx >= 12) {
            el.y1 = y + 1.00;
            el.y2 = y + 0.99;
            el.x1 = x1;
            el.x2 = x1;
            g.push(el.clone());

            el.y1 = y + 0.99;
            el.y2 = y + 0.98;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el.clone());
        }

        el.y1 = y + 0.98;
        el.y2 = y + 0.10;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 0.10;
        el.y2 = y;
        el.x1 = x2;
        el.x2 = x3;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (145 - (idx ^ 1)));
        el.y2 = el.y1;
        el.x1 = x;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)));
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // Horizontal Span-12 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SP12_H_L_22 && id <= GfxTileWireId.TILE_WIRE_SP12_H_L_23) {
        const idx: number = (id - GfxTileWireId.TILE_WIRE_SP12_H_L_22) + 24;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1)));
        const y2: number = y + 1.0 - (0.03 + 0.0025 * (90 - idx));

        el.x1 = x;
        el.x2 = x + 0.01;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el.clone());

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y1;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + 0.02;
        el.x2 = x + 0.98333;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * (idx + 5);
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SP12_H_R_0 && id <= GfxTileWireId.TILE_WIRE_SP12_H_R_23) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SP12_H_R_0;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (90 - idx));
        const y2: number = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1)));
        const y3: number = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1) - 2));

        if (idx >= 2) {
            el.x1 = x;
            el.x2 = x + 0.01;
            el.y1 = y1;
            el.y2 = y1;
            g.push(el.clone());

            el.x1 = x + 0.01;
            el.x2 = x + 0.02;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el.clone());
        }

        el.x1 = x + 0.02;
        el.x2 = x + 0.98333;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el.clone());

        el.x1 = x + 0.98333;
        el.x2 = x + 1.0;
        el.y1 = y2;
        el.y2 = y3;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5);
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    // Vertical Right Span-4

    if (id >= GfxTileWireId.TILE_WIRE_SP4_R_V_B_0 && id <= GfxTileWireId.TILE_WIRE_SP4_R_V_B_47) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SP4_R_V_B_0;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (145 - (idx ^ 1)));

        el.y1 = y1;
        el.y2 = y1;
        el.x1 = x + main_swbox_x2;
        el.x2 = x + 1.0;
        g.push(el.clone());
    }

    // Vertical Span-12 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SP12_V_T_22 && id <= GfxTileWireId.TILE_WIRE_SP12_V_T_23) {
        const idx: number = (id - GfxTileWireId.TILE_WIRE_SP12_V_T_22) + 24;

        const x1: number = x + 0.03 + 0.0025 * (90 - (idx ^ 1));
        const x2: number = x + 0.03 + 0.0025 * (90 - idx);

        el.y1 = y + 1.00;
        el.y2 = y + 0.99;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el.clone());

        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        el.x1 = x1;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 0.98;
        el.y2 = y + 0.01667;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - idx));
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SP12_V_B_0 && id <= GfxTileWireId.TILE_WIRE_SP12_V_B_23) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SP12_V_B_0;

        const x1: number = x + 0.03 + 0.0025 * (90 - idx);
        const x2: number = x + 0.03 + 0.0025 * (90 - (idx ^ 1));
        const x3: number = x + 0.03 + 0.0025 * (90 - (idx ^ 1) - 2);

        if (idx >= 2) {
            el.y1 = y + 1.00;
            el.y2 = y + 0.99;
            el.x1 = x1;
            el.x2 = x1;
            g.push(el.clone());

            el.y1 = y + 0.99;
            el.y2 = y + 0.98;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el.clone());
        }

        el.y1 = y + 0.98;
        el.y2 = y + 0.01667;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el.clone());

        el.y1 = y + 0.01667;
        el.y2 = y;
        el.x1 = x2;
        el.x2 = x3;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)));
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // IO Span-4 Wires connecting to fabric

    if (id >= GfxTileWireId.TILE_WIRE_SPAN4_HORZ_0 && id <= GfxTileWireId.TILE_WIRE_SPAN4_HORZ_47) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN4_HORZ_0;
        const y1: number = y + 1.0 - (0.03 + 0.0025 * (48 - (idx ^ 1)));

        el.x1 = x;
        el.x2 = x + 1.0;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35);
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SPAN4_VERT_0 && id <= GfxTileWireId.TILE_WIRE_SPAN4_VERT_47) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN4_VERT_0;
        const x1: number = x + 0.03 + 0.0025 * (48 - (idx ^ 1));

        el.x1 = x1;
        el.x2 = x1;
        el.y1 = y;
        el.y2 = y + 1.0;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)));
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // IO Span-12 Wires connecting to fabric

    if (id >= GfxTileWireId.TILE_WIRE_SPAN12_HORZ_0 && id <= GfxTileWireId.TILE_WIRE_SPAN12_HORZ_23) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN12_HORZ_0;
        const y1: number = y + 1.0 - (0.03 + 0.0025 * (88 - (idx ^ 1)));

        el.x1 = x;
        el.x2 = x + 1.0;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el.clone());

        el.x1 = x + main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5);
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_SPAN12_VERT_0 && id <= GfxTileWireId.TILE_WIRE_SPAN12_VERT_23) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN12_VERT_0;
        const x1: number = x + 0.03 + 0.0025 * (88 - (idx ^ 1));

        el.x1 = x1;
        el.x2 = x1;
        el.y1 = y;
        el.y2 = y + 1.0;
        g.push(el.clone());

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)));
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // Horizontal IO Span-4 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SPAN4_HORZ_R_0 && id <= GfxTileWireId.TILE_WIRE_SPAN4_HORZ_L_15) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN4_HORZ_R_0;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (60 - idx));
        const y2: number = y + 1.0 - (0.03 + 0.0025 * (60 - idx - 4));

        el.x1 = x;
        el.x2 = x + 0.9;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el.clone());

        if (idx <= 15) {
            el.x1 = x + 0.9;
            el.x2 = x + 1.0;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el.clone());
        }

        el.x1 = x + main_swbox_x1 + 0.0025 * (idx + 35);
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + main_swbox_y2;
        g.push(el.clone());
    }

    // Vertical IO Span-4 Wires

    if (id >= GfxTileWireId.TILE_WIRE_SPAN4_VERT_B_0 && id <= GfxTileWireId.TILE_WIRE_SPAN4_VERT_T_15) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_SPAN4_VERT_B_0;

        const x1: number = x + 0.03 + 0.0025 * (60 - idx);
        const x2: number = x + 0.03 + 0.0025 * (60 - idx - 4);

        el.y1 = y + 1.00;
        el.y2 = y + 0.10;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el.clone());

        if (idx <= 15) {
            el.y1 = y + 0.10;
            el.y2 = y;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el.clone());
        }

        if (idx <= 15 && (x == 0 || x == w - 1) && y == 1) {
            const y1: number = y - (0.03 + 0.0025 * (60 - idx - 4));

            el.x1 = x2;
            el.y1 = y;
            el.x2 = x2;
            el.y2 = y1;
            g.push(el.clone());

            el.x1 = x2;
            el.y1 = y1;
            el.x2 = x + (x === 0 ? 1 : 0);
            el.y2 = y1;
            g.push(el.clone());
        }

        if (idx >= 4 && (x == 0 || x == w - 1) && y == h - 2) {
            const y1: number = y + 2.0 - (0.03 + 0.0025 * (60 - idx));

            el.x1 = x1;
            el.y1 = y + 1.0;
            el.x2 = x1;
            el.y2 = y1;
            g.push(el.clone());

            el.x1 = x1;
            el.y1 = y1;
            el.x2 = x + (x === 0 ? 1 : 0);
            el.y2 = y1;
            g.push(el.clone());
        }

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - idx));
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // Global2Local

    if (id >= GfxTileWireId.TILE_WIRE_GLB2LOCAL_0 && id <= GfxTileWireId.TILE_WIRE_GLB2LOCAL_3) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_GLB2LOCAL_0;
        el.x1 = x + main_swbox_x1 + 0.005 * (idx + 5);
        el.x2 = el.x1;
        el.y1 = y + main_swbox_y1;
        el.y2 = el.y1 - 0.02;
        g.push(el.clone());
    }

    // GlobalNets

    if (id >= GfxTileWireId.TILE_WIRE_GLB_NETWK_0 && id <= GfxTileWireId.TILE_WIRE_GLB_NETWK_7) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_GLB_NETWK_0;
        el.x1 = x + main_swbox_x1 - 0.05;
        el.x2 = x + main_swbox_x1;
        el.y1 = y + main_swbox_y1 + 0.005 * (13 - idx);
        el.y2 = el.y1;
        g.push(el.clone());
    }

    // Neighbours

    if (id >= GfxTileWireId.TILE_WIRE_NEIGH_OP_BNL_0 && id <= GfxTileWireId.TILE_WIRE_NEIGH_OP_TOP_7) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_NEIGH_OP_BNL_0;
        el.y1 = y + main_swbox_y2 - (0.0025 * (idx + 10) + 0.01 * Math.floor(idx / 8));
        el.y2 = el.y1;
        el.x1 = x + main_swbox_x1 - 0.05;
        el.x2 = x + main_swbox_x1;
        g.push(el.clone());
    }

    // Local Tracks

    if (id >= GfxTileWireId.TILE_WIRE_LOCAL_G0_0 && id <= GfxTileWireId.TILE_WIRE_LOCAL_G3_7) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LOCAL_G0_0;
        el.x1 = x + main_swbox_x2;
        el.x2 = x + local_swbox_x1;
        const yoff: number = y + (local_swbox_y1 + local_swbox_y2) / 2 - 0.005 * 16 - 0.075;
        el.y1 = yoff + 0.005 * idx + 0.05 * Math.floor(idx / 8);
        el.y2 = el.y1;
        g.push(el.clone());
    }

    // LC Inputs

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_0_IN_0 && id <= GfxTileWireId.TILE_WIRE_LUTFF_7_IN_3) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_0_IN_0;
        const z: number = Math.floor(idx / 4);
        const input: number = idx % 4;
        el.x1 = x + local_swbox_x2;
        el.x2 = x + lut_swbox_x1;
        el.y1 = y + (logic_cell_y1 + logic_cell_y2) / 2 + 0.0075 - (0.005 * input) + z * logic_cell_pitch;
        el.y2 = el.y1;
        g.push(el.clone());
    }

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_0_IN_0_LUT && id <= GfxTileWireId.TILE_WIRE_LUTFF_7_IN_3_LUT) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_0_IN_0_LUT;
        const z: number = Math.floor(idx / 4);
        const input: number = idx % 4;
        el.x1 = x + lut_swbox_x2;
        el.x2 = x + logic_cell_x1;
        el.y1 = y + (logic_cell_y1 + logic_cell_y2) / 2 + 0.0075 - (0.005 * input) + z * logic_cell_pitch;
        el.y2 = el.y1;
        g.push(el.clone());
    }

    // LC Outputs

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_0_OUT && id <= GfxTileWireId.TILE_WIRE_LUTFF_7_OUT) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_0_OUT;

        const y1: number = y + 1.0 - (0.03 + 0.0025 * (152 + idx));

        el.y1 = y1;
        el.y2 = y1;
        el.x1 = x + main_swbox_x2;
        el.x2 = x + 0.97 + 0.0025 * (7 - idx);
        g.push(el.clone());

        el.y1 = y1;
        el.y2 = y + (logic_cell_y1 + logic_cell_y2) / 2 + idx * logic_cell_pitch;
        el.x1 = el.x2;
        g.push(el.clone());

        el.y1 = el.y2;
        el.x1 = x + logic_cell_x2;
        g.push(el.clone());
    }

    // LC Control

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_GLOBAL_CEN && id <= GfxTileWireId.TILE_WIRE_LUTFF_GLOBAL_S_R) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_GLOBAL_CEN;

        el.x1 = x + main_swbox_x2 - 0.005 * (idx + 5);
        el.x2 = el.x1;
        el.y1 = y + main_swbox_y1;
        el.y2 = el.y1 - 0.005 * (idx + 2);
        g.push(el.clone());

        el.y1 = el.y2;
        el.x2 = x + logic_cell_x2 - 0.005 * (2 - idx + 5);
        g.push(el.clone());

        el.y2 = y + logic_cell_y1;
        el.x1 = el.x2;
        g.push(el.clone());

        for (let i = 0; i < 7; i++) {
            el.y1 = y + logic_cell_y2 + i * logic_cell_pitch;
            el.y2 = y + logic_cell_y1 + (i + 1) * logic_cell_pitch;
            g.push(el.clone());
        }
    }

    // LC Control for IO and BRAM

    if (id >= GfxTileWireId.TILE_WIRE_FUNC_GLOBAL_CEN && id <= GfxTileWireId.TILE_WIRE_FUNC_GLOBAL_S_R) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_FUNC_GLOBAL_CEN;

        el.x1 = x + main_swbox_x2 - 0.005 * (idx + 5);
        el.x2 = el.x1;
        el.y1 = y + main_swbox_y1;
        el.y2 = el.y1 - 0.005 * (idx + 2);
        g.push(el.clone());

        el.y1 = el.y2;
        el.x2 = x + logic_cell_x2 - 0.005 * (2 - idx + 5);
        g.push(el.clone());

        el.y2 = y + logic_cell_y1;
        el.x1 = el.x2;
        g.push(el.clone());
    }

    if (id == GfxTileWireId.TILE_WIRE_FABOUT) {
        el.y1 = y + main_swbox_y1;
        el.y2 = el.y1 - 0.005 * 4;
        el.x1 = x + main_swbox_x2 - 0.005 * 9;
        el.x2 = el.x1;
        g.push(el.clone());
    }

    if (id == GfxTileWireId.TILE_WIRE_FUNC_GLOBAL_G0) {
        el.y1 = y + logic_cell_y1;
        el.y2 = el.y1 - 0.005 * 4;
        el.x1 = x + logic_cell_x2 - 0.005 * 3;
        el.x2 = el.x1;
        g.push(el.clone());
    }

    // LC Cascade

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_0_LOUT && id <= GfxTileWireId.TILE_WIRE_LUTFF_6_LOUT) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_0_LOUT;
        el.x1 = x + logic_cell_x1 + 0.005 * 5;
        el.x2 = el.x1;
        el.y1 = y + logic_cell_y2 + idx * logic_cell_pitch;
        el.y2 = y + logic_cell_y1 + (idx + 1) * logic_cell_pitch;
        g.push(el.clone());
    }

    // Carry Chain

    if (id >= GfxTileWireId.TILE_WIRE_LUTFF_0_COUT && id <= GfxTileWireId.TILE_WIRE_LUTFF_7_COUT) {
        const idx: number = id - GfxTileWireId.TILE_WIRE_LUTFF_0_COUT;
        el.x1 = x + logic_cell_x1 + 0.005 * 3;
        el.x2 = el.x1;
        el.y1 = y + logic_cell_y2 + idx * logic_cell_pitch;
        el.y2 = y + (idx < 7 ? logic_cell_y1 + (idx + 1) * logic_cell_pitch : 1.0);
        g.push(el.clone());
    }

    if (id == GfxTileWireId.TILE_WIRE_CARRY_IN) {
        el.x1 = x + logic_cell_x1 + 0.005 * 3;
        el.x2 = el.x1;
        el.y1 = y;
        el.y2 = y + 0.01;
        g.push(el.clone());
    }

    if (id == GfxTileWireId.TILE_WIRE_CARRY_IN_MUX) {
        el.x1 = x + logic_cell_x1 + 0.005 * 3;
        el.x2 = el.x1;
        el.y1 = y + 0.02;
        el.y2 = y + logic_cell_y1;
        g.push(el.clone());
    }
}

enum GfxTileWireId
{
    TILE_WIRE_GLB2LOCAL_0,
    TILE_WIRE_GLB2LOCAL_1,
    TILE_WIRE_GLB2LOCAL_2,
    TILE_WIRE_GLB2LOCAL_3,

    TILE_WIRE_GLB_NETWK_0,
    TILE_WIRE_GLB_NETWK_1,
    TILE_WIRE_GLB_NETWK_2,
    TILE_WIRE_GLB_NETWK_3,
    TILE_WIRE_GLB_NETWK_4,
    TILE_WIRE_GLB_NETWK_5,
    TILE_WIRE_GLB_NETWK_6,
    TILE_WIRE_GLB_NETWK_7,

    TILE_WIRE_LOCAL_G0_0,
    TILE_WIRE_LOCAL_G0_1,
    TILE_WIRE_LOCAL_G0_2,
    TILE_WIRE_LOCAL_G0_3,
    TILE_WIRE_LOCAL_G0_4,
    TILE_WIRE_LOCAL_G0_5,
    TILE_WIRE_LOCAL_G0_6,
    TILE_WIRE_LOCAL_G0_7,

    TILE_WIRE_LOCAL_G1_0,
    TILE_WIRE_LOCAL_G1_1,
    TILE_WIRE_LOCAL_G1_2,
    TILE_WIRE_LOCAL_G1_3,
    TILE_WIRE_LOCAL_G1_4,
    TILE_WIRE_LOCAL_G1_5,
    TILE_WIRE_LOCAL_G1_6,
    TILE_WIRE_LOCAL_G1_7,

    TILE_WIRE_LOCAL_G2_0,
    TILE_WIRE_LOCAL_G2_1,
    TILE_WIRE_LOCAL_G2_2,
    TILE_WIRE_LOCAL_G2_3,
    TILE_WIRE_LOCAL_G2_4,
    TILE_WIRE_LOCAL_G2_5,
    TILE_WIRE_LOCAL_G2_6,
    TILE_WIRE_LOCAL_G2_7,

    TILE_WIRE_LOCAL_G3_0,
    TILE_WIRE_LOCAL_G3_1,
    TILE_WIRE_LOCAL_G3_2,
    TILE_WIRE_LOCAL_G3_3,
    TILE_WIRE_LOCAL_G3_4,
    TILE_WIRE_LOCAL_G3_5,
    TILE_WIRE_LOCAL_G3_6,
    TILE_WIRE_LOCAL_G3_7,

    TILE_WIRE_LUTFF_0_IN_0,
    TILE_WIRE_LUTFF_0_IN_1,
    TILE_WIRE_LUTFF_0_IN_2,
    TILE_WIRE_LUTFF_0_IN_3,

    TILE_WIRE_LUTFF_1_IN_0,
    TILE_WIRE_LUTFF_1_IN_1,
    TILE_WIRE_LUTFF_1_IN_2,
    TILE_WIRE_LUTFF_1_IN_3,

    TILE_WIRE_LUTFF_2_IN_0,
    TILE_WIRE_LUTFF_2_IN_1,
    TILE_WIRE_LUTFF_2_IN_2,
    TILE_WIRE_LUTFF_2_IN_3,

    TILE_WIRE_LUTFF_3_IN_0,
    TILE_WIRE_LUTFF_3_IN_1,
    TILE_WIRE_LUTFF_3_IN_2,
    TILE_WIRE_LUTFF_3_IN_3,

    TILE_WIRE_LUTFF_4_IN_0,
    TILE_WIRE_LUTFF_4_IN_1,
    TILE_WIRE_LUTFF_4_IN_2,
    TILE_WIRE_LUTFF_4_IN_3,

    TILE_WIRE_LUTFF_5_IN_0,
    TILE_WIRE_LUTFF_5_IN_1,
    TILE_WIRE_LUTFF_5_IN_2,
    TILE_WIRE_LUTFF_5_IN_3,

    TILE_WIRE_LUTFF_6_IN_0,
    TILE_WIRE_LUTFF_6_IN_1,
    TILE_WIRE_LUTFF_6_IN_2,
    TILE_WIRE_LUTFF_6_IN_3,

    TILE_WIRE_LUTFF_7_IN_0,
    TILE_WIRE_LUTFF_7_IN_1,
    TILE_WIRE_LUTFF_7_IN_2,
    TILE_WIRE_LUTFF_7_IN_3,

    TILE_WIRE_LUTFF_0_IN_0_LUT,
    TILE_WIRE_LUTFF_0_IN_1_LUT,
    TILE_WIRE_LUTFF_0_IN_2_LUT,
    TILE_WIRE_LUTFF_0_IN_3_LUT,

    TILE_WIRE_LUTFF_1_IN_0_LUT,
    TILE_WIRE_LUTFF_1_IN_1_LUT,
    TILE_WIRE_LUTFF_1_IN_2_LUT,
    TILE_WIRE_LUTFF_1_IN_3_LUT,

    TILE_WIRE_LUTFF_2_IN_0_LUT,
    TILE_WIRE_LUTFF_2_IN_1_LUT,
    TILE_WIRE_LUTFF_2_IN_2_LUT,
    TILE_WIRE_LUTFF_2_IN_3_LUT,

    TILE_WIRE_LUTFF_3_IN_0_LUT,
    TILE_WIRE_LUTFF_3_IN_1_LUT,
    TILE_WIRE_LUTFF_3_IN_2_LUT,
    TILE_WIRE_LUTFF_3_IN_3_LUT,

    TILE_WIRE_LUTFF_4_IN_0_LUT,
    TILE_WIRE_LUTFF_4_IN_1_LUT,
    TILE_WIRE_LUTFF_4_IN_2_LUT,
    TILE_WIRE_LUTFF_4_IN_3_LUT,

    TILE_WIRE_LUTFF_5_IN_0_LUT,
    TILE_WIRE_LUTFF_5_IN_1_LUT,
    TILE_WIRE_LUTFF_5_IN_2_LUT,
    TILE_WIRE_LUTFF_5_IN_3_LUT,

    TILE_WIRE_LUTFF_6_IN_0_LUT,
    TILE_WIRE_LUTFF_6_IN_1_LUT,
    TILE_WIRE_LUTFF_6_IN_2_LUT,
    TILE_WIRE_LUTFF_6_IN_3_LUT,

    TILE_WIRE_LUTFF_7_IN_0_LUT,
    TILE_WIRE_LUTFF_7_IN_1_LUT,
    TILE_WIRE_LUTFF_7_IN_2_LUT,
    TILE_WIRE_LUTFF_7_IN_3_LUT,

    TILE_WIRE_LUTFF_0_LOUT,
    TILE_WIRE_LUTFF_1_LOUT,
    TILE_WIRE_LUTFF_2_LOUT,
    TILE_WIRE_LUTFF_3_LOUT,
    TILE_WIRE_LUTFF_4_LOUT,
    TILE_WIRE_LUTFF_5_LOUT,
    TILE_WIRE_LUTFF_6_LOUT,

    TILE_WIRE_LUTFF_0_OUT,
    TILE_WIRE_LUTFF_1_OUT,
    TILE_WIRE_LUTFF_2_OUT,
    TILE_WIRE_LUTFF_3_OUT,
    TILE_WIRE_LUTFF_4_OUT,
    TILE_WIRE_LUTFF_5_OUT,
    TILE_WIRE_LUTFF_6_OUT,
    TILE_WIRE_LUTFF_7_OUT,

    TILE_WIRE_LUTFF_0_COUT,
    TILE_WIRE_LUTFF_1_COUT,
    TILE_WIRE_LUTFF_2_COUT,
    TILE_WIRE_LUTFF_3_COUT,
    TILE_WIRE_LUTFF_4_COUT,
    TILE_WIRE_LUTFF_5_COUT,
    TILE_WIRE_LUTFF_6_COUT,
    TILE_WIRE_LUTFF_7_COUT,

    TILE_WIRE_LUTFF_GLOBAL_CEN,
    TILE_WIRE_LUTFF_GLOBAL_CLK,
    TILE_WIRE_LUTFF_GLOBAL_S_R,

    TILE_WIRE_FUNC_GLOBAL_CEN,
    TILE_WIRE_FUNC_GLOBAL_CLK,
    TILE_WIRE_FUNC_GLOBAL_S_R,

    TILE_WIRE_FUNC_GLOBAL_G0,
    TILE_WIRE_FABOUT,

    TILE_WIRE_CARRY_IN,
    TILE_WIRE_CARRY_IN_MUX,

    TILE_WIRE_NEIGH_OP_BNL_0,
    TILE_WIRE_NEIGH_OP_BNL_1,
    TILE_WIRE_NEIGH_OP_BNL_2,
    TILE_WIRE_NEIGH_OP_BNL_3,
    TILE_WIRE_NEIGH_OP_BNL_4,
    TILE_WIRE_NEIGH_OP_BNL_5,
    TILE_WIRE_NEIGH_OP_BNL_6,
    TILE_WIRE_NEIGH_OP_BNL_7,

    TILE_WIRE_NEIGH_OP_BNR_0,
    TILE_WIRE_NEIGH_OP_BNR_1,
    TILE_WIRE_NEIGH_OP_BNR_2,
    TILE_WIRE_NEIGH_OP_BNR_3,
    TILE_WIRE_NEIGH_OP_BNR_4,
    TILE_WIRE_NEIGH_OP_BNR_5,
    TILE_WIRE_NEIGH_OP_BNR_6,
    TILE_WIRE_NEIGH_OP_BNR_7,

    TILE_WIRE_NEIGH_OP_BOT_0,
    TILE_WIRE_NEIGH_OP_BOT_1,
    TILE_WIRE_NEIGH_OP_BOT_2,
    TILE_WIRE_NEIGH_OP_BOT_3,
    TILE_WIRE_NEIGH_OP_BOT_4,
    TILE_WIRE_NEIGH_OP_BOT_5,
    TILE_WIRE_NEIGH_OP_BOT_6,
    TILE_WIRE_NEIGH_OP_BOT_7,

    TILE_WIRE_NEIGH_OP_LFT_0,
    TILE_WIRE_NEIGH_OP_LFT_1,
    TILE_WIRE_NEIGH_OP_LFT_2,
    TILE_WIRE_NEIGH_OP_LFT_3,
    TILE_WIRE_NEIGH_OP_LFT_4,
    TILE_WIRE_NEIGH_OP_LFT_5,
    TILE_WIRE_NEIGH_OP_LFT_6,
    TILE_WIRE_NEIGH_OP_LFT_7,

    TILE_WIRE_NEIGH_OP_RGT_0,
    TILE_WIRE_NEIGH_OP_RGT_1,
    TILE_WIRE_NEIGH_OP_RGT_2,
    TILE_WIRE_NEIGH_OP_RGT_3,
    TILE_WIRE_NEIGH_OP_RGT_4,
    TILE_WIRE_NEIGH_OP_RGT_5,
    TILE_WIRE_NEIGH_OP_RGT_6,
    TILE_WIRE_NEIGH_OP_RGT_7,

    TILE_WIRE_NEIGH_OP_TNL_0,
    TILE_WIRE_NEIGH_OP_TNL_1,
    TILE_WIRE_NEIGH_OP_TNL_2,
    TILE_WIRE_NEIGH_OP_TNL_3,
    TILE_WIRE_NEIGH_OP_TNL_4,
    TILE_WIRE_NEIGH_OP_TNL_5,
    TILE_WIRE_NEIGH_OP_TNL_6,
    TILE_WIRE_NEIGH_OP_TNL_7,

    TILE_WIRE_NEIGH_OP_TNR_0,
    TILE_WIRE_NEIGH_OP_TNR_1,
    TILE_WIRE_NEIGH_OP_TNR_2,
    TILE_WIRE_NEIGH_OP_TNR_3,
    TILE_WIRE_NEIGH_OP_TNR_4,
    TILE_WIRE_NEIGH_OP_TNR_5,
    TILE_WIRE_NEIGH_OP_TNR_6,
    TILE_WIRE_NEIGH_OP_TNR_7,

    TILE_WIRE_NEIGH_OP_TOP_0,
    TILE_WIRE_NEIGH_OP_TOP_1,
    TILE_WIRE_NEIGH_OP_TOP_2,
    TILE_WIRE_NEIGH_OP_TOP_3,
    TILE_WIRE_NEIGH_OP_TOP_4,
    TILE_WIRE_NEIGH_OP_TOP_5,
    TILE_WIRE_NEIGH_OP_TOP_6,
    TILE_WIRE_NEIGH_OP_TOP_7,

    TILE_WIRE_SP4_V_B_0,
    TILE_WIRE_SP4_V_B_1,
    TILE_WIRE_SP4_V_B_2,
    TILE_WIRE_SP4_V_B_3,
    TILE_WIRE_SP4_V_B_4,
    TILE_WIRE_SP4_V_B_5,
    TILE_WIRE_SP4_V_B_6,
    TILE_WIRE_SP4_V_B_7,
    TILE_WIRE_SP4_V_B_8,
    TILE_WIRE_SP4_V_B_9,
    TILE_WIRE_SP4_V_B_10,
    TILE_WIRE_SP4_V_B_11,
    TILE_WIRE_SP4_V_B_12,
    TILE_WIRE_SP4_V_B_13,
    TILE_WIRE_SP4_V_B_14,
    TILE_WIRE_SP4_V_B_15,
    TILE_WIRE_SP4_V_B_16,
    TILE_WIRE_SP4_V_B_17,
    TILE_WIRE_SP4_V_B_18,
    TILE_WIRE_SP4_V_B_19,
    TILE_WIRE_SP4_V_B_20,
    TILE_WIRE_SP4_V_B_21,
    TILE_WIRE_SP4_V_B_22,
    TILE_WIRE_SP4_V_B_23,
    TILE_WIRE_SP4_V_B_24,
    TILE_WIRE_SP4_V_B_25,
    TILE_WIRE_SP4_V_B_26,
    TILE_WIRE_SP4_V_B_27,
    TILE_WIRE_SP4_V_B_28,
    TILE_WIRE_SP4_V_B_29,
    TILE_WIRE_SP4_V_B_30,
    TILE_WIRE_SP4_V_B_31,
    TILE_WIRE_SP4_V_B_32,
    TILE_WIRE_SP4_V_B_33,
    TILE_WIRE_SP4_V_B_34,
    TILE_WIRE_SP4_V_B_35,
    TILE_WIRE_SP4_V_B_36,
    TILE_WIRE_SP4_V_B_37,
    TILE_WIRE_SP4_V_B_38,
    TILE_WIRE_SP4_V_B_39,
    TILE_WIRE_SP4_V_B_40,
    TILE_WIRE_SP4_V_B_41,
    TILE_WIRE_SP4_V_B_42,
    TILE_WIRE_SP4_V_B_43,
    TILE_WIRE_SP4_V_B_44,
    TILE_WIRE_SP4_V_B_45,
    TILE_WIRE_SP4_V_B_46,
    TILE_WIRE_SP4_V_B_47,

    TILE_WIRE_SP4_V_T_36,
    TILE_WIRE_SP4_V_T_37,
    TILE_WIRE_SP4_V_T_38,
    TILE_WIRE_SP4_V_T_39,
    TILE_WIRE_SP4_V_T_40,
    TILE_WIRE_SP4_V_T_41,
    TILE_WIRE_SP4_V_T_42,
    TILE_WIRE_SP4_V_T_43,
    TILE_WIRE_SP4_V_T_44,
    TILE_WIRE_SP4_V_T_45,
    TILE_WIRE_SP4_V_T_46,
    TILE_WIRE_SP4_V_T_47,

    TILE_WIRE_SP4_R_V_B_0,
    TILE_WIRE_SP4_R_V_B_1,
    TILE_WIRE_SP4_R_V_B_2,
    TILE_WIRE_SP4_R_V_B_3,
    TILE_WIRE_SP4_R_V_B_4,
    TILE_WIRE_SP4_R_V_B_5,
    TILE_WIRE_SP4_R_V_B_6,
    TILE_WIRE_SP4_R_V_B_7,
    TILE_WIRE_SP4_R_V_B_8,
    TILE_WIRE_SP4_R_V_B_9,
    TILE_WIRE_SP4_R_V_B_10,
    TILE_WIRE_SP4_R_V_B_11,
    TILE_WIRE_SP4_R_V_B_12,
    TILE_WIRE_SP4_R_V_B_13,
    TILE_WIRE_SP4_R_V_B_14,
    TILE_WIRE_SP4_R_V_B_15,
    TILE_WIRE_SP4_R_V_B_16,
    TILE_WIRE_SP4_R_V_B_17,
    TILE_WIRE_SP4_R_V_B_18,
    TILE_WIRE_SP4_R_V_B_19,
    TILE_WIRE_SP4_R_V_B_20,
    TILE_WIRE_SP4_R_V_B_21,
    TILE_WIRE_SP4_R_V_B_22,
    TILE_WIRE_SP4_R_V_B_23,
    TILE_WIRE_SP4_R_V_B_24,
    TILE_WIRE_SP4_R_V_B_25,
    TILE_WIRE_SP4_R_V_B_26,
    TILE_WIRE_SP4_R_V_B_27,
    TILE_WIRE_SP4_R_V_B_28,
    TILE_WIRE_SP4_R_V_B_29,
    TILE_WIRE_SP4_R_V_B_30,
    TILE_WIRE_SP4_R_V_B_31,
    TILE_WIRE_SP4_R_V_B_32,
    TILE_WIRE_SP4_R_V_B_33,
    TILE_WIRE_SP4_R_V_B_34,
    TILE_WIRE_SP4_R_V_B_35,
    TILE_WIRE_SP4_R_V_B_36,
    TILE_WIRE_SP4_R_V_B_37,
    TILE_WIRE_SP4_R_V_B_38,
    TILE_WIRE_SP4_R_V_B_39,
    TILE_WIRE_SP4_R_V_B_40,
    TILE_WIRE_SP4_R_V_B_41,
    TILE_WIRE_SP4_R_V_B_42,
    TILE_WIRE_SP4_R_V_B_43,
    TILE_WIRE_SP4_R_V_B_44,
    TILE_WIRE_SP4_R_V_B_45,
    TILE_WIRE_SP4_R_V_B_46,
    TILE_WIRE_SP4_R_V_B_47,

    TILE_WIRE_SP4_H_L_36,
    TILE_WIRE_SP4_H_L_37,
    TILE_WIRE_SP4_H_L_38,
    TILE_WIRE_SP4_H_L_39,
    TILE_WIRE_SP4_H_L_40,
    TILE_WIRE_SP4_H_L_41,
    TILE_WIRE_SP4_H_L_42,
    TILE_WIRE_SP4_H_L_43,
    TILE_WIRE_SP4_H_L_44,
    TILE_WIRE_SP4_H_L_45,
    TILE_WIRE_SP4_H_L_46,
    TILE_WIRE_SP4_H_L_47,

    TILE_WIRE_SP4_H_R_0,
    TILE_WIRE_SP4_H_R_1,
    TILE_WIRE_SP4_H_R_2,
    TILE_WIRE_SP4_H_R_3,
    TILE_WIRE_SP4_H_R_4,
    TILE_WIRE_SP4_H_R_5,
    TILE_WIRE_SP4_H_R_6,
    TILE_WIRE_SP4_H_R_7,
    TILE_WIRE_SP4_H_R_8,
    TILE_WIRE_SP4_H_R_9,
    TILE_WIRE_SP4_H_R_10,
    TILE_WIRE_SP4_H_R_11,
    TILE_WIRE_SP4_H_R_12,
    TILE_WIRE_SP4_H_R_13,
    TILE_WIRE_SP4_H_R_14,
    TILE_WIRE_SP4_H_R_15,
    TILE_WIRE_SP4_H_R_16,
    TILE_WIRE_SP4_H_R_17,
    TILE_WIRE_SP4_H_R_18,
    TILE_WIRE_SP4_H_R_19,
    TILE_WIRE_SP4_H_R_20,
    TILE_WIRE_SP4_H_R_21,
    TILE_WIRE_SP4_H_R_22,
    TILE_WIRE_SP4_H_R_23,
    TILE_WIRE_SP4_H_R_24,
    TILE_WIRE_SP4_H_R_25,
    TILE_WIRE_SP4_H_R_26,
    TILE_WIRE_SP4_H_R_27,
    TILE_WIRE_SP4_H_R_28,
    TILE_WIRE_SP4_H_R_29,
    TILE_WIRE_SP4_H_R_30,
    TILE_WIRE_SP4_H_R_31,
    TILE_WIRE_SP4_H_R_32,
    TILE_WIRE_SP4_H_R_33,
    TILE_WIRE_SP4_H_R_34,
    TILE_WIRE_SP4_H_R_35,
    TILE_WIRE_SP4_H_R_36,
    TILE_WIRE_SP4_H_R_37,
    TILE_WIRE_SP4_H_R_38,
    TILE_WIRE_SP4_H_R_39,
    TILE_WIRE_SP4_H_R_40,
    TILE_WIRE_SP4_H_R_41,
    TILE_WIRE_SP4_H_R_42,
    TILE_WIRE_SP4_H_R_43,
    TILE_WIRE_SP4_H_R_44,
    TILE_WIRE_SP4_H_R_45,
    TILE_WIRE_SP4_H_R_46,
    TILE_WIRE_SP4_H_R_47,

    TILE_WIRE_SP12_V_B_0,
    TILE_WIRE_SP12_V_B_1,
    TILE_WIRE_SP12_V_B_2,
    TILE_WIRE_SP12_V_B_3,
    TILE_WIRE_SP12_V_B_4,
    TILE_WIRE_SP12_V_B_5,
    TILE_WIRE_SP12_V_B_6,
    TILE_WIRE_SP12_V_B_7,
    TILE_WIRE_SP12_V_B_8,
    TILE_WIRE_SP12_V_B_9,
    TILE_WIRE_SP12_V_B_10,
    TILE_WIRE_SP12_V_B_11,
    TILE_WIRE_SP12_V_B_12,
    TILE_WIRE_SP12_V_B_13,
    TILE_WIRE_SP12_V_B_14,
    TILE_WIRE_SP12_V_B_15,
    TILE_WIRE_SP12_V_B_16,
    TILE_WIRE_SP12_V_B_17,
    TILE_WIRE_SP12_V_B_18,
    TILE_WIRE_SP12_V_B_19,
    TILE_WIRE_SP12_V_B_20,
    TILE_WIRE_SP12_V_B_21,
    TILE_WIRE_SP12_V_B_22,
    TILE_WIRE_SP12_V_B_23,

    TILE_WIRE_SP12_V_T_22,
    TILE_WIRE_SP12_V_T_23,

    TILE_WIRE_SP12_H_R_0,
    TILE_WIRE_SP12_H_R_1,
    TILE_WIRE_SP12_H_R_2,
    TILE_WIRE_SP12_H_R_3,
    TILE_WIRE_SP12_H_R_4,
    TILE_WIRE_SP12_H_R_5,
    TILE_WIRE_SP12_H_R_6,
    TILE_WIRE_SP12_H_R_7,
    TILE_WIRE_SP12_H_R_8,
    TILE_WIRE_SP12_H_R_9,
    TILE_WIRE_SP12_H_R_10,
    TILE_WIRE_SP12_H_R_11,
    TILE_WIRE_SP12_H_R_12,
    TILE_WIRE_SP12_H_R_13,
    TILE_WIRE_SP12_H_R_14,
    TILE_WIRE_SP12_H_R_15,
    TILE_WIRE_SP12_H_R_16,
    TILE_WIRE_SP12_H_R_17,
    TILE_WIRE_SP12_H_R_18,
    TILE_WIRE_SP12_H_R_19,
    TILE_WIRE_SP12_H_R_20,
    TILE_WIRE_SP12_H_R_21,
    TILE_WIRE_SP12_H_R_22,
    TILE_WIRE_SP12_H_R_23,

    TILE_WIRE_SP12_H_L_22,
    TILE_WIRE_SP12_H_L_23,



    TILE_WIRE_SPAN4_VERT_0,
    TILE_WIRE_SPAN4_VERT_1,
    TILE_WIRE_SPAN4_VERT_2,
    TILE_WIRE_SPAN4_VERT_3,
    TILE_WIRE_SPAN4_VERT_4,
    TILE_WIRE_SPAN4_VERT_5,
    TILE_WIRE_SPAN4_VERT_6,
    TILE_WIRE_SPAN4_VERT_7,
    TILE_WIRE_SPAN4_VERT_8,
    TILE_WIRE_SPAN4_VERT_9,
    TILE_WIRE_SPAN4_VERT_10,
    TILE_WIRE_SPAN4_VERT_11,
    TILE_WIRE_SPAN4_VERT_12,
    TILE_WIRE_SPAN4_VERT_13,
    TILE_WIRE_SPAN4_VERT_14,
    TILE_WIRE_SPAN4_VERT_15,
    TILE_WIRE_SPAN4_VERT_16,
    TILE_WIRE_SPAN4_VERT_17,
    TILE_WIRE_SPAN4_VERT_18,
    TILE_WIRE_SPAN4_VERT_19,
    TILE_WIRE_SPAN4_VERT_20,
    TILE_WIRE_SPAN4_VERT_21,
    TILE_WIRE_SPAN4_VERT_22,
    TILE_WIRE_SPAN4_VERT_23,
    TILE_WIRE_SPAN4_VERT_24,
    TILE_WIRE_SPAN4_VERT_25,
    TILE_WIRE_SPAN4_VERT_26,
    TILE_WIRE_SPAN4_VERT_27,
    TILE_WIRE_SPAN4_VERT_28,
    TILE_WIRE_SPAN4_VERT_29,
    TILE_WIRE_SPAN4_VERT_30,
    TILE_WIRE_SPAN4_VERT_31,
    TILE_WIRE_SPAN4_VERT_32,
    TILE_WIRE_SPAN4_VERT_33,
    TILE_WIRE_SPAN4_VERT_34,
    TILE_WIRE_SPAN4_VERT_35,
    TILE_WIRE_SPAN4_VERT_36,
    TILE_WIRE_SPAN4_VERT_37,
    TILE_WIRE_SPAN4_VERT_38,
    TILE_WIRE_SPAN4_VERT_39,
    TILE_WIRE_SPAN4_VERT_40,
    TILE_WIRE_SPAN4_VERT_41,
    TILE_WIRE_SPAN4_VERT_42,
    TILE_WIRE_SPAN4_VERT_43,
    TILE_WIRE_SPAN4_VERT_44,
    TILE_WIRE_SPAN4_VERT_45,
    TILE_WIRE_SPAN4_VERT_46,
    TILE_WIRE_SPAN4_VERT_47,

    TILE_WIRE_SPAN4_HORZ_0,
    TILE_WIRE_SPAN4_HORZ_1,
    TILE_WIRE_SPAN4_HORZ_2,
    TILE_WIRE_SPAN4_HORZ_3,
    TILE_WIRE_SPAN4_HORZ_4,
    TILE_WIRE_SPAN4_HORZ_5,
    TILE_WIRE_SPAN4_HORZ_6,
    TILE_WIRE_SPAN4_HORZ_7,
    TILE_WIRE_SPAN4_HORZ_8,
    TILE_WIRE_SPAN4_HORZ_9,
    TILE_WIRE_SPAN4_HORZ_10,
    TILE_WIRE_SPAN4_HORZ_11,
    TILE_WIRE_SPAN4_HORZ_12,
    TILE_WIRE_SPAN4_HORZ_13,
    TILE_WIRE_SPAN4_HORZ_14,
    TILE_WIRE_SPAN4_HORZ_15,
    TILE_WIRE_SPAN4_HORZ_16,
    TILE_WIRE_SPAN4_HORZ_17,
    TILE_WIRE_SPAN4_HORZ_18,
    TILE_WIRE_SPAN4_HORZ_19,
    TILE_WIRE_SPAN4_HORZ_20,
    TILE_WIRE_SPAN4_HORZ_21,
    TILE_WIRE_SPAN4_HORZ_22,
    TILE_WIRE_SPAN4_HORZ_23,
    TILE_WIRE_SPAN4_HORZ_24,
    TILE_WIRE_SPAN4_HORZ_25,
    TILE_WIRE_SPAN4_HORZ_26,
    TILE_WIRE_SPAN4_HORZ_27,
    TILE_WIRE_SPAN4_HORZ_28,
    TILE_WIRE_SPAN4_HORZ_29,
    TILE_WIRE_SPAN4_HORZ_30,
    TILE_WIRE_SPAN4_HORZ_31,
    TILE_WIRE_SPAN4_HORZ_32,
    TILE_WIRE_SPAN4_HORZ_33,
    TILE_WIRE_SPAN4_HORZ_34,
    TILE_WIRE_SPAN4_HORZ_35,
    TILE_WIRE_SPAN4_HORZ_36,
    TILE_WIRE_SPAN4_HORZ_37,
    TILE_WIRE_SPAN4_HORZ_38,
    TILE_WIRE_SPAN4_HORZ_39,
    TILE_WIRE_SPAN4_HORZ_40,
    TILE_WIRE_SPAN4_HORZ_41,
    TILE_WIRE_SPAN4_HORZ_42,
    TILE_WIRE_SPAN4_HORZ_43,
    TILE_WIRE_SPAN4_HORZ_44,
    TILE_WIRE_SPAN4_HORZ_45,
    TILE_WIRE_SPAN4_HORZ_46,
    TILE_WIRE_SPAN4_HORZ_47,

    TILE_WIRE_SPAN12_VERT_0,
    TILE_WIRE_SPAN12_VERT_1,
    TILE_WIRE_SPAN12_VERT_2,
    TILE_WIRE_SPAN12_VERT_3,
    TILE_WIRE_SPAN12_VERT_4,
    TILE_WIRE_SPAN12_VERT_5,
    TILE_WIRE_SPAN12_VERT_6,
    TILE_WIRE_SPAN12_VERT_7,
    TILE_WIRE_SPAN12_VERT_8,
    TILE_WIRE_SPAN12_VERT_9,
    TILE_WIRE_SPAN12_VERT_10,
    TILE_WIRE_SPAN12_VERT_11,
    TILE_WIRE_SPAN12_VERT_12,
    TILE_WIRE_SPAN12_VERT_13,
    TILE_WIRE_SPAN12_VERT_14,
    TILE_WIRE_SPAN12_VERT_15,
    TILE_WIRE_SPAN12_VERT_16,
    TILE_WIRE_SPAN12_VERT_17,
    TILE_WIRE_SPAN12_VERT_18,
    TILE_WIRE_SPAN12_VERT_19,
    TILE_WIRE_SPAN12_VERT_20,
    TILE_WIRE_SPAN12_VERT_21,
    TILE_WIRE_SPAN12_VERT_22,
    TILE_WIRE_SPAN12_VERT_23,

    TILE_WIRE_SPAN12_HORZ_0,
    TILE_WIRE_SPAN12_HORZ_1,
    TILE_WIRE_SPAN12_HORZ_2,
    TILE_WIRE_SPAN12_HORZ_3,
    TILE_WIRE_SPAN12_HORZ_4,
    TILE_WIRE_SPAN12_HORZ_5,
    TILE_WIRE_SPAN12_HORZ_6,
    TILE_WIRE_SPAN12_HORZ_7,
    TILE_WIRE_SPAN12_HORZ_8,
    TILE_WIRE_SPAN12_HORZ_9,
    TILE_WIRE_SPAN12_HORZ_10,
    TILE_WIRE_SPAN12_HORZ_11,
    TILE_WIRE_SPAN12_HORZ_12,
    TILE_WIRE_SPAN12_HORZ_13,
    TILE_WIRE_SPAN12_HORZ_14,
    TILE_WIRE_SPAN12_HORZ_15,
    TILE_WIRE_SPAN12_HORZ_16,
    TILE_WIRE_SPAN12_HORZ_17,
    TILE_WIRE_SPAN12_HORZ_18,
    TILE_WIRE_SPAN12_HORZ_19,
    TILE_WIRE_SPAN12_HORZ_20,
    TILE_WIRE_SPAN12_HORZ_21,
    TILE_WIRE_SPAN12_HORZ_22,
    TILE_WIRE_SPAN12_HORZ_23,

    TILE_WIRE_SPAN4_VERT_B_0,
    TILE_WIRE_SPAN4_VERT_B_1,
    TILE_WIRE_SPAN4_VERT_B_2,
    TILE_WIRE_SPAN4_VERT_B_3,
    TILE_WIRE_SPAN4_VERT_B_4,
    TILE_WIRE_SPAN4_VERT_B_5,
    TILE_WIRE_SPAN4_VERT_B_6,
    TILE_WIRE_SPAN4_VERT_B_7,
    TILE_WIRE_SPAN4_VERT_B_8,
    TILE_WIRE_SPAN4_VERT_B_9,
    TILE_WIRE_SPAN4_VERT_B_10,
    TILE_WIRE_SPAN4_VERT_B_11,
    TILE_WIRE_SPAN4_VERT_B_12,
    TILE_WIRE_SPAN4_VERT_B_13,
    TILE_WIRE_SPAN4_VERT_B_14,
    TILE_WIRE_SPAN4_VERT_B_15,

    TILE_WIRE_SPAN4_VERT_T_12,
    TILE_WIRE_SPAN4_VERT_T_13,
    TILE_WIRE_SPAN4_VERT_T_14,
    TILE_WIRE_SPAN4_VERT_T_15,

    TILE_WIRE_SPAN4_HORZ_R_0,
    TILE_WIRE_SPAN4_HORZ_R_1,
    TILE_WIRE_SPAN4_HORZ_R_2,
    TILE_WIRE_SPAN4_HORZ_R_3,
    TILE_WIRE_SPAN4_HORZ_R_4,
    TILE_WIRE_SPAN4_HORZ_R_5,
    TILE_WIRE_SPAN4_HORZ_R_6,
    TILE_WIRE_SPAN4_HORZ_R_7,
    TILE_WIRE_SPAN4_HORZ_R_8,
    TILE_WIRE_SPAN4_HORZ_R_9,
    TILE_WIRE_SPAN4_HORZ_R_10,
    TILE_WIRE_SPAN4_HORZ_R_11,
    TILE_WIRE_SPAN4_HORZ_R_12,
    TILE_WIRE_SPAN4_HORZ_R_13,
    TILE_WIRE_SPAN4_HORZ_R_14,
    TILE_WIRE_SPAN4_HORZ_R_15,

    TILE_WIRE_SPAN4_HORZ_L_12,
    TILE_WIRE_SPAN4_HORZ_L_13,
    TILE_WIRE_SPAN4_HORZ_L_14,
    TILE_WIRE_SPAN4_HORZ_L_15,

    TILE_WIRE_PLLIN,
    TILE_WIRE_PLLOUT_A,
    TILE_WIRE_PLLOUT_B
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
