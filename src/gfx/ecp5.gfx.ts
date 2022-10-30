import { Style } from './styles';
import { Type } from './types';
import { GraphicElement } from './gfx';
import { GfxTileWireId } from './tilewire.ecp5.gfx';

let first = true;
export class GFX {
    public static tileBel(x: number,
                          y: number,
                          z: number,
                          w: number,
                          h: number,
                          type: number,
                          style: Style): Array<GraphicElement> {
        let ret = [];
        let el = new GraphicElement(Type.Box, style);

        if (type === 1221) { // DDRDLL
            el.x1 = x + dll_cell_x1;
            el.x2 = x + dll_cell_x2;
            el.y1 = y + dll_cell_y1;
            el.y2 = y + dll_cell_y2;

            ret.push(el.clone());
        } else if (type === 47 ||   // TRELLIS_IO
                   type === 1133 || // SIOLOGIC
                   type === 1132 || // IOLOGIC
                   type === 1233) { // DQSBUFM
            const top_bottom: boolean = (y === 0 || y === (h - 1));
            if (top_bottom) {
                el.x1 = x + io_cell_h_x1 + (z + 2) * io_cell_gap;
                el.x2 = x + io_cell_h_x1 + (z + 2) * io_cell_gap + 0.08;
                if (y === h - 1) {
                    el.y1 = y + 1 - io_cell_h_y1;
                    el.y2 = y + 1 - io_cell_h_y2;
                } else {
                    el.y1 = y + io_cell_h_y1;
                    el.y2 = y + io_cell_h_y2;
                }
            } else {
                if (x === 0) {
                    el.x1 = x + 1 - io_cell_v_x1;
                    el.x2 = x + 1 - io_cell_v_x2;
                } else {
                    el.x1 = x + io_cell_v_x1;
                    el.x2 = x + io_cell_v_x2;
                }
                el.y1 = y + io_cell_v_y1 + z * io_cell_gap;
                el.y2 = y + io_cell_v_y1 + z * io_cell_gap + 0.08;
            }
            ret.push(el.clone());
        } else if (type === 48) { // DCCA
            el.x1 = x + switchbox_x1 + (z)*0.025;
            el.y1 = y + 0.14;
            el.x2 = x + switchbox_x1 + (z)*0.025 + 0.020;
            el.y2 = y + 0.18;
            ret.push(el.clone());
        } else if (type === 46) { // TRELLIS_SLICE
        } else if (type === 783) { // EHXPLLL
            el.x1 = x + slice_x1;
            el.x2 = x + slice_x2_wide;
            el.y1 = y + slice_y1;
            el.y2 = y + slice_y2;
            ret.push(el.clone());
        } else if (type === 54 ||  // DP16KD
                   type === 171 || // MULT18X18D
                   type === 399) { // ALU54B
            el.x1 = x + slice_x1;
            el.x2 = x + slice_x2_wide;
            el.y1 = y + slice_y1 - 1 * slice_pitch;
            el.y2 = y + slice_y2 + 3 * slice_pitch;
            ret.push(el.clone());
        } else if (type === 1309) { // DCSC
        } else if (type === 1217 || // DLLDELD
                   type === 1210 || // CLKDIVF
                   type === 1213 || // ECLKSYNCB
                   type === 1260 || // TRELLIS_ECLKBUF
                   type === 1267) { // ECLKBRIDGECS
            el.x1 = x + 0.1 + z * 0.05;
            el.x2 = x + 0.14 + z * 0.05;
            el.y1 = y + 0.475;
            el.y2 = y + 0.525;
            ret.push(el.clone());
        } else if (type === 1172 || // GSR
                   type === 1173 || // JTAGG
                   type === 1189 || // OSCG
                   type === 1192 || // SEDGA
                   type === 1199 || // DTR
                   type === 1102 || // PCSCLKDIV
                   type === 1209 || // USRMCLK
                   type === 805) {  // EXTREFB
            el.x1 = x + slice_x1;
            el.x2 = x + slice_x2_wide;
            el.y1 = y + slice_y1 + (z)*slice_pitch;
            el.y2 = y + slice_y2 + (z)*slice_pitch;
            ret.push(el.clone());
        } else if (type === 809) { // DCUA
            el.x1 = x + slice_x1;
            el.x2 = x + slice_x2_wide;
            el.y1 = y + slice_y2;
            el.y2 = y + 0.25;
            ret.push(el.clone());
        }


        else if (first) {
            console.log(x,y,z,type);
            first = false;
        }

        return ret;
    }

    public static tileWire(x: number,
                              y: number,
                              w: number,
                              h: number,
                              type: number,
                              tilewire: GfxTileWireId,
                              style: Style): Array<GraphicElement> {
        const ret: Array<GraphicElement>= [];
        let el = new GraphicElement(Type.Line, style);

        if (type === 1270) {// WIRE_TYPE_NONE
            if (tilewire >= GfxTileWireId.TILE_WIRE_NBOUNCE && tilewire <= GfxTileWireId.TILE_WIRE_SBOUNCE) {
                el.x1 = x + switchbox_x2 - wire_distance * 4;
                el.x2 = x + switchbox_x2 - wire_distance * 8;
                if (tilewire == GfxTileWireId.TILE_WIRE_NBOUNCE) {
                    el.y1 = y + switchbox_y2 + wire_distance * 4;
                    el.y2 = el.y1;
                } else {
                    el.y1 = y + switchbox_y1 - wire_distance * 4;
                    el.y2 = el.y1;
                }
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_WBOUNCE && tilewire <= GfxTileWireId.TILE_WIRE_EBOUNCE) {
                el.y1 = y + switchbox_y1 + wire_distance * 4;
                el.y2 = y + switchbox_y1 + wire_distance * 8;
                if (tilewire == GfxTileWireId.TILE_WIRE_WBOUNCE) {
                    el.x1 = x + switchbox_x1 - wire_distance * 4;
                    el.x2 = el.x1;
                } else {
                    el.x1 = x + switchbox_x2 + wire_distance * 4;
                    el.x2 = el.x1;
                }
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_CLK0 && tilewire <= GfxTileWireId.TILE_WIRE_LSR1) {
                el.x1 = x + switchbox_x2;
                el.x2 = x + slice_x2 + 15 * wire_distance + (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * wire_distance;
                el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_CLK0 - 5) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
                el.x1 = el.x2;
                el.y2 = y + slice_y2 - wire_distance * (3 + (tilewire - GfxTileWireId.TILE_WIRE_CLK0));
                ret.push(el.clone());
                for (let i = 0; i < 4; i++) {
                    el.x1 = x + slice_x2 + 15 * wire_distance + wire_distance;
                    el.x2 = x + slice_x2 + 15 * wire_distance + (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * wire_distance;
                    el.y1 = y + slice_y2 -
                            wire_distance * (GfxTileWireId.TILE_WIRE_CLK3_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + tilewire - GfxTileWireId.TILE_WIRE_CLK0) +
                            i * slice_pitch;
                    el.y2 = el.y1;
                    ret.push(el.clone());
                }
                if (tilewire == GfxTileWireId.TILE_WIRE_CLK1 || tilewire == GfxTileWireId.TILE_WIRE_LSR1) {
                    for (let i = 0; i < 2; i++) {
                        el.x1 = x + slice_x2 + 3 * wire_distance;
                        el.x2 = x + slice_x2 + 15 * wire_distance + (8 - (tilewire - GfxTileWireId.TILE_WIRE_CLK0)) * wire_distance;
                        el.y1 = y + slice_y2 -
                                wire_distance *
                                        (GfxTileWireId.TILE_WIRE_CLK3_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 - 1 + Math.floor((tilewire - GfxTileWireId.TILE_WIRE_CLK0) / 2)) +
                                i * slice_pitch;
                        el.y2 = el.y1;
                        ret.push(el.clone());
                    }
                }
            }
            
            // TRELLIS_IO wires
            else if (tilewire >= GfxTileWireId.TILE_WIRE_JDIA && tilewire <= GfxTileWireId.TILE_WIRE_ECLKD) {
                el.x1 = x + 0.5;
                el.x2 = x + 0.5 + wire_length;
                const top: boolean = (y == (h - 1));
                if (top)
                    el.y1 = y + 1 - (slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JDIA + 1) + 3 * slice_pitch);
                else
                    el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JDIA + 1) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }

            else if (tilewire >= GfxTileWireId.TILE_WIRE_JCE0 && tilewire <= GfxTileWireId.TILE_WIRE_JQ7) {
                el.x1 = x + switchbox_x2;
                el.x2 = x + switchbox_x2 + wire_length;
                el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_JCE0 + 1) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }

            else if (tilewire >= GfxTileWireId.TILE_WIRE_FCO && tilewire <= GfxTileWireId.TILE_WIRE_FCI) {
                const gap: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_FCO) / 24);
                el.x1 = x + switchbox_x2;
                el.x2 = x + slice_x1 - wire_length;
                el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_FCO + 1 + gap * 2) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }

            else if (tilewire >= GfxTileWireId.TILE_WIRE_MUXCLK3 && tilewire <= GfxTileWireId.TILE_WIRE_MUXLSR0) {
                const gap: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_MUXCLK3) / 2);
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_MUXCLK3) % 2;
                el.x1 = x + slice_x2 + 3 * wire_distance;
                el.x2 = x + slice_x2 + 15 * wire_distance;
                el.y1 = y + slice_y2 - wire_distance * (GfxTileWireId.TILE_WIRE_CLK3_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + gap * 26) +
                        3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }

            else if (tilewire >= GfxTileWireId.TILE_WIRE_WD3 && tilewire <= GfxTileWireId.TILE_WIRE_WD0) {
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_WD3) % 4;
                const group: number = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_WD3) / 2);
                el.x1 = x + slice_x2 + wire_length;
                el.x2 = x + slice_x2 + wire_length + wire_distance * (4 - part);
                el.y1 = y + slice_y2 - wire_distance * (GfxTileWireId.TILE_WIRE_WDO3C_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14) +
                        3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());

                el.x1 = el.x2;
                el.y2 = y + slice_y2 -
                        wire_distance * (GfxTileWireId.TILE_WIRE_WD1B_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + (part & 1) + 14 * 2) +
                        (3 - group) * slice_pitch;
                ret.push(el.clone());

                el.x1 = x + slice_x2 + wire_length;
                el.y1 = el.y2;
                ret.push(el.clone());
            } else if (tilewire >= GfxTileWireId.TILE_WIRE_WAD3 && tilewire <= GfxTileWireId.TILE_WIRE_WAD0) {
                const part: number = (tilewire - GfxTileWireId.TILE_WIRE_WAD3) % 4;
                el.x1 = x + slice_x2 + wire_length;
                el.x2 = x + slice_x2 + wire_length + wire_distance * (8 - part);
                el.y1 = y + slice_y2 - wire_distance * (GfxTileWireId.TILE_WIRE_WADO3C_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14) +
                        3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());

                el.x1 = el.x2;
                el.y2 = y + slice_y2 - wire_distance * (GfxTileWireId.TILE_WIRE_WAD3B_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14 * 2) +
                        2 * slice_pitch;
                ret.push(el.clone());

                el.x1 = x + slice_x2 + wire_length;
                el.y1 = el.y2;
                ret.push(el.clone());

                // middle line
                el.x1 = x + slice_x2 + wire_length;
                el.x2 = x + slice_x2 + wire_length + wire_distance * (8 - part);
                el.y2 = y + slice_y2 - wire_distance * (GfxTileWireId.TILE_WIRE_WAD3B_SLICE - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + part + 14 * 2) +
                        3 * slice_pitch;
                el.y1 = el.y2;
                ret.push(el.clone());
            }
        } else if (type === 1279) {// WIRE_TYPE_DDRDLL
            const num = (tilewire - GfxTileWireId.TILE_WIRE_DDRDEL_DDRDLL);
            el.x1 = x + io_cell_h_x1 + 0.2 + wire_distance * (num + 1);
            el.x2 = el.x1;
            if (y == h - 1) {
                el.y1 = y + dll_cell_y1;
                el.y2 = el.y1 - wire_length_long;
            } else {
                el.y1 = y + dll_cell_y2;
                el.y2 = el.y1 + wire_length_long;
            }
            ret.push(el.clone());
        } else if (type === 1285) {// WIRE_TYPE_OSC
            el.x1 = x + slice_x1 - wire_length;
            el.x2 = x + slice_x1;
            el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_SEDSTDBY_OSC + 1) + 2 * slice_pitch;
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === 1295) {// WIRE_TYPE_V01
            if (tilewire >= GfxTileWireId.TILE_WIRE_V01N0001 && tilewire <= GfxTileWireId.TILE_WIRE_V01S0100) {
                el.x1 = x + switchbox_x1 + wire_distance * (10 + tilewire - GfxTileWireId.TILE_WIRE_V01N0001);
                el.x2 = el.x1;
                if (y == h - 2)
                    el.y1 = y + 1.1;
                else
                    el.y1 = y + switchbox_y1 + 1;

                if (y == 0)
                    el.y2 = y + 0.9;
                else
                    el.y2 = y + switchbox_y2;

                ret.push(el.clone());
            }
        } else if (type === 1296) {// WIRE_TYPE_V02
            if (y == 0)
                el.y1 = 0.9;
            else
                el.y1 = y + switchbox_y1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.y2 = el.y1;
            el.x1 = x + switchbox_x1;
            el.x2 = x + switchbox_x1 - wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            if (y != 0 && y != h - 1)
                ret.push(el.clone());

            if (y == h - 2)
                el.y2 = y + 1 + 0.1;
            else
                el.y2 = y + 1 + switchbox_y1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x1 = el.x2;
            if (y != h - 1)
                ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + switchbox_x1;
            if (y != h - 1 && y != h - 2)
                ret.push(el.clone());

            if (y == h - 1)
                el.y1 = y + 0.1;
            else
                el.y1 = y + switchbox_y1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            if (y == 1)
                el.y2 = y - 1 + 0.9;
            else
                el.y2 = y - 1 + switchbox_y1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x2 = x + switchbox_x1 - wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_V02N0701) + 20 * (y % 3));
            el.x1 = el.x2;
            if (y != 0)
                ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + switchbox_x1;
            if (y != 0 && y != 1)
                ret.push(el.clone());
        } else if (type === 1297) { // WIRE_TYPE_V06
            if (y == 0)
                el.y1 = 0.9;
            else
                el.y1 = y + switchbox_y1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.y2 = el.y1;
            el.x1 = x + switchbox_x1;
            el.x2 = x + switchbox_x1 - wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            if (y != 0 && y != h - 1)
                ret.push(el.clone());

            if (y == h - 2 || y == h - 3 || y == h - 4)
                el.y2 = h - 1 + 0.1;
            else
                el.y2 = y + 3 + switchbox_y1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x1 = el.x2;
            if (y != h - 1)
                ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + switchbox_x1;
            if (y != h - 1 && y != h - 2 && y != h - 3 && y != h - 4)
                ret.push(el.clone());

            if (y == h - 1)
                el.y1 = y + 0.1;
            else
                el.y1 = y + switchbox_y1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            if (y == 1 || y == 2 || y == 3)
                el.y2 = 0.9;
            else
                el.y2 = y - 3 + switchbox_y1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x2 = x + switchbox_x1 - wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_V06N0303) + 10 * (y % 9));
            el.x1 = el.x2;
            if (y != 0)
                ret.push(el.clone());

            el.y1 = el.y2;
            el.x1 = x + switchbox_x1;
            if (y != 0 && y != 1 && y != 2 && y != 3)
                ret.push(el.clone());
        } else if (type === 1275) { // WIRE_TYPE_PIO
            const top_bottom: boolean = (y == 0 || y == (h - 1));
            const gap = 3 - Math.floor((tilewire - GfxTileWireId.TILE_WIRE_PADDOD_PIO) / 7);
            const num = (tilewire - GfxTileWireId.TILE_WIRE_PADDOD_PIO) % 7;
            if (top_bottom) {
                el.x1 = x + io_cell_h_x1 + (gap + 2) * io_cell_gap + wire_distance * (num + 1);
                el.x2 = el.x1;
                if (y == h - 1) {
                    el.y1 = y + 1 - io_cell_h_y2;
                    el.y2 = el.y1 - wire_length_long;
                } else {
                    el.y1 = y + io_cell_h_y2;
                    el.y2 = el.y1 + wire_length_long;
                }
            } else {
                if (x == 0) {
                    el.x1 = x + 1 - io_cell_v_x1;
                    el.x2 = el.x1 + wire_length_long;
                } else {
                    el.x1 = x + io_cell_v_x1;
                    el.x2 = el.x1 - wire_length_long;
                }
                el.y1 = y + io_cell_v_y1 + gap * io_cell_gap + wire_distance * (num + 1);
                el.y2 = el.y1;
            }
            ret.push(el.clone());
        } else if (type === 1274) { // WIRE_TYPE_SIOLOGIC
            const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) / 20);
            const num = (tilewire - GfxTileWireId.TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
            el.x1 = x + io_cell_h_x1 + (5 - gap) * io_cell_gap + wire_distance * (num + 1);
            el.x2 = el.x1;
            if (y == h - 1) {
                el.y1 = y + 1 - io_cell_h_y2;
                el.y2 = el.y1 - wire_length_long;
            } else {
                el.y1 = y + io_cell_h_y2;
                el.y2 = el.y1 + wire_length_long;
            }
            ret.push(el.clone());
        } else if (type === 1293) { // WIRE_TYPE_H06
            if (x == 0)
                el.x1 = 0.9;
            else
                el.x1 = x + switchbox_x1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.x2 = el.x1;
            el.y1 = y + switchbox_y1;
            el.y2 = y + switchbox_y1 - wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            if (x != 0 && x != w - 1)
                ret.push(el.clone());

            if (x == w - 2 || x == w - 3 || x == w - 4)
                el.x2 = w - 1 + 0.1;
            else
                el.x2 = x + 3 + switchbox_x1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y1 = el.y2;
            if (x != w - 1)
                ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + switchbox_y1;
            if (x != w - 1 && x != w - 2 && x != w - 3 && x != w - 4)
                ret.push(el.clone());

            if (x == w - 1)
                el.x1 = x + 0.1;
            else
                el.x1 = x + switchbox_x1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            if (x == 1 || x == 2 || x == 3)
                el.x2 = 0.9;
            else
                el.x2 = x - 3 + switchbox_x1 + wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y2 = y + switchbox_y1 - wire_distance * (96 + (tilewire - GfxTileWireId.TILE_WIRE_H06W0303) + 10 * (x % 9));
            el.y1 = el.y2;
            if (x != 0)
                ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + switchbox_y1;
            if (x != 0 && x != 1 && x != 2 && x != 3)
                ret.push(el.clone());
        } else if (type === 1292) { // WIRE_TYPE_H02
            if (x == 0)
                el.x1 = 0.9;
            else
                el.x1 = x + switchbox_x1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.x2 = el.x1;
            el.y1 = y + switchbox_y1;
            el.y2 = y + switchbox_y1 - wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            if (x != 0 && x != w - 1)
                ret.push(el.clone());

            if (x == w - 2)
                el.x2 = x + 1 + 0.1;
            else
                el.x2 = x + 1 + switchbox_x1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y1 = el.y2;
            if (x != w - 1)
                ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + switchbox_y1;
            if (x != w - 1 && x != w - 2)
                ret.push(el.clone());

            if (x == w - 1)
                el.x1 = x + 0.1;
            else
                el.x1 = x + switchbox_x1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            if (x == 1)
                el.x2 = x - 1 + 0.9;
            else
                el.x2 = x - 1 + switchbox_x1 + wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y2 = y + switchbox_y1 - wire_distance * (20 + (tilewire - GfxTileWireId.TILE_WIRE_H02W0701) + 20 * (x % 3));
            el.y1 = el.y2;
            if (x != 0)
                ret.push(el.clone());

            el.x1 = el.x2;
            el.y1 = y + switchbox_y1;
            if (x != 0 && x != 1)
                ret.push(el.clone());
        } else if (type === 1291) { // WIRE_TYPE_H01
            if (tilewire >= GfxTileWireId.TILE_WIRE_H01E0001 && tilewire <= GfxTileWireId.TILE_WIRE_HL7W0001) {
                if (x == w - 1)
                    el.x1 = x + 0.1;
                else
                    el.x1 = x + switchbox_x1;
                if (x == 1)
                    el.x2 = x - 0.1;
                else
                    el.x2 = x + switchbox_x2 - 1;
                el.y1 = y + switchbox_y1 + wire_distance * (10 + tilewire - GfxTileWireId.TILE_WIRE_H01E0001);
                el.y2 = el.y1;
                ret.push(el.clone());
            }
        } else if (type === 1298) { // WIRE_TYPE_G_HPBX
            el.x1 = x;
            el.x2 = x + 1;
            el.y1 = y + 0.1 + wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_G_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());

            el.x1 = x + switchbox_x1 + wire_distance * (200 + (tilewire - GfxTileWireId.TILE_WIRE_G_HPBX0000));
            el.x2 = el.x1;
            el.y2 = y + switchbox_y1;
            ret.push(el.clone());
        } else if (type === 1290) { // WIRE_TYPE_H00
            const group = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_H00L0000) / 2);
            el.y1 = y + switchbox_y1 + wire_distance * (8 - ((tilewire - GfxTileWireId.TILE_WIRE_H00L0000) % 2) * 4);
            el.y2 = el.y1;

            if (group) {
                el.x1 = x + switchbox_x2 + wire_distance * 4;
                el.x2 = x + switchbox_x2;
            } else {
                el.x1 = x + switchbox_x1 - wire_distance * 4;
                el.x2 = x + switchbox_x1;
            }
            ret.push(el.clone());
        } else if (type === 1294) { // WIRE_TYPE_V00
            const group = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_V00T0000) / 2);
            el.x1 = x + switchbox_x2 - wire_distance * (8 - ((tilewire - GfxTileWireId.TILE_WIRE_V00T0000) % 2) * 4);
            el.x2 = el.x1;
            if (group) {
                el.y1 = y + switchbox_y1;
                el.y2 = y + switchbox_y1 - wire_distance * 4;
            } else {
                el.y1 = y + switchbox_y2;
                el.y2 = y + switchbox_y2 + wire_distance * 4;
            }
            ret.push(el.clone());
        } else if (type === 1299) { // WIRE_TYPE_G_VPTX
            el.x1 = x + 0.1 + wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_G_VPTX0000 + 1);
            el.x2 = el.x1;
            el.y1 = y;
            el.y2 = y + 1;
            ret.push(el.clone());
        } else if (type === 1300) { // WIRE_TYPE_L_HPBX
            el.x1 = x - 3;
            el.x2 = x + 0.08;
            el.y1 = y + wire_distance + wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_L_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === 1301) {
            el.x1 = x + 0.2;
            el.x2 = x + 3;
            el.y1 = y + wire_distance + wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_R_HPBX0000 + 1);
            el.y2 = el.y1;
            ret.push(el.clone());
        } else if (type === 1271 && tilewire != GfxTileWireId.TILE_WIRE_NONE) {
            if (tilewire >= GfxTileWireId.TILE_WIRE_FCO_SLICE && tilewire <= GfxTileWireId.TILE_WIRE_FCI_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) / 24);
                const item = (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE) % 24;
                el.x1 = x + slice_x1 - wire_length;
                el.x2 = x + slice_x1;
                el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_FCO_SLICE + 1 + gap * 2) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
                // FX to F connection - top
                if (item == (GfxTileWireId.TILE_WIRE_FXD_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE)) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - wire_distance;
                    ret.push(el.clone());
                }
                // F5 to F connection - bottom
                if (item == (GfxTileWireId.TILE_WIRE_F5D_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE)) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 + wire_distance;
                    ret.push(el.clone());
                }
                // connection between slices
                if (item == (GfxTileWireId.TILE_WIRE_FCID_SLICE - GfxTileWireId.TILE_WIRE_FCO_SLICE) && tilewire != GfxTileWireId.TILE_WIRE_FCI_SLICE) {
                    el.x2 = el.x1;
                    el.y2 = el.y1 - wire_distance * 3;
                    ret.push(el.clone());
                }
            }
            if (tilewire >= GfxTileWireId.TILE_WIRE_DUMMY_D2 && tilewire <= GfxTileWireId.TILE_WIRE_WAD0A_SLICE) {
                const gap = Math.floor((tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2) / 12);
                el.x1 = x + slice_x2 + wire_length;
                el.x2 = x + slice_x2;
                el.y1 = y + slice_y2 - wire_distance * (tilewire - GfxTileWireId.TILE_WIRE_DUMMY_D2 + 1 + gap * 14) + 3 * slice_pitch;
                el.y2 = el.y1;
                ret.push(el.clone());
            }
        }



        else if (first) {
            console.log(x,y,type);
            //first = false;
        }

        return ret;
    }
}

const switchbox_x1 = 0.51;
const switchbox_x2 = 0.90;
const switchbox_y1 = 0.51;
const switchbox_y2 = 0.90;

const dll_cell_x1 = 0.2;
const dll_cell_x2 = 0.8;
const dll_cell_y1 = 0.2;
const dll_cell_y2 = 0.8;

const io_cell_v_x1 = 0.76;
const io_cell_v_x2 = 0.95;
const io_cell_v_y1 = 0.05;
const io_cell_gap = 0.10;
const io_cell_h_x1 = 0.05;
const io_cell_h_y1 = 0.05;
const io_cell_h_y2 = 0.24;

const slice_x1 = 0.92;
const slice_x2_comb = 0.927;
const slice_x1_ff = 0.933;
const slice_x2 = 0.94;
const slice_x2_wide = 0.97;
const slice_y1 = 0.71;
const slice_y2 = 0.7275 + 0.0068 / 2;
const slice_pitch = (0.0374 + 0.0068) / 2;

const wire_distance = 0.0017;
const wire_distance_small = 0.00085;

const wire_length = 0.005;
const wire_length_long = 0.015;

