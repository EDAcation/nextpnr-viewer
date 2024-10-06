/*
 *  nextpnr -- Next Generation Place and Route
 *
 *  Copyright (C) 2018  Claire Xenia Wolf <claire@yosyshq.com>
 *  Copyright (C) 2019  Miodrag Milanovic <micko@yosyshq.com>
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 *  WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 *  MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 *  ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 *  WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 *  ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 *  OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */
import {ConstIncs} from './ecp5.constincs';
import * as gfxconstants from './ecp5.gfx.constants';
import {GraphicElement} from './gfx';
import {Style} from './styles';
import {GfxTileWireId} from './tilewire.ecp5.gfx';
import {Type} from './types';

let first = true;

type WireId = {
    location: {x: number; y: number};
};

export class GFX {
    public static tileBel(
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        type: number,
        style: Style
    ): Array<GraphicElement> {
        let ret = [];
        let el = new GraphicElement(Type.Box, style);

        if (type === ConstIncs.DDRDLL) {
            // DDRDLL
            el.x1 = x + gfxconstants.dll_cell_x1;
            el.x2 = x + gfxconstants.dll_cell_x2;
            el.y1 = y + gfxconstants.dll_cell_y1;
            el.y2 = y + gfxconstants.dll_cell_y2;

            ret.push(el.clone());
        } else if (
            type === ConstIncs.TRELLIS_IO || // TRELLIS_IO
            type === ConstIncs.SIOLOGIC || // SIOLOGIC
            type === ConstIncs.IOLOGIC || // IOLOGIC
            type === ConstIncs.DQSBUFM
        ) {
            // DQSBUFM
            const top_bottom: boolean = y === 0 || y === h - 1;
            if (top_bottom) {
                el.x1 = x + gfxconstants.io_cell_h_x1 + (z + 2) * gfxconstants.io_cell_gap;
                el.x2 = x + gfxconstants.io_cell_h_x1 + (z + 2) * gfxconstants.io_cell_gap + 0.08;
                if (y === h - 1) {
                    el.y1 = y + 1 - gfxconstants.io_cell_h_y1;
                    el.y2 = y + 1 - gfxconstants.io_cell_h_y2;
                } else {
                    el.y1 = y + gfxconstants.io_cell_h_y1;
                    el.y2 = y + gfxconstants.io_cell_h_y2;
                }
            } else {
                if (x === 0) {
                    el.x1 = x + 1 - gfxconstants.io_cell_v_x1;
                    el.x2 = x + 1 - gfxconstants.io_cell_v_x2;
                } else {
                    el.x1 = x + gfxconstants.io_cell_v_x1;
                    el.x2 = x + gfxconstants.io_cell_v_x2;
                }
                el.y1 = y + gfxconstants.io_cell_v_y1 + z * gfxconstants.io_cell_gap;
                el.y2 = y + gfxconstants.io_cell_v_y1 + z * gfxconstants.io_cell_gap + 0.08;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.DCCA) {
            // DCCA
            el.x1 = x + gfxconstants.switchbox_x1 + z * 0.025;
            el.y1 = y + 0.14;
            el.x2 = x + gfxconstants.switchbox_x1 + z * 0.025 + 0.02;
            el.y2 = y + 0.18;
            ret.push(el.clone());
        } else if (type === ConstIncs.TRELLIS_SLICE) {
            // TRELLIS_SLICE
        } else if (type === ConstIncs.EHXPLLL) {
            // EHXPLLL
            el.x1 = x + gfxconstants.slice_x1;
            el.x2 = x + gfxconstants.slice_x2_wide;
            el.y1 = y + gfxconstants.slice_y1;
            el.y2 = y + gfxconstants.slice_y2;
            ret.push(el.clone());
        } else if (
            type === ConstIncs.DP16KD || // DP16KD
            type === ConstIncs.MULT18X18D || // MULT18X18D
            type === ConstIncs.ALU54B
        ) {
            // ALU54B
            el.x1 = x + gfxconstants.slice_x1;
            el.x2 = x + gfxconstants.slice_x2_wide;
            el.y1 = y + gfxconstants.slice_y1 - 1 * gfxconstants.slice_pitch;
            el.y2 = y + gfxconstants.slice_y2 + 3 * gfxconstants.slice_pitch;
            ret.push(el.clone());
        } else if (type === ConstIncs.DCSC) {
            // DCSC
        } else if (
            type === ConstIncs.DLLDELD || // DLLDELD
            type === ConstIncs.CLKDIVF || // CLKDIVF
            type === ConstIncs.ECLKSYNCB || // ECLKSYNCB
            type === ConstIncs.TRELLIS_ECLKBUF || // TRELLIS_ECLKBUF
            type === ConstIncs.ECLKBRIDGECS
        ) {
            // ECLKBRIDGECS
            el.x1 = x + 0.1 + z * 0.05;
            el.x2 = x + 0.14 + z * 0.05;
            el.y1 = y + 0.475;
            el.y2 = y + 0.525;
            ret.push(el.clone());
        } else if (
            type === ConstIncs.GSR || // GSR
            type === ConstIncs.JTAGG || // JTAGG
            type === ConstIncs.OSCG || // OSCG
            type === ConstIncs.SEDGA || // SEDGA
            type === ConstIncs.DTR || // DTR
            type === ConstIncs.PCSCLKDIV || // PCSCLKDIV
            type === ConstIncs.USRMCLK || // USRMCLK
            type === ConstIncs.EXTREFB
        ) {
            // EXTREFB
            el.x1 = x + gfxconstants.slice_x1;
            el.x2 = x + gfxconstants.slice_x2_wide;
            el.y1 = y + gfxconstants.slice_y1 + z * gfxconstants.slice_pitch;
            el.y2 = y + gfxconstants.slice_y2 + z * gfxconstants.slice_pitch;
            ret.push(el.clone());
        } else if (type === ConstIncs.DCUA) {
            // DCUA
            el.x1 = x + gfxconstants.slice_x1;
            el.x2 = x + gfxconstants.slice_x2_wide;
            el.y1 = y + gfxconstants.slice_y2;
            el.y2 = y + 0.25;
            ret.push(el.clone());
        } else if (type === ConstIncs.TRELLIS_COMB) {
            // TRELLIS_COMB
            let lc: number = Math.floor(z / 4);

            el.x1 = x + gfxconstants.slice_x1 + gfxconstants.slice_comb_dx1;
            el.x2 = el.x1 + gfxconstants.slice_comb_w;
            el.y1 =
                y +
                gfxconstants.slice_y1 +
                Math.floor(lc / 2) * gfxconstants.slice_pitch +
                (lc % 2 ? gfxconstants.slice_comb_dy2 : gfxconstants.slice_comb_dy1);
            el.y2 = el.y1 + gfxconstants.slice_comb_h;
            ret.push(el.clone());

            el.style = Style.Frame;
            if (lc % 2 == 0) {
                // SLICE frame
                el.x1 = x + gfxconstants.slice_x1;
                el.x2 = x + gfxconstants.slice_x2;
                el.y1 = y + gfxconstants.slice_y1 + Math.floor(lc / 2) * gfxconstants.slice_pitch;
                el.y2 = y + gfxconstants.slice_y2 + Math.floor(lc / 2) * gfxconstants.slice_pitch;
                ret.push(el.clone());

                // SLICE control set switchbox
                el.x1 = x + gfxconstants.slice_x2 + 15 * gfxconstants.wire_distance;
                el.x2 = el.x1 + gfxconstants.wire_distance;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_CLK3_SLICE -
                            GfxTileWireId.TILE_WIRE_DUMMY_D2 +
                            5 +
                            (3 - Math.floor(lc / 2)) * 26) +
                    3 * gfxconstants.slice_pitch -
                    0.0007;
                el.y2 = el.y1 + gfxconstants.wire_distance * 5;
                ret.push(el.clone());
            }

            // LUT permutation switchbox
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length_lut;
            el.x2 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            let start_wire = GfxTileWireId.TILE_WIRE_D7 + 24 * Math.floor(lc / 2) + 4 * (lc % 2);
            el.y2 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (start_wire - GfxTileWireId.TILE_WIRE_FCO + 1 + (lc / 2) * 2) +
                3 * gfxconstants.slice_pitch +
                0.25 * gfxconstants.wire_distance;
            el.y1 = el.y2 - 3.5 * gfxconstants.wire_distance;
            ret.push(el.clone());
        } else if (type === ConstIncs.TRELLIS_FF) {
            // TRELLIS_FF
            let lc = Math.floor(z / 4);
            el.x1 = x + gfxconstants.slice_x1 + gfxconstants.slice_ff_dx1;
            el.x2 = el.x1 + gfxconstants.slice_ff_w;
            el.y1 =
                y +
                gfxconstants.slice_y1 +
                Math.floor(lc / 2) * gfxconstants.slice_pitch +
                (lc % 2 ? gfxconstants.slice_comb_dy2 : gfxconstants.slice_comb_dy1);
            el.y2 = el.y1 + gfxconstants.slice_comb_h;
            ret.push(el.clone());
        } else if (type === ConstIncs.TRELLIS_RAMW) {
            // TRELLIS_RAMW
            // do not draw
        } else if (first) {
            console.log(x, y, z, type);
            first = false;
        }

        return ret;
    }

    public static tileWire(
        x: number,
        y: number,
        w: number,
        h: number,
        type: number,
        tilewire: GfxTileWireId,
        style: Style
    ): Array<GraphicElement> {
        const ret: Array<GraphicElement> = [];
        let el = new GraphicElement(Type.Line, style);

        if (type === ConstIncs.WIRE_TYPE_NONE) {
            // WIRE_TYPE_NONE
            if (tilewire >= GfxTileWireId.TILE_WIRE_NBOUNCE && tilewire <= GfxTileWireId.TILE_WIRE_SBOUNCE) {
                el.x1 = x + gfxconstants.switchbox_x2 - gfxconstants.wire_distance * 4;
                el.x2 = x + gfxconstants.switchbox_x2 - gfxconstants.wire_distance * 8;
                if (tilewire == GfxTileWireId.TILE_WIRE_NBOUNCE) {
                    el.y1 = y + gfxconstants.switchbox_y2 + gfxconstants.wire_distance * 4;
                    el.y2 = el.y1;
                } else {
                    el.y1 = y + gfxconstants.switchbox_y1 - gfxconstants.wire_distance * 4;
                    el.y2 = el.y1;
                }
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_WBOUNCE && tilewire <= GfxTileWireId.TILE_WIRE_EBOUNCE) {
                el.y1 = y + gfxconstants.switchbox_y1 + gfxconstants.wire_distance * 4;
                el.y2 = y + gfxconstants.switchbox_y1 + gfxconstants.wire_distance * 8;
                if (tilewire == GfxTileWireId.TILE_WIRE_WBOUNCE) {
                    el.x1 = x + gfxconstants.switchbox_x1 - gfxconstants.wire_distance * 4;
                    el.x2 = el.x1;
                } else {
                    el.x1 = x + gfxconstants.switchbox_x2 + gfxconstants.wire_distance * 4;
                    el.x2 = el.x1;
                }
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_CLK0 && tilewire <= GfxTileWireId.TILE_WIRE_LSR1) {
                el.x1 = x + gfxconstants.switchbox_x2;
                el.x2 =
                    x +
                    gfxconstants.slice_x2 +
                    15 * gfxconstants.wire_distance +
                    (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * gfxconstants.wire_distance;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_CLK0 - 5) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
                el.x1 = el.x2;
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (3 + (tilewire - GfxTileWireId.TILE_WIRE_CLK0));
                ret.push(el.clone());
                for (let i = 0; i < 4; i++) {
                    el.x1 = x + gfxconstants.slice_x2 + 15 * gfxconstants.wire_distance + gfxconstants.wire_distance;
                    el.x2 =
                        x +
                        gfxconstants.slice_x2 +
                        15 * gfxconstants.wire_distance +
                        (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * gfxconstants.wire_distance;
                    el.y1 =
                        y +
                        gfxconstants.slice_y2 -
                        gfxconstants.wire_distance *
                            (GfxTileWireId.TILE_WIRE_CLK3_SLICE -
                                GfxTileWireId.TILE_WIRE_DUMMY_D2 +
                                1 +
                                tilewire -
                                GfxTileWireId.TILE_WIRE_CLK0) +
                        i * gfxconstants.slice_pitch;
                    el.y2 = el.y1;
                    ret.push(el.clone());
                }
                if (tilewire == GfxTileWireId.TILE_WIRE_CLK1 || tilewire == GfxTileWireId.TILE_WIRE_LSR1) {
                    for (let i = 0; i < 2; i++) {
                        el.x1 = x + gfxconstants.slice_x2 + 3 * gfxconstants.wire_distance;
                        el.x2 =
                            x +
                            gfxconstants.slice_x2 +
                            15 * gfxconstants.wire_distance +
                            (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * gfxconstants.wire_distance;
                        el.y1 =
                            y +
                            gfxconstants.slice_y2 -
                            gfxconstants.wire_distance *
                                (GfxTileWireId.TILE_WIRE_CLK3_SLICE -
                                    GfxTileWireId.TILE_WIRE_DUMMY_D2 -
                                    1 +
                                    Math.floor((tilewire - GfxTileWireId.TILE_WIRE_CLK0) / 2)) +
                            i * gfxconstants.slice_pitch;
                        el.y2 = el.y1;
                        ret.push(el.clone());
                    }
                }
            }

            // TRELLIS_IO wires
            else if (tilewire >= GfxTileWireId.TILE_WIRE_JDIA && tilewire <= GfxTileWireId.TILE_WIRE_ECLKD) {
                el.x1 = x + 0.5;
                el.x2 = x + 0.5 + gfxconstants.wire_length;
                const top: boolean = y == h - 1;
                if (top)
                    el.y1 =
                        y +
                        1 -
                        (gfxconstants.slice_y2 -
                            gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                            3 * gfxconstants.slice_pitch);
                else
                    el.y1 =
                        y +
                        gfxconstants.slice_y2 -
                        gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                        3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_JCE0 && tilewire <= GfxTileWireId.TILE_WIRE_JQ7) {
                el.x1 = x + gfxconstants.switchbox_x2;
                el.x2 = x + gfxconstants.switchbox_x2 + gfxconstants.wire_length;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JCE0 + 1) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_FCO && tilewire <= GfxTileWireId.TILE_WIRE_FCI) {
                const gap: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_FCO) / 24);
                el.x1 = x + gfxconstants.switchbox_x2;
                el.x2 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_FCO + 1 + gap * 2) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_MUXCLK3 && tilewire <= GfxTileWireId.TILE_WIRE_MUXLSR0) {
                const gap: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_MUXCLK3) / 2);
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_MUXCLK3) % 2;
                el.x1 = x + gfxconstants.slice_x2 + 3 * gfxconstants.wire_distance;
                el.x2 = x + gfxconstants.slice_x2 + 15 * gfxconstants.wire_distance;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_CLK3_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + gap * 26) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_WD3 && tilewire <= GfxTileWireId.TILE_WIRE_WD0) {
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_WD3) % 4;
                const group: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_WD3) / 2);
                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2 + gfxconstants.wire_length + gfxconstants.wire_distance * (4 - part);
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_WDO3C_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());

                el.x1 = el.x2;
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_WD1B_SLICE -
                            GfxTileWireId.TILE_WIRE_DUMMY_D2 +
                            1 +
                            (part & 1) +
                            14 * 2) +
                    (3 - group) * gfxconstants.slice_pitch;
                ret.push(el.clone());

                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.y1 = el.y2;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_WAD3 && tilewire <= GfxTileWireId.TILE_WIRE_WAD0) {
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_WAD3) % 4;
                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2 + gfxconstants.wire_length + gfxconstants.wire_distance * (8 - part);
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_WADO3C_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());

                el.x1 = el.x2;
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_WAD3B_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14 * 2) +
                    2 * gfxconstants.slice_pitch;
                ret.push(el.clone());

                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.y1 = el.y2;
                ret.push(el.clone());

                // middle line
                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2 + gfxconstants.wire_length + gfxconstants.wire_distance * (8 - part);
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance *
                        (GfxTileWireId.TILE_WIRE_WAD3B_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14 * 2) +
                    3 * gfxconstants.slice_pitch;
                el.y1 = el.y2;
                ret.push(el.clone());
            }
        } else if (type === ConstIncs.WIRE_TYPE_DDRDLL) {
            // WIRE_TYPE_DDRDLL
            const num = tilewire - GfxTileWireId.TILE_WIRE_DDRDEL_DDRDLL;
            el.x1 = x + gfxconstants.io_cell_h_x1 + 0.2 + gfxconstants.wire_distance * (num + 1);
            el.x2 = el.x1;
            if (y == h - 1) {
                el.y1 = y + gfxconstants.dll_cell_y1;
                el.y2 = el.y1 - gfxconstants.wire_length_long;
            } else {
                el.y1 = y + gfxconstants.dll_cell_y2;
                el.y2 = el.y1 + gfxconstants.wire_length_long;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_OSC) {
            // WIRE_TYPE_OSC
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_SEDSTDBY_OSC + 1) +
                2 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_V01) {
            // WIRE_TYPE_V01
            if (tilewire >= GfxTileWireId.TILE_WIRE_V01N0001 && tilewire <= GfxTileWireId.TILE_WIRE_V01S0100) {
                el.x1 =
                    x +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (10 + tilewire - GfxTileWireId.TILE_WIRE_V01N0001);
                el.x2 = el.x1;
                if (y == h - 2) el.y1 = y + 1.1;
                else el.y1 = y + gfxconstants.switchbox_y1 + 1;

                if (y == 0) el.y2 = y + 0.9;
                else el.y2 = y + gfxconstants.switchbox_y2;

                ret.push(el.clone());
            }
        } else if (type === ConstIncs.WIRE_TYPE_V02) {
            // WIRE_TYPE_V02
            if (y == 0) el.y1 = 0.9;
            else
                el.y1 =
                    y +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.y2 = el.y1;
            el.x1 = x + gfxconstants.switchbox_x1;
            el.x2 =
                x +
                gfxconstants.switchbox_x1 -
                gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            if (y != 0 && y != h - 1) ret.push(el.clone());

            if (y == h - 2) el.y2 = y + 1 + 0.1;
            else
                el.y2 =
                    y +
                    1 +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x1 = el.x2;
            if (y != h - 1) ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + gfxconstants.switchbox_x1;
            if (y != h - 1 && y != h - 2) ret.push(el.clone());

            if (y == h - 1) el.y1 = y + 0.1;
            else
                el.y1 =
                    y +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            if (y == 1) el.y2 = y - 1 + 0.9;
            else
                el.y2 =
                    y -
                    1 +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x2 =
                x +
                gfxconstants.switchbox_x1 -
                gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x1 = el.x2;
            if (y != 0) ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + gfxconstants.switchbox_x1;
            if (y != 0 && y != 1) ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_V06) {
            // WIRE_TYPE_V06
            if (y == 0) el.y1 = 0.9;
            else
                el.y1 =
                    y +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.y2 = el.y1;
            el.x1 = x + gfxconstants.switchbox_x1;
            el.x2 =
                x +
                gfxconstants.switchbox_x1 -
                gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            if (y != 0 && y != h - 1) ret.push(el.clone());

            if (y == h - 2 || y == h - 3 || y == h - 4) el.y2 = h - 1 + 0.1;
            else
                el.y2 =
                    y +
                    3 +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x1 = el.x2;
            if (y != h - 1) ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + gfxconstants.switchbox_x1;
            if (y != h - 1 && y != h - 2 && y != h - 3 && y != h - 4) ret.push(el.clone());

            if (y == h - 1) el.y1 = y + 0.1;
            else
                el.y1 =
                    y +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            if (y == 1 || y == 2 || y == 3) el.y2 = 0.9;
            else
                el.y2 =
                    y -
                    3 +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x2 =
                x +
                gfxconstants.switchbox_x1 -
                gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x1 = el.x2;
            if (y != 0) ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + gfxconstants.switchbox_x1;
            if (y != 0 && y != 1 && y != 2 && y != 3) ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_PIO) {
            // WIRE_TYPE_PIO
            const top_bottom: boolean = y == 0 || y == h - 1;
            const gap = 3 - Math.floor((tilewire - GfxTileWireId.TILE_WIRE_PADDOD_PIO) / 7);
            const num = (tilewire - GfxTileWireId.TILE_WIRE_PADDOD_PIO) % 7;
            if (top_bottom) {
                el.x1 =
                    x +
                    gfxconstants.io_cell_h_x1 +
                    (gap + 2) * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
                el.x2 = el.x1;
                if (y == h - 1) {
                    el.y1 = y + 1 - gfxconstants.io_cell_h_y2;
                    el.y2 = el.y1 - gfxconstants.wire_length_long;
                } else {
                    el.y1 = y + gfxconstants.io_cell_h_y2;
                    el.y2 = el.y1 + gfxconstants.wire_length_long;
                }
            } else {
                if (x == 0) {
                    el.x1 = x + 1 - gfxconstants.io_cell_v_x1;
                    el.x2 = el.x1 + gfxconstants.wire_length_long;
                } else {
                    el.x1 = x + gfxconstants.io_cell_v_x1;
                    el.x2 = el.x1 - gfxconstants.wire_length_long;
                }
                el.y1 =
                    y +
                    gfxconstants.io_cell_v_y1 +
                    gap * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
                el.y2 = el.y1;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_SIOLOGIC) {
            // WIRE_TYPE_SIOLOGIC
            const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) / 20);
            const num = (tilewire - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
            el.x1 =
                x +
                gfxconstants.io_cell_h_x1 +
                (5 - gap) * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
            el.x2 = el.x1;
            if (y == h - 1) {
                el.y1 = y + 1 - gfxconstants.io_cell_h_y2;
                el.y2 = el.y1 - gfxconstants.wire_length_long;
            } else {
                el.y1 = y + gfxconstants.io_cell_h_y2;
                el.y2 = el.y1 + gfxconstants.wire_length_long;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_H06) {
            // WIRE_TYPE_H06
            if (x == 0) el.x1 = 0.9;
            else
                el.x1 =
                    x +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.x2 = el.x1;
            el.y1 = y + gfxconstants.switchbox_y1;
            el.y2 =
                y +
                gfxconstants.switchbox_y1 -
                gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            if (x != 0 && x != w - 1) ret.push(el.clone());

            if (x == w - 2 || x == w - 3 || x == w - 4) el.x2 = w - 1 + 0.1;
            else
                el.x2 =
                    x +
                    3 +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y1 = el.y2;
            if (x != w - 1) ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + gfxconstants.switchbox_y1;
            if (x != w - 1 && x != w - 2 && x != w - 3 && x != w - 4) ret.push(el.clone());

            if (x == w - 1) el.x1 = x + 0.1;
            else
                el.x1 =
                    x +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            if (x == 1 || x == 2 || x == 3) el.x2 = 0.9;
            else
                el.x2 =
                    x -
                    3 +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y2 =
                y +
                gfxconstants.switchbox_y1 -
                gfxconstants.wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y1 = el.y2;
            if (x != 0) ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + gfxconstants.switchbox_y1;
            if (x != 0 && x != 1 && x != 2 && x != 3) ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_H02) {
            // WIRE_TYPE_H02
            if (x == 0) el.x1 = 0.9;
            else
                el.x1 =
                    x +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.x2 = el.x1;
            el.y1 = y + gfxconstants.switchbox_y1;
            el.y2 =
                y +
                gfxconstants.switchbox_y1 -
                gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            if (x != 0 && x != w - 1) ret.push(el.clone());

            if (x == w - 2) el.x2 = x + 1 + 0.1;
            else
                el.x2 =
                    x +
                    1 +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y1 = el.y2;
            if (x != w - 1) ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + gfxconstants.switchbox_y1;
            if (x != w - 1 && x != w - 2) ret.push(el.clone());

            if (x == w - 1) el.x1 = x + 0.1;
            else
                el.x1 =
                    x +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            if (x == 1) el.x2 = x - 1 + 0.9;
            else
                el.x2 =
                    x -
                    1 +
                    gfxconstants.switchbox_x1 +
                    gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y2 =
                y +
                gfxconstants.switchbox_y1 -
                gfxconstants.wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y1 = el.y2;
            if (x != 0) ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + gfxconstants.switchbox_y1;
            if (x != 0 && x != 1) ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_H01) {
            // WIRE_TYPE_H01
            if (tilewire >= GfxTileWireId.TILE_WIRE_H01E0001 && tilewire <= GfxTileWireId.TILE_WIRE_HL7W0001) {
                if (x == w - 1) el.x1 = x + 0.1;
                else el.x1 = x + gfxconstants.switchbox_x1;
                if (x == 1) el.x2 = x - 0.1;
                else el.x2 = x + gfxconstants.switchbox_x2 - 1;
                el.y1 =
                    y +
                    gfxconstants.switchbox_y1 +
                    gfxconstants.wire_distance * (10 + tilewire - GfxTileWireId.TILE_WIRE_H01E0001);
                el.y2 = el.y1;
                ret.push(el.clone());
            }
        } else if (type === ConstIncs.WIRE_TYPE_G_HPBX) {
            // WIRE_TYPE_G_HPBX
            el.x1 = x;
            el.x2 = x + 1;
            el.y1 = y + 0.1 + gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_G_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());

            el.x1 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance * (200 + (tilewire - GfxTileWireId.TILE_WIRE_G_HPBX0000));
            el.x2 = el.x1;
            el.y2 = y + gfxconstants.switchbox_y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_H00) {
            // WIRE_TYPE_H00
            const group = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_H00L0000) / 2);
            el.y1 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance * (8 - ((tilewire - GfxTileWireId.TILE_WIRE_H00L0000) % 2) * 4);
            el.y2 = el.y1;

            if (group) {
                el.x1 = x + gfxconstants.switchbox_x2 + gfxconstants.wire_distance * 4;
                el.x2 = x + gfxconstants.switchbox_x2;
            } else {
                el.x1 = x + gfxconstants.switchbox_x1 - gfxconstants.wire_distance * 4;
                el.x2 = x + gfxconstants.switchbox_x1;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_V00) {
            // WIRE_TYPE_V00
            const group = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_V00T0000) / 2);
            el.x1 =
                x +
                gfxconstants.switchbox_x2 -
                gfxconstants.wire_distance * (8 - ((tilewire - GfxTileWireId.TILE_WIRE_V00T0000) % 2) * 4);
            el.x2 = el.x1;
            if (group) {
                el.y1 = y + gfxconstants.switchbox_y1;
                el.y2 = y + gfxconstants.switchbox_y1 - gfxconstants.wire_distance * 4;
            } else {
                el.y1 = y + gfxconstants.switchbox_y2;
                el.y2 = y + gfxconstants.switchbox_y2 + gfxconstants.wire_distance * 4;
            }
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_G_VPTX) {
            // WIRE_TYPE_G_VPTX
            el.x1 = x + 0.1 + gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_G_VPTX0000 + 1);
            el.x2 = el.x1;
            el.y1 = y;
            el.y2 = y + 1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_L_HPBX) {
            // WIRE_TYPE_L_HPBX
            el.x1 = x - 3;
            el.x2 = x + 0.08;
            el.y1 =
                y +
                gfxconstants.wire_distance +
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_L_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === 1301) {
            el.x1 = x + 0.2;
            el.x2 = x + 3;
            el.y1 =
                y +
                gfxconstants.wire_distance +
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_R_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === 1271 && tilewire != GfxTileWireId.TILE_WIRE_NONE) {
            if (tilewire >= GfxTileWireId.TILE_WIRE_FCO_SLICE && tilewire <= GfxTileWireId.TILE_WIRE_FCI_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) / 24);
                const item = (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) % 24;
                el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x1;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE + 1 + gap * 2) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
                // FX to F connection - top
                if (item == GfxTileWireId.TILE_WIRE_FXD_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - gfxconstants.wire_distance;
                    ret.push(el.clone());
                }
                // F5 to F connection - bottom
                if (item == GfxTileWireId.TILE_WIRE_F5D_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 + gfxconstants.wire_distance;
                    ret.push(el.clone());
                }
                // connection between slices
                if (
                    item == GfxTileWireId.TILE_WIRE_FCID_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE &&
                    tilewire != GfxTileWireId.TILE_WIRE_FCI_SLICE
                ) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - gfxconstants.wire_distance * 3;
                    ret.push(el.clone());
                }
            }
            if (tilewire >= GfxTileWireId.TILE_WIRE_DUMMY_D2 && tilewire <= GfxTileWireId.TILE_WIRE_WAD0A_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2) / 12);
                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + gap * 14) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }
        } else if (type === ConstIncs.WIRE_TYPE_IOLOGIC) {
            // WIRE_TYPE_IOLOGIC
            const gap = 7 - Math.floor((tilewire - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) / 42);
            const num = (tilewire - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) % 42;
            if (x == 0) {
                el.x1 = x + 1 - gfxconstants.io_cell_v_x1;
                el.x2 = el.x1 + gfxconstants.wire_length_long;
            } else {
                el.x1 = x + gfxconstants.io_cell_v_x1;
                el.x2 = el.x1 - gfxconstants.wire_length_long;
            }
            el.y1 =
                y + gfxconstants.io_cell_v_y1 + gap * gfxconstants.io_cell_gap + gfxconstants.wire_distance * (num + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_DQS) {
            // WIRE_TYPE_DQS
            const num = tilewire - GfxTileWireId.TILE_WIRE_DDRDEL_DQS;
            if (x == 0) {
                el.x1 = x + 1 - gfxconstants.io_cell_v_x1;
                el.x2 = el.x1 + gfxconstants.wire_length_long;
            } else {
                el.x1 = x + gfxconstants.io_cell_v_x1;
                el.x2 = el.x1 - gfxconstants.wire_length_long;
            }
            el.y1 =
                y + gfxconstants.io_cell_v_y1 + 8 * gfxconstants.io_cell_gap + gfxconstants.wire_distance * (num + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_MULT18) {
            // WIRE_TYPE_MULT18
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance_small * (tilewire - GfxTileWireId.TILE_WIRE_JCLK0_MULT18 + 1) +
                3 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_ALU54) {
            // WIRE_TYPE_ALU54
            const num = (tilewire - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) % 225;
            const group = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) / 225);
            if (group == 0) {
                el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x1;
            } else {
                el.x1 = x + gfxconstants.slice_x2_wide + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2_wide;
            }
            el.y1 =
                y + gfxconstants.slice_y2 - gfxconstants.wire_distance_small * (num + 1) + 3 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_EBR) {
            // WIRE_TYPE_EBR
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JADA0_EBR + 1) +
                3 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_PLL) {
            // WIRE_TYPE_PLL
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_CLKI_PLL + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_SED) {
            // WIRE_TYPE_SED
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_SEDSTDBY_SED + 1) +
                3 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_JTAG) {
            // WIRE_TYPE_JTAG
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JJCE1_JTAG + 1) +
                1 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_GSR) {
            // WIRE_TYPE_GSR
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JCLK_GSR + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_DTR) {
            // WIRE_TYPE_DTR
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JSTARTPULSE_DTR + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_PCSCLKDIV) {
            // WIRE_TYPE_PCSCLKDIV
            const num = (tilewire - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
            const group = 1 - Math.floor((tilewire - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) / 7);
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y + gfxconstants.slice_y2 - gfxconstants.wire_distance * (num + 1) + group * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_CCLK) {
            // WIRE_TYPE_CCLK
            const num = tilewire - GfxTileWireId.TILE_WIRE_JPADDI_CCLK;
            el.x1 = x + gfxconstants.slice_x1 + gfxconstants.wire_distance * (num + 1);
            el.x2 = el.x1;
            el.y1 = y + gfxconstants.slice_y2 - 1 * gfxconstants.slice_pitch;
            el.y2 = el.y1 - gfxconstants.wire_length_long;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_DCU) {
            // WIRE_TYPE_DCU
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_CH0_RX_REFCLK_DCU + 1) +
                0 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_EXTREF) {
            // WIRE_TYPE_EXTREF
            el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.x2 = x + gfxconstants.slice_x1;
            el.y1 =
                y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_REFCLKP_EXTREF + 1) +
                1 * gfxconstants.slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === ConstIncs.WIRE_TYPE_SLICE) {
            // WIRE_TYPE_SLICE
            if (tilewire >= GfxTileWireId.TILE_WIRE_FCO_SLICE && tilewire <= GfxTileWireId.TILE_WIRE_FCI_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) / 24);
                const item = (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) % 24;
                el.x1 = x + gfxconstants.slice_x1 - gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x1;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE + 1 + gap * 2) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
                // FX to F connection - top
                if (item == GfxTileWireId.TILE_WIRE_FXD_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - gfxconstants.wire_distance;
                    ret.push(el.clone());
                }
                // F5 to F connection - bottom
                if (item == GfxTileWireId.TILE_WIRE_F5D_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 + gfxconstants.wire_distance;
                    ret.push(el.clone());
                }
                // connection between slices
                if (
                    item == GfxTileWireId.TILE_WIRE_FCID_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE &&
                    tilewire != GfxTileWireId.TILE_WIRE_FCI_SLICE
                ) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - gfxconstants.wire_distance * 3;
                    ret.push(el.clone());
                }
            }
            if (tilewire >= GfxTileWireId.TILE_WIRE_DUMMY_D2 && tilewire <= GfxTileWireId.TILE_WIRE_WAD0A_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2) / 12);
                el.x1 = x + gfxconstants.slice_x2 + gfxconstants.wire_length;
                el.x2 = x + gfxconstants.slice_x2;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + gap * 14) +
                    3 * gfxconstants.slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }
        } else if (first) {
            console.log(x, y, type);
            first = false;
        }

        return ret;
    }

    private static setSource(
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId
    ) {
        if (src_type == ConstIncs.WIRE_TYPE_H00) {
            const group: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_H00L0000) / 2);
            el.y1 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance * (8 - ((src_id - GfxTileWireId.TILE_WIRE_H00L0000) % 2) * 4);

            if (group) {
                el.x1 = x + gfxconstants.switchbox_x2;
            } else {
                el.x1 = x + gfxconstants.switchbox_x1;
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_H01) {
            if (x == src.location.x) el.x1 = x + gfxconstants.switchbox_x1;
            else el.x1 = x + gfxconstants.switchbox_x2;
            el.y1 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance * (10 + src_id - GfxTileWireId.TILE_WIRE_H01E0001);
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02) {
            el.x1 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance *
                    (20 + (src_id - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (src.location.x % 3));
            el.y1 = y + gfxconstants.switchbox_y1;
        }
        if (src_type == ConstIncs.WIRE_TYPE_H06) {
            el.x1 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance *
                    (96 + (src_id - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (src.location.x % 9));
            el.y1 = y + gfxconstants.switchbox_y1;
        }
        if (src_type == ConstIncs.WIRE_TYPE_V00) {
            const group: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_V00T0000) / 2);
            el.x1 =
                x +
                gfxconstants.switchbox_x2 -
                gfxconstants.wire_distance * (8 - ((src_id - GfxTileWireId.TILE_WIRE_V00T0000) % 2) * 4);
            if (group) {
                el.y1 = y + gfxconstants.switchbox_y1;
            } else {
                el.y1 = y + gfxconstants.switchbox_y2;
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_V01) {
            el.x1 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance * (10 + src_id - GfxTileWireId.TILE_WIRE_V01N0001);
            if (y == src.location.y) el.y1 = y + gfxconstants.switchbox_y2;
            else el.y1 = y + gfxconstants.switchbox_y1;
        }
        if (src_type == ConstIncs.WIRE_TYPE_V02) {
            el.x1 = x + gfxconstants.switchbox_x1;
            el.y1 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance *
                    (20 + (src_id - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (src.location.y % 3));
        }
        if (src_type == ConstIncs.WIRE_TYPE_V06) {
            el.x1 = x + gfxconstants.switchbox_x1;
            el.y1 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance *
                    (96 + (src_id - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (src.location.y % 9));
        }
        if (src_type == ConstIncs.WIRE_TYPE_NONE) {
            if (src_id >= GfxTileWireId.TILE_WIRE_CLK0 && src_id <= GfxTileWireId.TILE_WIRE_LSR1) {
                el.x1 = x + gfxconstants.switchbox_x2;
                el.y1 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_CLK0 - 5) +
                    3 * gfxconstants.slice_pitch;
            }
            if (src_id >= GfxTileWireId.TILE_WIRE_FCO && src_id <= GfxTileWireId.TILE_WIRE_FCI) {
                const gap: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_FCO) / 24);
                el.x1 = src.location.x + gfxconstants.switchbox_x2;
                el.y1 =
                    src.location.y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_FCO + 1 + gap * 2) +
                    3 * gfxconstants.slice_pitch;
            }
            if (src_id >= GfxTileWireId.TILE_WIRE_JCE0 && src_id <= GfxTileWireId.TILE_WIRE_JQ7) {
                el.x1 = src.location.x + gfxconstants.switchbox_x2 + gfxconstants.wire_length;
                el.y1 =
                    src.location.y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JCE0 + 1) +
                    3 * gfxconstants.slice_pitch;
            }
            if (src_id >= GfxTileWireId.TILE_WIRE_JDIA && src_id <= GfxTileWireId.TILE_WIRE_ECLKD) {
                const top: boolean = src.location.y == h - 1;
                el.x1 = src.location.x + 0.5 + gfxconstants.wire_length;
                if (top)
                    el.y1 =
                        src.location.y +
                        1 -
                        (gfxconstants.slice_y2 -
                            gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                            3 * gfxconstants.slice_pitch);
                else
                    el.y1 =
                        src.location.y +
                        gfxconstants.slice_y2 -
                        gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                        3 * gfxconstants.slice_pitch;
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_IOLOGIC) {
            const gap: number = 7 - Math.floor((src_id - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) / 42);
            const num: number = (src_id - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) % 42;
            if (src.location.x == 0) {
                el.x1 = src.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
            } else {
                el.x1 = src.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
            }
            el.y1 =
                src.location.y +
                gfxconstants.io_cell_v_y1 +
                gap * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
        }
        if (src_type == ConstIncs.WIRE_TYPE_SIOLOGIC) {
            const gap: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) / 20);
            const num: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) % 20);
            el.x1 =
                src.location.x +
                gfxconstants.io_cell_h_x1 +
                (5 - gap) * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
            if (src.location.y == h - 1) {
                el.y1 = src.location.y + 1 - gfxconstants.io_cell_h_y2 - gfxconstants.wire_length_long;
            } else {
                el.y1 = src.location.y + gfxconstants.io_cell_h_y2 + gfxconstants.wire_length_long;
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_PIO) {
            const top_bottom: boolean = src.location.y == 0 || src.location.y == h - 1;
            const gap: number = 3 - Math.floor((src_id - GfxTileWireId.TILE_WIRE_PADDOD_PIO) / 7);
            const num: number = (src_id - GfxTileWireId.TILE_WIRE_PADDOD_PIO) % 7;
            if (top_bottom) {
                el.x1 =
                    src.location.x +
                    gfxconstants.io_cell_h_x1 +
                    (gap + 2) * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
                if (src.location.y == h - 1) {
                    el.y1 = src.location.y + 1 - gfxconstants.io_cell_h_y2 - gfxconstants.wire_length_long;
                } else {
                    el.y1 = src.location.y + 1 - gfxconstants.io_cell_h_y2 + gfxconstants.wire_length_long;
                }
            } else {
                if (x == 0) {
                    el.x1 = src.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
                } else {
                    el.x1 = src.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
                }
                el.y1 =
                    src.location.y +
                    gfxconstants.io_cell_v_y1 +
                    gap * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_EBR) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JADA0_EBR + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_MULT18) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance_small * (src_id - GfxTileWireId.TILE_WIRE_JCLK0_MULT18 + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_ALU54) {
            const num: number = (src_id - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) % 225;
            const group: number = Math.floor((src_id - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) / 225);
            if (group == 0) {
                el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            } else {
                el.x1 = src.location.x + gfxconstants.slice_x2_wide + gfxconstants.wire_length;
            }
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance_small * (num + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_PLL) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_CLKI_PLL + 1);
        }
        if (src_type == ConstIncs.WIRE_TYPE_GSR) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JCLK_GSR + 1);
        }
        if (src_type == ConstIncs.WIRE_TYPE_JTAG) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JJCE1_JTAG + 1) +
                1 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_OSC) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_SEDSTDBY_OSC + 1) +
                2 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_SED) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_SEDSTDBY_SED + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_DTR) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_JSTARTPULSE_DTR + 1);
        }
        if (src_type == ConstIncs.WIRE_TYPE_EXTREF) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_REFCLKP_EXTREF + 1) +
                1 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_DCU) {
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_CH0_RX_REFCLK_DCU + 1) +
                0 * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_PCSCLKDIV) {
            const num: number = (src_id - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
            const group: number = 1 - Math.floor((src_id - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) / 7);
            el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y1 =
                src.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (num + 1) +
                group * gfxconstants.slice_pitch;
        }
        if (src_type == ConstIncs.WIRE_TYPE_DQS) {
            const num: number = src_id - GfxTileWireId.TILE_WIRE_DDRDEL_DQS;
            if (src.location.x == 0) {
                el.x1 = src.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
            } else {
                el.x1 = src.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
            }
            el.y1 =
                src.location.y +
                gfxconstants.io_cell_v_y1 +
                8 * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
        }
        if (src_type == ConstIncs.WIRE_TYPE_DDRDLL) {
            const num: number = src_id - GfxTileWireId.TILE_WIRE_DDRDEL_DDRDLL;
            el.x1 =
                src.location.x +
                gfxconstants.io_cell_h_x1 +
                gfxconstants.dll_cell_x1 +
                gfxconstants.wire_distance * (num + 1);
            if (src.location.y == h - 1) {
                el.y1 = src.location.y + gfxconstants.dll_cell_y1 - gfxconstants.wire_length_long;
            } else {
                el.y1 = src.location.y + gfxconstants.dll_cell_y2 + gfxconstants.wire_length_long;
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_CCLK) {
            const num: number = src_id - GfxTileWireId.TILE_WIRE_JPADDI_CCLK;
            el.x1 = src.location.x + gfxconstants.slice_x1 + gfxconstants.wire_distance * (num + 1);
            el.y1 =
                src.location.y + gfxconstants.slice_y2 - 1 * gfxconstants.slice_pitch - gfxconstants.wire_length_long;
        }
        if (src_type == ConstIncs.WIRE_TYPE_G_HPBX) {
            el.x1 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance * (200 + (src_id - GfxTileWireId.TILE_WIRE_G_HPBX0000));
            el.y1 = y + gfxconstants.switchbox_y1;
        }
    }

    private static setDestination(
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId
    ) {
        if (dst_type == ConstIncs.WIRE_TYPE_H00) {
            const group: number = Math.floor((dst_id - GfxTileWireId.TILE_WIRE_H00L0000) / 2);
            el.y2 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance * (8 - ((dst_id - GfxTileWireId.TILE_WIRE_H00L0000) % 2) * 4);

            if (group) {
                el.x2 = x + gfxconstants.switchbox_x2;
            } else {
                el.x2 = x + gfxconstants.switchbox_x1;
            }
        }
        if (dst_type == ConstIncs.WIRE_TYPE_H01) {
            if (x == dst.location.x) el.x2 = x + gfxconstants.switchbox_x1;
            else el.x2 = x + gfxconstants.switchbox_x2;
            el.y2 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance * (10 + dst_id - GfxTileWireId.TILE_WIRE_H01E0001);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_H02) {
            el.x2 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance *
                    (20 + (dst_id - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (dst.location.x % 3));
            el.y2 = y + gfxconstants.switchbox_y1;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_H06) {
            el.x2 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance *
                    (96 + (dst_id - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (dst.location.x % 9));
            el.y2 = y + gfxconstants.switchbox_y1;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_V00) {
            const group: number = Math.floor((dst_id - GfxTileWireId.TILE_WIRE_V00T0000) / 2);
            el.x2 =
                x +
                gfxconstants.switchbox_x2 -
                gfxconstants.wire_distance * (8 - ((dst_id - GfxTileWireId.TILE_WIRE_V00T0000) % 2) * 4);
            if (group) {
                el.y2 = y + gfxconstants.switchbox_y1;
            } else {
                el.y2 = y + gfxconstants.switchbox_y2;
            }
        }
        if (dst_type == ConstIncs.WIRE_TYPE_V01) {
            el.x2 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance * (10 + dst_id - GfxTileWireId.TILE_WIRE_V01N0001);
            if (y == dst.location.y) el.y2 = y + gfxconstants.switchbox_y2;
            else el.y2 = y + gfxconstants.switchbox_y1;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_V02) {
            el.x2 = x + gfxconstants.switchbox_x1;
            el.y2 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance *
                    (20 + (dst_id - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (dst.location.y % 3));
        }
        if (dst_type == ConstIncs.WIRE_TYPE_V06) {
            el.x2 = x + gfxconstants.switchbox_x1;
            el.y2 =
                y +
                gfxconstants.switchbox_y1 +
                gfxconstants.wire_distance *
                    (96 + (dst_id - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (dst.location.y % 9));
        }

        if (dst_type == ConstIncs.WIRE_TYPE_NONE) {
            if (dst_id >= GfxTileWireId.TILE_WIRE_CLK0 && dst_id <= GfxTileWireId.TILE_WIRE_LSR1) {
                el.x2 = x + gfxconstants.switchbox_x2;
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_CLK0 - 5) +
                    3 * gfxconstants.slice_pitch;
            }
            if (dst_id >= GfxTileWireId.TILE_WIRE_FCO && dst_id <= GfxTileWireId.TILE_WIRE_FCI) {
                const gap: number = Math.floor((dst_id - GfxTileWireId.TILE_WIRE_FCO) / 24);
                el.x2 = x + gfxconstants.switchbox_x2;
                el.y2 =
                    y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_FCO + 1 + gap * 2) +
                    3 * gfxconstants.slice_pitch;
            }
            if (dst_id >= GfxTileWireId.TILE_WIRE_JCE0 && dst_id <= GfxTileWireId.TILE_WIRE_JQ7) {
                el.x2 = dst.location.x + gfxconstants.switchbox_x2;
                el.y2 =
                    dst.location.y +
                    gfxconstants.slice_y2 -
                    gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JCE0 + 1) +
                    3 * gfxconstants.slice_pitch;
            }
            if (dst_id >= GfxTileWireId.TILE_WIRE_JDIA && dst_id <= GfxTileWireId.TILE_WIRE_ECLKD) {
                const top: boolean = dst.location.y == h - 1;
                el.x2 = dst.location.x + 0.5;
                if (top)
                    el.y2 =
                        dst.location.y +
                        1 -
                        (gfxconstants.slice_y2 -
                            gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                            3 * gfxconstants.slice_pitch);
                else
                    el.y2 =
                        dst.location.y +
                        gfxconstants.slice_y2 -
                        gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JDIA + 1) +
                        3 * gfxconstants.slice_pitch;
            }
        }

        if (dst_type == ConstIncs.WIRE_TYPE_IOLOGIC) {
            const gap: number = 7 - Math.floor((dst_id - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) / 42);
            const num: number = (dst_id - GfxTileWireId.TILE_WIRE_JLOADND_IOLOGIC) % 42;
            if (dst.location.x == 0) {
                el.x2 = dst.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
            } else {
                el.x2 = dst.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
            }
            el.y2 =
                dst.location.y +
                gfxconstants.io_cell_v_y1 +
                gap * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_SIOLOGIC) {
            const gap: number = Math.floor((dst_id - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) / 20);
            const num: number = (dst_id - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
            el.x2 =
                dst.location.x +
                gfxconstants.io_cell_h_x1 +
                (5 - gap) * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
            if (dst.location.y == h - 1) {
                el.y2 = dst.location.y + 1 - gfxconstants.io_cell_h_y2 - gfxconstants.wire_length_long;
            } else {
                el.y2 = dst.location.y + gfxconstants.io_cell_h_y2 + gfxconstants.wire_length_long;
            }
        }
        if (dst_type == ConstIncs.WIRE_TYPE_PIO) {
            const top_bottom: boolean = dst.location.y == 0 || dst.location.y == h - 1;
            const gap: number = 3 - Math.floor((dst_id - GfxTileWireId.TILE_WIRE_PADDOD_PIO) / 7);
            const num: number = (dst_id - GfxTileWireId.TILE_WIRE_PADDOD_PIO) % 7;
            if (top_bottom) {
                el.x2 =
                    dst.location.x +
                    gfxconstants.io_cell_h_x1 +
                    (gap + 2) * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
                if (dst.location.y == h - 1) {
                    el.y2 = dst.location.y + 1 - gfxconstants.io_cell_h_y2 - gfxconstants.wire_length_long;
                } else {
                    el.y2 = dst.location.y + 1 - gfxconstants.io_cell_h_y2 + gfxconstants.wire_length_long;
                }
            } else {
                if (x == 0) {
                    el.x2 = dst.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
                } else {
                    el.x2 = dst.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
                }
                el.y2 =
                    dst.location.y +
                    gfxconstants.io_cell_v_y1 +
                    gap * gfxconstants.io_cell_gap +
                    gfxconstants.wire_distance * (num + 1);
            }
        }
        if (dst_type == ConstIncs.WIRE_TYPE_EBR) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JADA0_EBR + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_MULT18) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance_small * (dst_id - GfxTileWireId.TILE_WIRE_JCLK0_MULT18 + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_ALU54) {
            const num: number = (dst_id - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) % 225;
            const group: number = Math.floor((dst_id - GfxTileWireId.TILE_WIRE_JCLK0_ALU54) / 225);
            if (group == 0) {
                el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            } else {
                el.x2 = dst.location.x + gfxconstants.slice_x2_wide + gfxconstants.wire_length;
            }
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance_small * (num + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_PLL) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_CLKI_PLL + 1);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_GSR) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JCLK_GSR + 1);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_JTAG) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JJCE1_JTAG + 1) +
                1 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_OSC) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_SEDSTDBY_OSC + 1) +
                2 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_SED) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_SEDSTDBY_SED + 1) +
                3 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_DTR) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_JSTARTPULSE_DTR + 1);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_EXTREF) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_REFCLKP_EXTREF + 1) +
                1 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_DCU) {
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_CH0_RX_REFCLK_DCU + 1) +
                0 * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_PCSCLKDIV) {
            const num: number = (dst_id - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
            const group: number = 1 - Math.floor((dst_id - GfxTileWireId.TILE_WIRE_CLKI_PCSCLKDIV1) / 7);
            el.x2 = dst.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
            el.y2 =
                dst.location.y +
                gfxconstants.slice_y2 -
                gfxconstants.wire_distance * (num + 1) +
                group * gfxconstants.slice_pitch;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_DQS) {
            const num: number = dst_id - GfxTileWireId.TILE_WIRE_DDRDEL_DQS;
            if (dst.location.x == 0) {
                el.x2 = dst.location.x + 1 - gfxconstants.io_cell_v_x1 + gfxconstants.wire_length_long;
            } else {
                el.x2 = dst.location.x + gfxconstants.io_cell_v_x1 - gfxconstants.wire_length_long;
            }
            el.y2 =
                dst.location.y +
                gfxconstants.io_cell_v_y1 +
                8 * gfxconstants.io_cell_gap +
                gfxconstants.wire_distance * (num + 1);
        }
        if (dst_type == ConstIncs.WIRE_TYPE_DDRDLL) {
            const num: number = dst_id - GfxTileWireId.TILE_WIRE_DDRDEL_DDRDLL;
            el.x2 =
                dst.location.x +
                gfxconstants.io_cell_h_x1 +
                gfxconstants.dll_cell_x1 +
                gfxconstants.wire_distance * (num + 1);
            if (dst.location.y == h - 1) {
                el.y2 = dst.location.y + gfxconstants.dll_cell_y1 - gfxconstants.wire_length_long;
            } else {
                el.y2 = dst.location.y + gfxconstants.dll_cell_y2 + gfxconstants.wire_length_long;
            }
        }
        if (dst_type == ConstIncs.WIRE_TYPE_CCLK) {
            const num: number = dst_id - GfxTileWireId.TILE_WIRE_JPADDI_CCLK;
            el.x2 = dst.location.x + gfxconstants.slice_x1 + gfxconstants.wire_distance * (num + 1);
            el.y2 =
                dst.location.y + gfxconstants.slice_y2 - 1 * gfxconstants.slice_pitch - gfxconstants.wire_length_long;
        }
        if (dst_type == ConstIncs.WIRE_TYPE_G_HPBX) {
            el.x2 =
                x +
                gfxconstants.switchbox_x1 +
                gfxconstants.wire_distance * (200 + (dst_id - GfxTileWireId.TILE_WIRE_G_HPBX0000));
            el.y2 = y + gfxconstants.switchbox_y1;
        }
    }

    private static toSameSideV1Ver(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style,
        idx: number
    ) {
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);
        el.x2 = el.x1;
        el.y2 =
            y +
            gfxconstants.switchbox_y1 +
            (gfxconstants.switchbox_y2 - gfxconstants.switchbox_y1) / 2 -
            gfxconstants.wire_distance * idx;
        g.push(el.clone());

        const el2 = new GraphicElement(Type.ARROW, style);
        GFX.setDestination(el2, x, y, w, h, dst, dst_type, dst_id);

        el.x1 = el2.x2;
        el.y1 = el.y2;
        g.push(el.clone());

        el2.x1 = el.x1;
        el2.y1 = el.y1;
        g.push(el2.clone());
    }

    private static toSameSideH1Ver(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style,
        idx: number
    ) {
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);
        el.x2 =
            x +
            gfxconstants.switchbox_x1 +
            (gfxconstants.switchbox_x2 - gfxconstants.switchbox_x1) / 2 -
            gfxconstants.wire_distance * idx;
        el.y2 = el.y1;
        g.push(el.clone());

        const el2 = new GraphicElement(Type.ARROW, style);
        GFX.setDestination(el2, x, y, w, h, dst, dst_type, dst_id);

        el.x1 = el.x2;
        el.y1 = el2.y2;
        g.push(el.clone());

        el2.x1 = el.x1;
        el2.y1 = el.y1;
        g.push(el2.clone());
    }

    private static toSameSideVer(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style,
        idx: number
    ) {
        const sign: number = src_type == dst_type ? 1 : -1;
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);
        el.x2 =
            x +
            gfxconstants.switchbox_x1 +
            (gfxconstants.switchbox_x2 - gfxconstants.switchbox_x1) / 2 +
            sign * gfxconstants.wire_distance * idx;
        el.y2 = el.y1;
        g.push(el.clone());

        const el2 = new GraphicElement(Type.ARROW, style);
        GFX.setDestination(el2, x, y, w, h, dst, dst_type, dst_id);

        el.x1 = el.x2;
        el.y1 = el2.y2;
        g.push(el.clone());

        el2.x1 = el.x1;
        el2.y1 = el.y1;
        g.push(el2.clone());
    }

    private static lutPermPip(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId
    ) {
        let gap = Math.floor((src_id - GfxTileWireId.TILE_WIRE_FCO) / 24);
        el.x1 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length_lut;
        el.y1 =
            src.location.y +
            gfxconstants.slice_y2 -
            gfxconstants.wire_distance * (src_id - GfxTileWireId.TILE_WIRE_FCO + 1 + gap * 2) +
            3 * gfxconstants.slice_pitch;
        el.x2 = src.location.x + gfxconstants.slice_x1 - gfxconstants.wire_length;
        el.y2 =
            src.location.y +
            gfxconstants.slice_y2 -
            gfxconstants.wire_distance * (dst_id - GfxTileWireId.TILE_WIRE_FCO_SLICE + 1 + gap * 2) +
            3 * gfxconstants.slice_pitch;
        g.push(el.clone());
    }

    private static toSameSideH1Hor(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style,
        idx: number
    ) {
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);

        const el2 = new GraphicElement(Type.ARROW, style);
        GFX.setDestination(el2, x, y, w, h, dst, dst_type, dst_id);
        if (
            dst_type == ConstIncs.WIRE_TYPE_H01 ||
            src_type == ConstIncs.WIRE_TYPE_V01 ||
            dst_type == ConstIncs.WIRE_TYPE_H00
        ) {
            el.x2 = el.x1;
            el.y2 = el2.y2;
            g.push(el.clone());
        } else {
            el.x2 = el2.x2;
            el.y2 = el.y1;
            g.push(el.clone());
        }

        el2.x1 = el.x2;
        el2.y1 = el.y2;
        g.push(el2.clone());
    }

    private static toSameSideHor(
        g: GraphicElement[],
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style,
        idx: number
    ) {
        const sign: number = src_type == dst_type ? 1 : -1;
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);
        el.x2 = el.x1;
        el.y2 =
            y +
            gfxconstants.switchbox_y1 +
            Math.floor((gfxconstants.switchbox_y2 - gfxconstants.switchbox_y1) / 2) +
            sign * gfxconstants.wire_distance * idx;
        g.push(el.clone());

        const el2 = new GraphicElement(Type.ARROW, style);
        GFX.setDestination(el2, x, y, w, h, dst, dst_type, dst_id);

        el.x1 = el2.x2;
        el.y1 = el.y2;
        g.push(el.clone());

        el2.x1 = el.x1;
        el2.y1 = el.y1;
        g.push(el2.clone());
    }

    private static straightLine(
        el: GraphicElement,
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId
    ) {
        GFX.setSource(el, x, y, w, h, src, src_type, src_id);
        GFX.setDestination(el, x, y, w, h, dst, dst_type, dst_id);
    }

    public static tilePip(
        x: number,
        y: number,
        w: number,
        h: number,
        src: WireId,
        src_type: ConstIncs,
        src_id: GfxTileWireId,
        dst: WireId,
        dst_type: ConstIncs,
        dst_id: GfxTileWireId,
        style: Style
    ): Array<GraphicElement> {
        const ret: Array<GraphicElement> = [];
        let el = new GraphicElement(Type.Line, style);
        el.type = Type.ARROW;
        el.style = style;

        // To H00
        if (src_type == ConstIncs.WIRE_TYPE_V02 && dst_type == ConstIncs.WIRE_TYPE_H00) {
            GFX.toSameSideH1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_H00L0000 + 30
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02 && dst_type == ConstIncs.WIRE_TYPE_H00) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        // To H01
        if (src_type == ConstIncs.WIRE_TYPE_H06 && dst_type == ConstIncs.WIRE_TYPE_H01) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_H01E0001
            );
        }

        // To H02
        if (src_type == ConstIncs.WIRE_TYPE_H01 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_H02W0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            GFX.toSameSideHor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_H02W0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_H06 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            GFX.toSameSideHor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_H06W0303
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V01 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            if (y == src.location.y) {
                GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
                ret.push(el.clone());
            } else {
                GFX.toSameSideV1Ver(
                    ret,
                    el,
                    x,
                    y,
                    w,
                    h,
                    src,
                    src_type,
                    src_id,
                    dst,
                    dst_type,
                    dst_id,
                    style,
                    dst_id - GfxTileWireId.TILE_WIRE_H02W0701
                );
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_V02 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (src_type == ConstIncs.WIRE_TYPE_V06 && dst_type == ConstIncs.WIRE_TYPE_H02) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        // To H06
        if (src_type == ConstIncs.WIRE_TYPE_H01 && dst_type == ConstIncs.WIRE_TYPE_H06) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_H06W0303
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02 && dst_type == ConstIncs.WIRE_TYPE_H06) {
            GFX.toSameSideHor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_H02W0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_H06 && dst_type == ConstIncs.WIRE_TYPE_H06) {
            GFX.toSameSideHor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_H06W0303
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V01 && dst_type == ConstIncs.WIRE_TYPE_H06) {
            if (y == src.location.y) {
                GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
                ret.push(el.clone());
            } else {
                GFX.toSameSideV1Ver(
                    ret,
                    el,
                    x,
                    y,
                    w,
                    h,
                    src,
                    src_type,
                    src_id,
                    dst,
                    dst_type,
                    dst_id,
                    style,
                    dst_id - GfxTileWireId.TILE_WIRE_H06W0303
                );
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_V06 && dst_type == ConstIncs.WIRE_TYPE_H06) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        // To V00
        if (src_type == ConstIncs.WIRE_TYPE_V02 && dst_type == ConstIncs.WIRE_TYPE_V00) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02 && dst_type == ConstIncs.WIRE_TYPE_V00) {
            GFX.toSameSideV1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_H02W0701 + 20
            );
        }

        // To V01
        if (src_type == ConstIncs.WIRE_TYPE_V06 && dst_type == ConstIncs.WIRE_TYPE_V01) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_V01N0001
            );
        }

        // To V02
        if (src_type == ConstIncs.WIRE_TYPE_H01 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            if (x == src.location.x) {
                GFX.toSameSideH1Ver(
                    ret,
                    el,
                    x,
                    y,
                    w,
                    h,
                    src,
                    src_type,
                    src_id,
                    dst,
                    dst_type,
                    dst_id,
                    style,
                    dst_id - GfxTileWireId.TILE_WIRE_V02N0701
                );
            } else {
                GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
                ret.push(el.clone());
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_H02 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (src_type == ConstIncs.WIRE_TYPE_H06 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (src_type == ConstIncs.WIRE_TYPE_V01 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_V02N0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V02 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_V02N0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V06 && dst_type == ConstIncs.WIRE_TYPE_V02) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_V06N0303
            );
        }

        // To V06
        if (src_type == ConstIncs.WIRE_TYPE_H01 && dst_type == ConstIncs.WIRE_TYPE_V06) {
            if (x == src.location.x) {
                GFX.toSameSideH1Ver(
                    ret,
                    el,
                    x,
                    y,
                    w,
                    h,
                    src,
                    src_type,
                    src_id,
                    dst,
                    dst_type,
                    dst_id,
                    style,
                    dst_id - GfxTileWireId.TILE_WIRE_V06N0303
                );
            } else {
                GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
                ret.push(el.clone());
            }
        }
        if (src_type == ConstIncs.WIRE_TYPE_H06 && dst_type == ConstIncs.WIRE_TYPE_V06) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (src_type == ConstIncs.WIRE_TYPE_V01 && dst_type == ConstIncs.WIRE_TYPE_V06) {
            GFX.toSameSideH1Hor(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_V06N0303
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V02 && dst_type == ConstIncs.WIRE_TYPE_V06) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_V02N0701
            );
        }
        if (src_type == ConstIncs.WIRE_TYPE_V06 && dst_type == ConstIncs.WIRE_TYPE_V06) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_V06N0303
            );
        }

        if (
            src_type == ConstIncs.WIRE_TYPE_H00 &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_FCO &&
            dst_id <= GfxTileWireId.TILE_WIRE_FCI
        ) {
            GFX.toSameSideH1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_FCO
            );
        }
        if (
            src_type == ConstIncs.WIRE_TYPE_H00 &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            dst_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.toSameSideH1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_JCE0
            );
        }
        if (
            src_type == ConstIncs.WIRE_TYPE_H01 &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_FCO &&
            dst_id <= GfxTileWireId.TILE_WIRE_FCI
        ) {
            GFX.toSameSideH1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_FCO
            );
        }
        if (
            src_type == ConstIncs.WIRE_TYPE_H01 &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            dst_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.toSameSideH1Ver(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                dst_id - GfxTileWireId.TILE_WIRE_JCE0
            );
        }

        if (
            (src_type == ConstIncs.WIRE_TYPE_H02 ||
                src_type == ConstIncs.WIRE_TYPE_V00 ||
                src_type == ConstIncs.WIRE_TYPE_V01 ||
                src_type == ConstIncs.WIRE_TYPE_V02) &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            ((dst_id >= GfxTileWireId.TILE_WIRE_FCO && dst_id <= GfxTileWireId.TILE_WIRE_FCI) ||
                (dst_id >= GfxTileWireId.TILE_WIRE_JCE0 && dst_id <= GfxTileWireId.TILE_WIRE_JQ7))
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            (dst_type == ConstIncs.WIRE_TYPE_H02 ||
                dst_type == ConstIncs.WIRE_TYPE_V00 ||
                dst_type == ConstIncs.WIRE_TYPE_V01 ||
                dst_type == ConstIncs.WIRE_TYPE_V02) &&
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            ((src_id >= GfxTileWireId.TILE_WIRE_FCO && src_id <= GfxTileWireId.TILE_WIRE_FCI) ||
                (src_id >= GfxTileWireId.TILE_WIRE_JCE0 && src_id <= GfxTileWireId.TILE_WIRE_JQ7))
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_FCO &&
            dst_id <= GfxTileWireId.TILE_WIRE_FCI &&
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            src_id >= GfxTileWireId.TILE_WIRE_FCO &&
            src_id <= GfxTileWireId.TILE_WIRE_FCI
        ) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_FCO
            );
        }
        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            dst_id <= GfxTileWireId.TILE_WIRE_JCE0 &&
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            src_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            src_id <= GfxTileWireId.TILE_WIRE_JCE0
        ) {
            GFX.toSameSideVer(
                ret,
                el,
                x,
                y,
                w,
                h,
                src,
                src_type,
                src_id,
                dst,
                dst_type,
                dst_id,
                style,
                src_id - GfxTileWireId.TILE_WIRE_JCE0
            );
        }

        if (dst_type == ConstIncs.WIRE_TYPE_SLICE && src_type == ConstIncs.WIRE_TYPE_NONE) {
            if (
                src_id >= GfxTileWireId.TILE_WIRE_FCO &&
                src_id <= GfxTileWireId.TILE_WIRE_FCI &&
                dst_id >= GfxTileWireId.TILE_WIRE_FCO_SLICE &&
                dst_id <= GfxTileWireId.TILE_WIRE_FCI_SLICE
            ) {
                // LUT permutation pseudo-pip
                let src_purpose = (src_id - GfxTileWireId.TILE_WIRE_FCO) % 24;
                let dst_purpose = (dst_id - GfxTileWireId.TILE_WIRE_FCO_SLICE) % 24;
                if (
                    src_purpose >= GfxTileWireId.TILE_WIRE_D7 - GfxTileWireId.TILE_WIRE_FCO &&
                    src_purpose <= GfxTileWireId.TILE_WIRE_A6 - GfxTileWireId.TILE_WIRE_FCO &&
                    dst_purpose >= GfxTileWireId.TILE_WIRE_D7_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE &&
                    dst_purpose <= GfxTileWireId.TILE_WIRE_A6_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE
                ) {
                    // lutPermPip(g, el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
                }
            }
        }

        if (
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            (dst_type == ConstIncs.WIRE_TYPE_PLL ||
                dst_type == ConstIncs.WIRE_TYPE_GSR ||
                dst_type == ConstIncs.WIRE_TYPE_JTAG ||
                dst_type == ConstIncs.WIRE_TYPE_OSC ||
                dst_type == ConstIncs.WIRE_TYPE_SED ||
                dst_type == ConstIncs.WIRE_TYPE_DTR ||
                dst_type == ConstIncs.WIRE_TYPE_EXTREF ||
                dst_type == ConstIncs.WIRE_TYPE_DCU ||
                dst_type == ConstIncs.WIRE_TYPE_PCSCLKDIV ||
                dst_type == ConstIncs.WIRE_TYPE_DDRDLL ||
                dst_type == ConstIncs.WIRE_TYPE_CCLK ||
                dst_type == ConstIncs.WIRE_TYPE_DQS ||
                dst_type == ConstIncs.WIRE_TYPE_IOLOGIC ||
                dst_type == ConstIncs.WIRE_TYPE_SIOLOGIC ||
                dst_type == ConstIncs.WIRE_TYPE_EBR ||
                dst_type == ConstIncs.WIRE_TYPE_MULT18 ||
                dst_type == ConstIncs.WIRE_TYPE_ALU54) &&
            src_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            src_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            (src_type == ConstIncs.WIRE_TYPE_PLL ||
                src_type == ConstIncs.WIRE_TYPE_GSR ||
                src_type == ConstIncs.WIRE_TYPE_JTAG ||
                src_type == ConstIncs.WIRE_TYPE_OSC ||
                src_type == ConstIncs.WIRE_TYPE_SED ||
                src_type == ConstIncs.WIRE_TYPE_DTR ||
                src_type == ConstIncs.WIRE_TYPE_EXTREF ||
                src_type == ConstIncs.WIRE_TYPE_DCU ||
                src_type == ConstIncs.WIRE_TYPE_PCSCLKDIV ||
                src_type == ConstIncs.WIRE_TYPE_DDRDLL ||
                src_type == ConstIncs.WIRE_TYPE_CCLK ||
                src_type == ConstIncs.WIRE_TYPE_DQS ||
                src_type == ConstIncs.WIRE_TYPE_IOLOGIC ||
                src_type == ConstIncs.WIRE_TYPE_SIOLOGIC ||
                src_type == ConstIncs.WIRE_TYPE_EBR ||
                src_type == ConstIncs.WIRE_TYPE_MULT18 ||
                src_type == ConstIncs.WIRE_TYPE_ALU54) &&
            dst_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            dst_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        if (
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            (dst_type == ConstIncs.WIRE_TYPE_IOLOGIC ||
                dst_type == ConstIncs.WIRE_TYPE_SIOLOGIC ||
                dst_type == ConstIncs.WIRE_TYPE_PIO) &&
            src_id >= GfxTileWireId.TILE_WIRE_JDIA &&
            src_id <= GfxTileWireId.TILE_WIRE_ECLKD
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            (src_type == ConstIncs.WIRE_TYPE_IOLOGIC ||
                src_type == ConstIncs.WIRE_TYPE_SIOLOGIC ||
                src_type == ConstIncs.WIRE_TYPE_PIO) &&
            dst_id >= GfxTileWireId.TILE_WIRE_JDIA &&
            dst_id <= GfxTileWireId.TILE_WIRE_ECLKD
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            src_id >= GfxTileWireId.TILE_WIRE_JDIA &&
            src_id <= GfxTileWireId.TILE_WIRE_ECLKD &&
            dst_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            dst_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            src_type == ConstIncs.WIRE_TYPE_NONE &&
            dst_id >= GfxTileWireId.TILE_WIRE_JDIA &&
            dst_id <= GfxTileWireId.TILE_WIRE_ECLKD &&
            src_id >= GfxTileWireId.TILE_WIRE_JCE0 &&
            src_id <= GfxTileWireId.TILE_WIRE_JQ7
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        if (
            dst_type == ConstIncs.WIRE_TYPE_NONE &&
            src_type == ConstIncs.WIRE_TYPE_G_HPBX &&
            ((dst_id >= GfxTileWireId.TILE_WIRE_JCE0 && dst_id <= GfxTileWireId.TILE_WIRE_JQ7) ||
                (dst_id >= GfxTileWireId.TILE_WIRE_CLK0 && dst_id <= GfxTileWireId.TILE_WIRE_FCI))
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }
        if (
            (dst_type == ConstIncs.WIRE_TYPE_H01 || dst_type == ConstIncs.WIRE_TYPE_V01) &&
            src_type == ConstIncs.WIRE_TYPE_G_HPBX
        ) {
            GFX.straightLine(el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id);
            ret.push(el.clone());
        }

        return ret;
    }
}
