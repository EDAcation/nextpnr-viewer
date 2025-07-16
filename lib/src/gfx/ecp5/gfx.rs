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
* Source: https://github.com/YosysHQ/nextpnr/blob/9c2d96f86ed56b77c9c325041b67654f26308270/ecp5/gfx.cc
*/
#![allow(non_upper_case_globals)]

use super::consts;
use super::tilewire;
use crate::gfx;

pub struct WireId {
    pub location: Location,
}

pub struct Location {
    pub x: f64,
    pub y: f64,
}

pub fn tile_bel(
    x: f64,
    y: f64,
    z: i32,
    _w: i32,
    h: i32,
    bel_type: &gfx::ecp5::ConstId,
    style: &gfx::Style,
) -> Vec<gfx::GraphicElement> {
    let mut g = vec![];
    let mut el = gfx::GraphicElement::new(gfx::Type::Box, *style);

    if bel_type == &gfx::ecp5::ConstId::TRELLIS_COMB {
        let lc = z >> consts::lc_idx_shift;

        el.x1 = x + consts::slice_x1 + consts::slice_comb_dx1;
        el.x2 = el.x1 + consts::slice_comb_w;
        el.y1 = y
            + consts::slice_y1
            + (lc / 2) as f64 * consts::slice_pitch
            + (if lc % 2 != 0 {
                consts::slice_comb_dy2
            } else {
                consts::slice_comb_dy1
            });
        el.y2 = el.y1 + consts::slice_comb_h;
        g.push(el);

        el.style = gfx::Style::Frame;

        if (lc % 2) == 0 {
            // SLICE frame
            el.x1 = x + consts::slice_x1;
            el.x2 = x + consts::slice_x2;
            el.y1 = y + consts::slice_y1 + (lc / 2) as f64 * consts::slice_pitch;
            el.y2 = y + consts::slice_y2 + (lc / 2) as f64 * consts::slice_pitch;
            g.push(el);

            // SLICE control set switchbox
            el.x1 = x + consts::slice_x2 + 15.0 * consts::wire_distance;
            el.x2 = el.x1 + consts::wire_distance;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_CLK3_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 5
                        + (3 - (lc / 2)) * 26) as f64
                + 3.0 * consts::slice_pitch
                - 0.0007;
            el.y2 = el.y1 + consts::wire_distance * 5.0;
            g.push(el);
        }

        // LUT permutation switchbox
        el.x1 = x + consts::slice_x1 - consts::wire_length_lut;
        el.x2 = x + consts::slice_x1 - consts::wire_length;
        let start_wire =
            tilewire::GfxTileWireId::TILE_WIRE_D7 as i32 + 24 * (lc / 2) + 4 * (lc % 2);
        el.y2 = y + consts::slice_y2
            - consts::wire_distance
                * (start_wire - tilewire::GfxTileWireId::TILE_WIRE_FCO as i32 + 1 + (lc / 2) * 2)
                    as f64
            + 3.0 * consts::slice_pitch
            + 0.25 * consts::wire_distance;
        el.y1 = el.y2 - 3.5 * consts::wire_distance;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::TRELLIS_FF {
        let lc = z >> consts::lc_idx_shift;
        el.x1 = x + consts::slice_x1 + consts::slice_ff_dx1;
        el.x2 = el.x1 + consts::slice_ff_w;
        el.y1 = y
            + consts::slice_y1
            + (lc / 2) as f64 * consts::slice_pitch
            + (if lc % 2 != 0 {
                consts::slice_comb_dy2
            } else {
                consts::slice_comb_dy1
            });
        el.y2 = el.y1 + consts::slice_comb_h;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::TRELLIS_IO
        || bel_type == &gfx::ecp5::ConstId::IOLOGIC
        || bel_type == &gfx::ecp5::ConstId::SIOLOGIC
        || bel_type == &gfx::ecp5::ConstId::DQSBUFM
    {
        let top_bottom = y as i32 == 0 || y as i32 == (h - 1);
        if top_bottom {
            el.x1 = x + consts::io_cell_h_x1 + (z + 2) as f64 * consts::io_cell_gap;
            el.x2 = x + consts::io_cell_h_x1 + (z + 2) as f64 * consts::io_cell_gap + 0.08;
            if y as i32 == h - 1 {
                el.y1 = y + 1.0 - consts::io_cell_h_y1;
                el.y2 = y + 1.0 - consts::io_cell_h_y2;
            } else {
                el.y1 = y + consts::io_cell_h_y1;
                el.y2 = y + consts::io_cell_h_y2;
            }
        } else {
            if x as i32 == 0 {
                el.x1 = x + 1.0 - consts::io_cell_v_x1;
                el.x2 = x + 1.0 - consts::io_cell_v_x2;
            } else {
                el.x1 = x + consts::io_cell_v_x1;
                el.x2 = x + consts::io_cell_v_x2;
            }
            el.y1 = y + consts::io_cell_v_y1 + z as f64 * consts::io_cell_gap;
            el.y2 = y + consts::io_cell_v_y1 + z as f64 * consts::io_cell_gap + 0.08;
        }
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::DCCA {
        el.x1 = x + consts::switchbox_x1 + z as f64 * 0.025;
        el.y1 = y + 0.14;
        el.x2 = x + consts::switchbox_x1 + z as f64 * 0.025 + 0.020;
        el.y2 = y + 0.18;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::DP16KD
        || bel_type == &gfx::ecp5::ConstId::MULT18X18D
        || bel_type == &gfx::ecp5::ConstId::ALU54B
    {
        el.x1 = x + consts::slice_x1;
        el.x2 = x + consts::slice_x2_wide;
        el.y1 = y + consts::slice_y1 - 1.0 * consts::slice_pitch;
        el.y2 = y + consts::slice_y2 + 3.0 * consts::slice_pitch;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::EHXPLLL {
        el.x1 = x + consts::slice_x1;
        el.x2 = x + consts::slice_x2_wide;
        el.y1 = y + consts::slice_y1;
        el.y2 = y + consts::slice_y2;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::DCUA {
        el.x1 = x + consts::slice_x1;
        el.x2 = x + consts::slice_x2_wide;
        el.y1 = y + consts::slice_y2;
        el.y2 = y + 0.25;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::EXTREFB
        || bel_type == &gfx::ecp5::ConstId::PCSCLKDIV
        || bel_type == &gfx::ecp5::ConstId::DTR
        || bel_type == &gfx::ecp5::ConstId::USRMCLK
        || bel_type == &gfx::ecp5::ConstId::SEDGA
        || bel_type == &gfx::ecp5::ConstId::GSR
        || bel_type == &gfx::ecp5::ConstId::JTAGG
        || bel_type == &gfx::ecp5::ConstId::OSCG
    {
        el.x1 = x + consts::slice_x1;
        el.x2 = x + consts::slice_x2_wide;
        el.y1 = y + consts::slice_y1 + z as f64 * consts::slice_pitch;
        el.y2 = y + consts::slice_y2 + z as f64 * consts::slice_pitch;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::DDRDLL {
        el.x1 = x + consts::dll_cell_x1;
        el.x2 = x + consts::dll_cell_x2;
        el.y1 = y + consts::dll_cell_y1;
        el.y2 = y + consts::dll_cell_y2;
        g.push(el);
    } else if bel_type == &gfx::ecp5::ConstId::DLLDELD
        || bel_type == &gfx::ecp5::ConstId::CLKDIVF
        || bel_type == &gfx::ecp5::ConstId::ECLKSYNCB
        || bel_type == &gfx::ecp5::ConstId::TRELLIS_ECLKBUF
        || bel_type == &gfx::ecp5::ConstId::ECLKBRIDGECS
    {
        el.x1 = x + 0.1 + z as f64 * 0.05;
        el.x2 = x + 0.14 + z as f64 * 0.05;
        el.y1 = y + 0.475;
        el.y2 = y + 0.525;
        g.push(el);
    }

    g
}

pub fn tile_wire(
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    wire_type: &gfx::ecp5::ConstId,
    tilewire: &tilewire::GfxTileWireId,
    style: &gfx::Style,
) -> Vec<gfx::GraphicElement> {
    let mut g: Vec<gfx::GraphicElement> = vec![];
    let mut el = gfx::GraphicElement::new(gfx::Type::Line, *style);

    if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_SLICE
        && tilewire != &tilewire::GfxTileWireId::TILE_WIRE_NONE
    {
        if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_FCI_SLICE
        {
            let gap = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE) / 24;
            let item = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE) % 24;
            el.x1 = x + consts::slice_x1 - consts::wire_length;
            el.x2 = x + consts::slice_x1;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE + 1 + gap * 2)
                        as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
            // FX to F connection - top
            if item
                == (tilewire::GfxTileWireId::TILE_WIRE_FXD_SLICE
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE)
            {
                el.x2 = el.x1;
                el.y2 = el.y1 - consts::wire_distance;
                g.push(el);
            }
            // F5 to F connection - bottom
            if item
                == (tilewire::GfxTileWireId::TILE_WIRE_F5D_SLICE
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE)
            {
                el.x2 = el.x1;
                el.y2 = el.y1 + consts::wire_distance;
                g.push(el);
            }
            // connection between slices
            if item
                == (tilewire::GfxTileWireId::TILE_WIRE_FCID_SLICE
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE)
                && tilewire != &tilewire::GfxTileWireId::TILE_WIRE_FCI_SLICE
            {
                el.x2 = el.x1;
                el.y2 = el.y1 - consts::wire_distance * 3.0;
                g.push(el);
            }
        }
        if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_WAD0A_SLICE
        {
            let gap = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2) / 12;
            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.x2 = x + consts::slice_x2;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2 + 1 + gap * 14)
                        as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02 {
        if x as i32 == 0 {
            el.x1 = 0.9;
        } else {
            el.x1 = x
                + consts::switchbox_x1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                        + 20.0 * (x as i32 % 3) as f64);
        }
        el.x2 = el.x1;
        el.y1 = y + consts::switchbox_y1;
        el.y2 = y + consts::switchbox_y1
            - consts::wire_distance
                * (20.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                    + 20.0 * (x as i32 % 3) as f64);
        if x as i32 != 0 && x as i32 != w - 1 {
            g.push(el);
        }

        if x as i32 == w - 2 {
            el.x2 = x + 1.0 + 0.1;
        } else {
            el.x2 = x
                + 1.0
                + consts::switchbox_x1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                        + 20.0 * (x as i32 % 3) as f64);
        }
        el.y1 = el.y2;
        if x as i32 != w - 1 {
            g.push(el);
        }

        el.x1 = el.x2;
        el.y1 = y + consts::switchbox_y1;
        if x as i32 != w - 1 && x as i32 != w - 2 {
            g.push(el);
        }

        if x as i32 == w - 1 {
            el.x1 = x + 0.1;
        } else {
            el.x1 = x
                + consts::switchbox_x1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                        + 20.0 * (x as i32 % 3) as f64);
        }
        if x as i32 == 1 {
            el.x2 = x - 1.0 + 0.9;
        } else {
            el.x2 = x - 1.0
                + consts::switchbox_x1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                        + 20.0 * (x as i32 % 3) as f64);
        }
        el.y2 = y + consts::switchbox_y1
            - consts::wire_distance
                * (20.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701) as f64
                    + 20.0 * (x as i32 % 3) as f64);
        el.y1 = el.y2;
        if x as i32 != 0 {
            g.push(el);
        }

        el.x1 = el.x2;
        el.y1 = y + consts::switchbox_y1;
        if x as i32 != 0 && x as i32 != 1 {
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02 {
        if y as i32 == 0 {
            el.y1 = 0.9;
        } else {
            el.y1 = y
                + consts::switchbox_y1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                        + 20.0 * (y as i32 % 3) as f64);
        }
        el.y2 = el.y1;
        el.x1 = x + consts::switchbox_x1;
        el.x2 = x + consts::switchbox_x1
            - consts::wire_distance
                * (20.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                    + 20.0 * (y as i32 % 3) as f64);
        if y as i32 != 0 && y as i32 != h - 1 {
            g.push(el);
        }

        if y as i32 == h - 2 {
            el.y2 = y + 1.0 + 0.1;
        } else {
            el.y2 = y
                + 1.0
                + consts::switchbox_y1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                        + 20.0 * (y as i32 % 3) as f64);
        }
        el.x1 = el.x2;
        if y as i32 != h - 1 {
            g.push(el);
        }

        el.y1 = el.y2;
        el.x1 = x + consts::switchbox_x1;
        if y as i32 != h - 1 && y as i32 != h - 2 {
            g.push(el);
        }

        if y as i32 == h - 1 {
            el.y1 = y + 0.1;
        } else {
            el.y1 = y
                + consts::switchbox_y1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                        + 20.0 * (y as i32 % 3) as f64);
        }
        if y as i32 == 1 {
            el.y2 = y - 1.0 + 0.9;
        } else {
            el.y2 = y - 1.0
                + consts::switchbox_y1
                + consts::wire_distance
                    * (20.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                        + 20.0 * (y as i32 % 3) as f64);
        }
        el.x2 = x + consts::switchbox_x1
            - consts::wire_distance
                * (20.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701) as f64
                    + 20.0 * (y as i32 % 3) as f64);
        el.x1 = el.x2;
        if y as i32 != 0 {
            g.push(el);
        }

        el.y1 = el.y2;
        el.x1 = x + consts::switchbox_x1;
        if y as i32 != 0 && y as i32 != 1 {
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06 {
        if x as i32 == 0 {
            el.x1 = 0.9;
        } else {
            el.x1 = x
                + consts::switchbox_x1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                        + 10.0 * (x as i32 % 9) as f64);
        }
        el.x2 = el.x1;
        el.y1 = y + consts::switchbox_y1;
        el.y2 = y + consts::switchbox_y1
            - consts::wire_distance
                * (96.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                    + 10.0 * (x as i32 % 9) as f64);
        if x as i32 != 0 && x as i32 != w - 1 {
            g.push(el);
        }

        if x as i32 == w - 2 || x as i32 == w - 3 || x as i32 == w - 4 {
            el.x2 = w as f64 - 1.0 + 0.1;
        } else {
            el.x2 = x
                + 3.0
                + consts::switchbox_x1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                        + 10.0 * (x as i32 % 9) as f64);
        }
        el.y1 = el.y2;
        if x as i32 != w - 1 {
            g.push(el);
        }

        el.x1 = el.x2;
        el.y1 = y + consts::switchbox_y1;
        if x as i32 != w - 1 && x as i32 != w - 2 && x as i32 != w - 3 && x as i32 != w - 4 {
            g.push(el);
        }

        if x as i32 == w - 1 {
            el.x1 = x + 0.1;
        } else {
            el.x1 = x
                + consts::switchbox_x1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                        + 10.0 * (x as i32 % 9) as f64);
        }
        if x as i32 == 1 || x as i32 == 2 || x as i32 == 3 {
            el.x2 = 0.9;
        } else {
            el.x2 = x - 3.0
                + consts::switchbox_x1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                        + 10.0 * (x as i32 % 9) as f64);
        }
        el.y2 = y + consts::switchbox_y1
            - consts::wire_distance
                * (96.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303) as f64
                    + 10.0 * (x as i32 % 9) as f64);
        el.y1 = el.y2;
        if x as i32 != 0 {
            g.push(el);
        }

        el.x1 = el.x2;
        el.y1 = y + consts::switchbox_y1;
        if x as i32 != 0 && x as i32 != 1 && x as i32 != 2 && x as i32 != 3 {
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06 {
        if y as i32 == 0 {
            el.y1 = 0.9;
        } else {
            el.y1 = y
                + consts::switchbox_y1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                        + 10.0 * (y as i32 % 9) as f64);
        }
        el.y2 = el.y1;
        el.x1 = x + consts::switchbox_x1;
        el.x2 = x + consts::switchbox_x1
            - consts::wire_distance
                * (96.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                    + 10.0 * (y as i32 % 9) as f64);
        if y as i32 != 0 && y as i32 != h - 1 {
            g.push(el);
        }

        if y as i32 == h - 2 || y as i32 == h - 3 || y as i32 == h - 4 {
            el.y2 = h as f64 - 1.0 + 0.1;
        } else {
            el.y2 = y
                + 3.0
                + consts::switchbox_y1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                        + 10.0 * (y as i32 % 9) as f64);
        }
        el.x1 = el.x2;
        if y as i32 != h - 1 {
            g.push(el);
        }

        el.y1 = el.y2;
        el.x1 = x + consts::switchbox_x1;
        if y as i32 != h - 1 && y as i32 != h - 2 && y as i32 != h - 3 && y as i32 != h - 4 {
            g.push(el);
        }

        if y as i32 == h - 1 {
            el.y1 = y + 0.1;
        } else {
            el.y1 = y
                + consts::switchbox_y1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                        + 10.0 * (y as i32 % 9) as f64);
        }
        if y as i32 == 1 || y as i32 == 2 || y as i32 == 3 {
            el.y2 = 0.9;
        } else {
            el.y2 = y - 3.0
                + consts::switchbox_y1
                + consts::wire_distance
                    * (96.0
                        + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                        + 10.0 * (y as i32 % 9) as f64);
        }
        el.x2 = x + consts::switchbox_x1
            - consts::wire_distance
                * (96.0
                    + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303) as f64
                    + 10.0 * (y as i32 % 9) as f64);
        el.x1 = el.x2;
        if y as i32 != 0 {
            g.push(el);
        }

        el.y1 = el.y2;
        el.x1 = x + consts::switchbox_x1;
        if y as i32 != 0 && y as i32 != 1 && y as i32 != 2 && y as i32 != 3 {
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01 {
        if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_V01N0001
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_V01S0100
        {
            el.x1 = x
                + consts::switchbox_x1
                + consts::wire_distance
                    * (10 + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V01N0001)) as f64;
            el.x2 = el.x1;
            if y as i32 == h - 2 {
                el.y1 = y + 1.1;
            } else {
                el.y1 = y + consts::switchbox_y1 + 1.0;
            }

            if y as i32 == 0 {
                el.y2 = y + 0.9;
            } else {
                el.y2 = y + consts::switchbox_y2;
            }

            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01 {
        if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_H01E0001
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_HL7W0001
        {
            if x as i32 == w - 1 {
                el.x1 = x + 0.1;
            } else {
                el.x1 = x + consts::switchbox_x1;
            }
            if x as i32 == 1 {
                el.x2 = x - 0.1;
            } else {
                el.x2 = x + consts::switchbox_x2 - 1.0;
            }
            el.y1 = y
                + consts::switchbox_y1
                + consts::wire_distance
                    * (10 + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H01E0001)) as f64;
            el.y2 = el.y1;
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00 {
        let group = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) / 2;
        el.x1 = x + consts::switchbox_x2
            - consts::wire_distance
                * (8 - ((tilewire - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) % 2) * 4) as f64;
        el.x2 = el.x1;
        if group != 0 {
            el.y1 = y + consts::switchbox_y1;
            el.y2 = y + consts::switchbox_y1 - consts::wire_distance * 4.0;
        } else {
            el.y1 = y + consts::switchbox_y2;
            el.y2 = y + consts::switchbox_y2 + consts::wire_distance * 4.0;
        }
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00 {
        let group = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) / 2;
        el.y1 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (8 - ((tilewire - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) % 2) * 4) as f64;
        el.y2 = el.y1;

        if group != 0 {
            el.x1 = x + consts::switchbox_x2 + consts::wire_distance * 4.0;
            el.x2 = x + consts::switchbox_x2;
        } else {
            el.x1 = x + consts::switchbox_x1 - consts::wire_distance * 4.0;
            el.x2 = x + consts::switchbox_x1;
        }
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE {
        if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_NBOUNCE
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SBOUNCE
        {
            el.x1 = x + consts::switchbox_x2 - consts::wire_distance * 4.0;
            el.x2 = x + consts::switchbox_x2 - consts::wire_distance * 8.0;
            if tilewire == &tilewire::GfxTileWireId::TILE_WIRE_NBOUNCE {
                el.y1 = y + consts::switchbox_y2 + consts::wire_distance * 4.0;
                el.y2 = el.y1;
            } else {
                el.y1 = y + consts::switchbox_y1 - consts::wire_distance * 4.0;
                el.y2 = el.y1;
            }
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_WBOUNCE
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_EBOUNCE
        {
            el.y1 = y + consts::switchbox_y1 + consts::wire_distance * 4.0;
            el.y2 = y + consts::switchbox_y1 + consts::wire_distance * 8.0;
            if tilewire == &tilewire::GfxTileWireId::TILE_WIRE_WBOUNCE {
                el.x1 = x + consts::switchbox_x1 - consts::wire_distance * 4.0;
                el.x2 = el.x1;
            } else {
                el.x1 = x + consts::switchbox_x2 + consts::wire_distance * 4.0;
                el.x2 = el.x1;
            }
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_CLK0
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LSR1
        {
            el.x1 = x + consts::switchbox_x2;
            el.x2 = x
                + consts::slice_x2
                + 15.0 * consts::wire_distance
                + (8.0 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0) as f64)
                    * consts::wire_distance;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0 - 5) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
            el.x1 = el.x2;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (3.0 + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0) as f64);
            g.push(el);
            for i in 0..4 {
                el.x1 = x + consts::slice_x2 + 15.0 * consts::wire_distance + consts::wire_distance;
                el.x2 = x
                    + consts::slice_x2
                    + 15.0 * consts::wire_distance
                    + (8.0 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0) as f64)
                        * consts::wire_distance;
                el.y1 = y + consts::slice_y2
                    - consts::wire_distance
                        * (tilewire::GfxTileWireId::TILE_WIRE_CLK3_SLICE
                            - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                            + 1
                            + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0))
                            as f64
                    + i as f64 * consts::slice_pitch;
                el.y2 = el.y1;
                g.push(el);
            }
            if tilewire == &tilewire::GfxTileWireId::TILE_WIRE_CLK1
                || tilewire == &tilewire::GfxTileWireId::TILE_WIRE_LSR1
            {
                for i in 0..2 {
                    el.x1 = x + consts::slice_x2 + 3.0 * consts::wire_distance;
                    el.x2 = x
                        + consts::slice_x2
                        + 15.0 * consts::wire_distance
                        + (8.0 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0) as f64)
                            * consts::wire_distance;
                    el.y1 = y + consts::slice_y2
                        - consts::wire_distance
                            * (tilewire::GfxTileWireId::TILE_WIRE_CLK3_SLICE
                                - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                                - 1
                                + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLK0) / 2)
                                as f64
                        + i as f64 * consts::slice_pitch;
                    el.y2 = el.y1;
                    g.push(el);
                }
            }
        }
        // TRELLIS_IO wires
        else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD
        {
            el.x1 = x + 0.5;
            el.x2 = x + 0.5 + consts::wire_length;
            let top = y as i32 == (h - 1);
            if top {
                el.y1 = y + 1.0
                    - (consts::slice_y2
                        - consts::wire_distance
                            * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                        + 3.0 * consts::slice_pitch);
            } else {
                el.y1 = y + consts::slice_y2
                    - consts::wire_distance
                        * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                    + 3.0 * consts::slice_pitch;
            }
            el.y2 = el.y1;
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7
        {
            el.x1 = x + consts::switchbox_x2;
            el.x2 = x + consts::switchbox_x2 + consts::wire_length;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JCE0 + 1) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_FCI
        {
            let gap = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO) / 24;
            let purpose = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO) % 24;
            el.x1 = x + consts::switchbox_x2;
            if purpose
                >= (tilewire::GfxTileWireId::TILE_WIRE_D7 - tilewire::GfxTileWireId::TILE_WIRE_FCO)
                && purpose
                    <= (tilewire::GfxTileWireId::TILE_WIRE_A6
                        - tilewire::GfxTileWireId::TILE_WIRE_FCO)
            {
                // Space for the LUT permutation switchbox
                el.x2 = x + consts::slice_x1 - consts::wire_length_lut;
            } else {
                el.x2 = x + consts::slice_x1 - consts::wire_length;
            }
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FCO + 1 + gap * 2) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_MUXCLK3
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_MUXLSR0
        {
            let gap = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_MUXCLK3) / 2;
            let part = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_MUXCLK3) % 2;
            el.x1 = x + consts::slice_x2 + 3.0 * consts::wire_distance;
            el.x2 = x + consts::slice_x2 + 15.0 * consts::wire_distance;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_CLK3_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + part
                        + gap * 26) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_WD3
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_WD0
        {
            let part = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_WD3) % 4;
            let group = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_WD3) / 2;
            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.x2 = x
                + consts::slice_x2
                + consts::wire_length
                + consts::wire_distance * (4 - part) as f64;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_WDO3C_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + part
                        + 14) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);

            el.x1 = el.x2;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_WD1B_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + (part & 1)
                        + 14 * 2) as f64
                + (3 - group) as f64 * consts::slice_pitch;
            g.push(el);

            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.y1 = el.y2;
            g.push(el);
        } else if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_WAD3
            && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_WAD0
        {
            let part = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_WAD3) % 4;
            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.x2 = x
                + consts::slice_x2
                + consts::wire_length
                + consts::wire_distance * (8 - part) as f64;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_WADO3C_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + part
                        + 14) as f64
                + 3.0 * consts::slice_pitch;
            el.y2 = el.y1;
            g.push(el);

            el.x1 = el.x2;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_WAD3B_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + part
                        + 14 * 2) as f64
                + 2.0 * consts::slice_pitch;
            g.push(el);

            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.y1 = el.y2;
            g.push(el);

            // middle line
            el.x1 = x + consts::slice_x2 + consts::wire_length;
            el.x2 = x
                + consts::slice_x2
                + consts::wire_length
                + consts::wire_distance * (8 - part) as f64;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (tilewire::GfxTileWireId::TILE_WIRE_WAD3B_SLICE
                        - tilewire::GfxTileWireId::TILE_WIRE_DUMMY_D2
                        + 1
                        + part
                        + 14 * 2) as f64
                + 3.0 * consts::slice_pitch;
            el.y1 = el.y2;
            g.push(el);
        }
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_HPBX {
        el.x1 = x;
        el.x2 = x + 1.0;
        el.y1 = y
            + 0.1
            + consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_G_HPBX0000 + 1) as f64;
        el.y2 = el.y1;
        g.push(el);

        el.x1 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (200 + (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_G_HPBX0000)) as f64;
        el.x2 = el.x1;
        el.y2 = y + consts::switchbox_y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_VPTX {
        el.x1 = x
            + 0.1
            + consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_G_VPTX0000 + 1) as f64;
        el.x2 = el.x1;
        el.y1 = y;
        el.y2 = y + 1.0;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_L_HPBX {
        el.x1 = x - 3.0;
        el.x2 = x + 0.08;
        el.y1 = y
            + consts::wire_distance
            + consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_L_HPBX0000 + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_R_HPBX {
        el.x1 = x + 0.2;
        el.x2 = x + 3.0;
        el.y1 = y
            + consts::wire_distance
            + consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_R_HPBX0000 + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_PIO {
        let top_bottom = y as i32 == 0 || y as i32 == (h - 1);
        let gap = 3 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) / 7;
        let num = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) % 7;
        if top_bottom {
            el.x1 = x
                + consts::io_cell_h_x1
                + (gap + 2) as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
            el.x2 = el.x1;
            if y as i32 == h - 1 {
                el.y1 = y + 1.0 - consts::io_cell_h_y2;
                el.y2 = el.y1 - consts::wire_length_long;
            } else {
                el.y1 = y + consts::io_cell_h_y2;
                el.y2 = el.y1 + consts::wire_length_long;
            }
        } else {
            if x as i32 == 0 {
                el.x1 = x + 1.0 - consts::io_cell_v_x1;
                el.x2 = el.x1 + consts::wire_length_long;
            } else {
                el.x1 = x + consts::io_cell_v_x1;
                el.x2 = el.x1 - consts::wire_length_long;
            }
            el.y1 = y
                + consts::io_cell_v_y1
                + gap as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
            el.y2 = el.y1;
        }
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_DDRDLL {
        let num = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DDRDLL;
        el.x1 = x + consts::io_cell_h_x1 + 0.2 + consts::wire_distance * (num + 1) as f64;
        el.x2 = el.x1;
        if y as i32 == h - 1 {
            el.y1 = y + consts::dll_cell_y1;
            el.y2 = el.y1 - consts::wire_length_long;
        } else {
            el.y1 = y + consts::dll_cell_y2;
            el.y2 = el.y1 + consts::wire_length_long;
        }
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_CCLK {
        let num = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JPADDI_CCLK;
        el.x1 = x + consts::slice_x1 + consts::wire_distance * (num + 1) as f64;
        el.x2 = el.x1;
        el.y1 = y + consts::slice_y2 - 1.0 * consts::slice_pitch;
        el.y2 = el.y1 - consts::wire_length_long;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC {
        let gap = 7 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) / 42;
        let num = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) % 42;
        if x as i32 == 0 {
            el.x1 = x + 1.0 - consts::io_cell_v_x1;
            el.x2 = el.x1 + consts::wire_length_long;
        } else {
            el.x1 = x + consts::io_cell_v_x1;
            el.x2 = el.x1 - consts::wire_length_long;
        }
        el.y1 = y
            + consts::io_cell_v_y1
            + gap as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC {
        let gap = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) / 20;
        let num = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
        el.x1 = x
            + consts::io_cell_h_x1
            + (5 - gap) as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
        el.x2 = el.x1;
        if y as i32 == h - 1 {
            el.y1 = y + 1.0 - consts::io_cell_h_y2;
            el.y2 = el.y1 - consts::wire_length_long;
        } else {
            el.y1 = y + consts::io_cell_h_y2;
            el.y2 = el.y1 + consts::wire_length_long;
        }
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_DQS {
        let num = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DQS;
        if x as i32 == 0 {
            el.x1 = x + 1.0 - consts::io_cell_v_x1;
            el.x2 = el.x1 + consts::wire_length_long;
        } else {
            el.x1 = x + consts::io_cell_v_x1;
            el.x2 = el.x1 - consts::wire_length_long;
        }
        el.y1 = y
            + consts::io_cell_v_y1
            + 8.0 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_EBR {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JADA0_EBR + 1) as f64
            + 3.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_MULT18 {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance_small
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_MULT18 + 1) as f64
            + 3.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_ALU54 {
        let num = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) % 225;
        let group = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) / 225;
        if group == 0 {
            el.x1 = x + consts::slice_x1 - consts::wire_length;
            el.x2 = x + consts::slice_x1;
        } else {
            el.x1 = x + consts::slice_x2_wide + consts::wire_length;
            el.x2 = x + consts::slice_x2_wide;
        }
        el.y1 = y + consts::slice_y2 - consts::wire_distance_small * (num + 1) as f64
            + 3.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_PLL {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PLL + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_GSR {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JCLK_GSR + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_JTAG {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JJCE1_JTAG + 1) as f64
            + 1.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_OSC {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_OSC + 1) as f64
            + 2.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_SED {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_SED + 1) as f64
            + 3.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_DTR {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_JSTARTPULSE_DTR + 1) as f64;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_EXTREF {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_REFCLKP_EXTREF + 1) as f64
            + 1.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_DCU {
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2
            - consts::wire_distance
                * (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CH0_RX_REFCLK_DCU + 1) as f64
            + 0.0 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    } else if wire_type == &gfx::ecp5::ConstId::WIRE_TYPE_PCSCLKDIV {
        let num = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
        let group = 1 - (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) / 7;
        el.x1 = x + consts::slice_x1 - consts::wire_length;
        el.x2 = x + consts::slice_x1;
        el.y1 = y + consts::slice_y2 - consts::wire_distance * (num + 1) as f64
            + group as f64 * consts::slice_pitch;
        el.y2 = el.y1;
        g.push(el);
    }

    g
}

fn set_source(
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    _w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
) {
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00 {
        let group = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) / 2;
        el.y1 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (8 - ((src_id - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) % 2) * 4) as f64;

        if group != 0 {
            el.x1 = x + consts::switchbox_x2;
        } else {
            el.x1 = x + consts::switchbox_x1;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01 {
        if x as i32 == src.location.x as i32 {
            el.x1 = x + consts::switchbox_x1;
        } else {
            el.x1 = x + consts::switchbox_x2;
        }
        el.y1 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (10 + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_H01E0001)) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02 {
        el.x1 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (20
                    + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701)
                    + 20 * (src.location.x as i32 % 3)) as f64;
        el.y1 = y + consts::switchbox_y1;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06 {
        el.x1 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (96
                    + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303)
                    + 10 * (src.location.x as i32 % 9)) as f64;
        el.y1 = y + consts::switchbox_y1;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00 {
        let group = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) / 2;
        el.x1 = x + consts::switchbox_x2
            - consts::wire_distance
                * (8 - ((src_id - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) % 2) * 4) as f64;
        if group != 0 {
            el.y1 = y + consts::switchbox_y1;
        } else {
            el.y1 = y + consts::switchbox_y2;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01 {
        el.x1 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (10 + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_V01N0001)) as f64;
        if y as i32 == src.location.y as i32 {
            el.y1 = y + consts::switchbox_y2;
        } else {
            el.y1 = y + consts::switchbox_y1;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02 {
        el.x1 = x + consts::switchbox_x1;
        el.y1 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (20
                    + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701)
                    + 20 * (src.location.y as i32 % 3)) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06 {
        el.x1 = x + consts::switchbox_x1;
        el.y1 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (96
                    + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303)
                    + 10 * (src.location.y as i32 % 9)) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE {
        if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_CLK0
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LSR1
        {
            el.x1 = x + consts::switchbox_x2;
            el.y1 = y + consts::slice_y2
                - consts::wire_distance
                    * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_CLK0 - 5) as f64
                + 3.0 * consts::slice_pitch;
        }
        if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI
        {
            let gap = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO) / 24;
            el.x1 = src.location.x + consts::switchbox_x2;
            el.y1 = src.location.y + consts::slice_y2
                - consts::wire_distance
                    * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO + 1 + gap * 2) as f64
                + 3.0 * consts::slice_pitch;
        }
        if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7
        {
            el.x1 = src.location.x + consts::switchbox_x2 + consts::wire_length;
            el.y1 = src.location.y + consts::slice_y2
                - consts::wire_distance
                    * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCE0 + 1) as f64
                + 3.0 * consts::slice_pitch;
        }
        if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD
        {
            let top = src.location.y as i32 == (h - 1);
            el.x1 = src.location.x + 0.5 + consts::wire_length;
            if top {
                el.y1 = src.location.y + 1.0
                    - (consts::slice_y2
                        - consts::wire_distance
                            * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                        + 3.0 * consts::slice_pitch);
            } else {
                el.y1 = src.location.y + consts::slice_y2
                    - consts::wire_distance
                        * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                    + 3.0 * consts::slice_pitch;
            }
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC {
        let gap = 7 - (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) / 42;
        let num = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) % 42;
        if src.location.x as i32 == 0 {
            el.x1 = src.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
        } else {
            el.x1 = src.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
        }
        el.y1 = src.location.y
            + consts::io_cell_v_y1
            + gap as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC {
        let gap = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) / 20;
        let num = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
        el.x1 = src.location.x
            + consts::io_cell_h_x1
            + (5 - gap) as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
        if src.location.y as i32 == h - 1 {
            el.y1 = src.location.y + 1.0 - consts::io_cell_h_y2 - consts::wire_length_long;
        } else {
            el.y1 = src.location.y + consts::io_cell_h_y2 + consts::wire_length_long;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PIO {
        let top_bottom = src.location.y as i32 == 0 || src.location.y as i32 == (h - 1);
        let gap = 3 - (src_id - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) / 7;
        let num = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) % 7;
        if top_bottom {
            el.x1 = src.location.x
                + consts::io_cell_h_x1
                + (gap + 2) as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
            if src.location.y as i32 == h - 1 {
                el.y1 = src.location.y + 1.0 - consts::io_cell_h_y2 - consts::wire_length_long;
            } else {
                el.y1 = src.location.y + 1.0 - consts::io_cell_h_y2 + consts::wire_length_long;
            }
        } else {
            if x as i32 == 0 {
                el.x1 = src.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
            } else {
                el.x1 = src.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
            }
            el.y1 = src.location.y
                + consts::io_cell_v_y1
                + gap as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_EBR {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JADA0_EBR + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_MULT18 {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance_small
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_MULT18 + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_ALU54 {
        let num = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) % 225;
        let group = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) / 225;
        if group == 0 {
            el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        } else {
            el.x1 = src.location.x + consts::slice_x2_wide + consts::wire_length;
        }
        el.y1 = src.location.y + consts::slice_y2 - consts::wire_distance_small * (num + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PLL {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PLL + 1) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_GSR {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK_GSR + 1) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_JTAG {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JJCE1_JTAG + 1) as f64
            + 1.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_OSC {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_OSC + 1) as f64
            + 2.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_SED {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_SED + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DTR {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_JSTARTPULSE_DTR + 1) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_EXTREF {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_REFCLKP_EXTREF + 1) as f64
            + 1.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DCU {
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2
            - consts::wire_distance
                * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_CH0_RX_REFCLK_DCU + 1) as f64
            + 0.0 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PCSCLKDIV {
        let num = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
        let group = 1 - (src_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) / 7;
        el.x1 = src.location.x + consts::slice_x1 - consts::wire_length;
        el.y1 = src.location.y + consts::slice_y2 - consts::wire_distance * (num + 1) as f64
            + group as f64 * consts::slice_pitch;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DQS {
        let num = src_id - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DQS;
        if src.location.x as i32 == 0 {
            el.x1 = src.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
        } else {
            el.x1 = src.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
        }
        el.y1 = src.location.y
            + consts::io_cell_v_y1
            + 8.0 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DDRDLL {
        let num = src_id - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DDRDLL;
        el.x1 = src.location.x
            + consts::io_cell_h_x1
            + consts::dll_cell_x1
            + consts::wire_distance * (num + 1) as f64;
        if src.location.y as i32 == h - 1 {
            el.y1 = src.location.y + consts::dll_cell_y1 - consts::wire_length_long;
        } else {
            el.y1 = src.location.y + consts::dll_cell_y2 + consts::wire_length_long;
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_CCLK {
        let num = src_id - &tilewire::GfxTileWireId::TILE_WIRE_JPADDI_CCLK;
        el.x1 = src.location.x + consts::slice_x1 + consts::wire_distance * (num + 1) as f64;
        el.y1 = src.location.y + consts::slice_y2
            - 1.0 * consts::slice_pitch
            - consts::wire_length_long;
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_HPBX {
        el.x1 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (200 + (src_id - &tilewire::GfxTileWireId::TILE_WIRE_G_HPBX0000)) as f64;
        el.y1 = y + consts::switchbox_y1;
    }
}

fn set_destination(
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    _w: i32,
    h: i32,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
) {
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00 {
        let group = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) / 2;
        el.y2 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (8 - ((dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000) % 2) * 4) as f64;

        if group != 0 {
            el.x2 = x + consts::switchbox_x2;
        } else {
            el.x2 = x + consts::switchbox_x1;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01 {
        if x == dst.location.x {
            el.x2 = x + consts::switchbox_x1;
        } else {
            el.x2 = x + consts::switchbox_x2;
        }
        el.y2 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (10 + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H01E0001)) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02 {
        el.x2 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (20
                    + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701)
                    + 20 * (dst.location.x as i32 % 3)) as f64;
        el.y2 = y + consts::switchbox_y1;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06 {
        el.x2 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (96
                    + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303)
                    + 10 * (dst.location.x as i32 % 9)) as f64;
        el.y2 = y + consts::switchbox_y1;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00 {
        let group = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) / 2;
        el.x2 = x + consts::switchbox_x2
            - consts::wire_distance
                * (8 - ((dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V00T0000) % 2) * 4) as f64;
        if group != 0 {
            el.y2 = y + consts::switchbox_y1;
        } else {
            el.y2 = y + consts::switchbox_y2;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01 {
        el.x2 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (10 + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V01N0001)) as f64;
        if y as i32 == dst.location.y as i32 {
            el.y2 = y + consts::switchbox_y2;
        } else {
            el.y2 = y + consts::switchbox_y1;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02 {
        el.x2 = x + consts::switchbox_x1;
        el.y2 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (20
                    + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701)
                    + 20 * (dst.location.y as i32 % 3)) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06 {
        el.x2 = x + consts::switchbox_x1;
        el.y2 = y
            + consts::switchbox_y1
            + consts::wire_distance
                * (96
                    + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303)
                    + 10 * (dst.location.y as i32 % 9)) as f64;
    }

    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE {
        if dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_CLK0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_LSR1
        {
            el.x2 = x + consts::switchbox_x2;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_CLK0 - 5) as f64
                + 3.0 * consts::slice_pitch;
        }
        if dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI
        {
            let gap = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO) / 24;
            el.x2 = x + consts::switchbox_x2;
            el.y2 = y + consts::slice_y2
                - consts::wire_distance
                    * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO + 1 + gap * 2) as f64
                + 3.0 * consts::slice_pitch;
        }
        if dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7
        {
            el.x2 = dst.location.x + consts::switchbox_x2;
            el.y2 = dst.location.y + consts::slice_y2
                - consts::wire_distance
                    * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCE0 + 1) as f64
                + 3.0 * consts::slice_pitch;
        }
        if dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD
        {
            let top = dst.location.y as i32 == (h - 1);
            el.x2 = dst.location.x + 0.5;
            if top {
                el.y2 = dst.location.y + 1.0
                    - (consts::slice_y2
                        - consts::wire_distance
                            * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                        + 3.0 * consts::slice_pitch);
            } else {
                el.y2 = dst.location.y + consts::slice_y2
                    - consts::wire_distance
                        * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JDIA + 1) as f64
                    + 3.0 * consts::slice_pitch;
            }
        }
    }

    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC {
        let gap = 7 - (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) / 42;
        let num = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADND_IOLOGIC) % 42;
        if dst.location.x as i32 == 0 {
            el.x2 = dst.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
        } else {
            el.x2 = dst.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
        }
        el.y2 = dst.location.y
            + consts::io_cell_v_y1
            + gap as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC {
        let gap = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) / 20;
        let num = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JLOADNB_SIOLOGIC) % 20;
        el.x2 = dst.location.x
            + consts::io_cell_h_x1
            + (5 - gap) as f64 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
        if dst.location.y as i32 == h - 1 {
            el.y2 = dst.location.y + 1.0 - consts::io_cell_h_y2 - consts::wire_length_long;
        } else {
            el.y2 = dst.location.y + consts::io_cell_h_y2 + consts::wire_length_long;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PIO {
        let top_bottom = dst.location.y as i32 == 0 || dst.location.y as i32 == (h - 1);
        let gap = 3 - (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) / 7;
        let num = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_PADDOD_PIO) % 7;
        if top_bottom {
            el.x2 = dst.location.x
                + consts::io_cell_h_x1
                + (gap + 2) as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
            if dst.location.y as i32 == h - 1 {
                el.y2 = dst.location.y + 1.0 - consts::io_cell_h_y2 - consts::wire_length_long;
            } else {
                el.y2 = dst.location.y + 1.0 - consts::io_cell_h_y2 + consts::wire_length_long;
            }
        } else {
            if x as i32 == 0 {
                el.x2 = dst.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
            } else {
                el.x2 = dst.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
            }
            el.y2 = dst.location.y
                + consts::io_cell_v_y1
                + gap as f64 * consts::io_cell_gap
                + consts::wire_distance * (num + 1) as f64;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_EBR {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JADA0_EBR + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_MULT18 {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance_small
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_MULT18 + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_ALU54 {
        let num = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) % 225;
        let group = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK0_ALU54) / 225;
        if group == 0 {
            el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        } else {
            el.x2 = dst.location.x + consts::slice_x2_wide + consts::wire_length;
        }
        el.y2 = dst.location.y + consts::slice_y2 - consts::wire_distance_small * (num + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PLL {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PLL + 1) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_GSR {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCLK_GSR + 1) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_JTAG {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JJCE1_JTAG + 1) as f64
            + 1.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_OSC {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_OSC + 1) as f64
            + 2.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SED {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_SEDSTDBY_SED + 1) as f64
            + 3.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DTR {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JSTARTPULSE_DTR + 1) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_EXTREF {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_REFCLKP_EXTREF + 1) as f64
            + 1.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DCU {
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2
            - consts::wire_distance
                * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_CH0_RX_REFCLK_DCU + 1) as f64
            + 0.0 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PCSCLKDIV {
        let num = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) % 7;
        let group = 1 - (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_CLKI_PCSCLKDIV1) / 7;
        el.x2 = dst.location.x + consts::slice_x1 - consts::wire_length;
        el.y2 = dst.location.y + consts::slice_y2 - consts::wire_distance * (num + 1) as f64
            + group as f64 * consts::slice_pitch;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DQS {
        let num = dst_id - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DQS;
        if dst.location.x as i32 == 0 {
            el.x2 = dst.location.x + 1.0 - consts::io_cell_v_x1 + consts::wire_length_long;
        } else {
            el.x2 = dst.location.x + consts::io_cell_v_x1 - consts::wire_length_long;
        }
        el.y2 = dst.location.y
            + consts::io_cell_v_y1
            + 8.0 * consts::io_cell_gap
            + consts::wire_distance * (num + 1) as f64;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DDRDLL {
        let num = dst_id - &tilewire::GfxTileWireId::TILE_WIRE_DDRDEL_DDRDLL;
        el.x2 = dst.location.x
            + consts::io_cell_h_x1
            + consts::dll_cell_x1
            + consts::wire_distance * (num + 1) as f64;
        if dst.location.y as i32 == h - 1 {
            el.y2 = dst.location.y + consts::dll_cell_y1 - consts::wire_length_long;
        } else {
            el.y2 = dst.location.y + consts::dll_cell_y2 + consts::wire_length_long;
        }
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_CCLK {
        let num = dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JPADDI_CCLK;
        el.x2 = dst.location.x + consts::slice_x1 + consts::wire_distance * (num + 1) as f64;
        el.y2 = dst.location.y + consts::slice_y2
            - 1.0 * consts::slice_pitch
            - consts::wire_length_long;
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_HPBX {
        el.x2 = x
            + consts::switchbox_x1
            + consts::wire_distance
                * (200 + (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_G_HPBX0000)) as f64;
        el.y2 = y + consts::switchbox_y1;
    }
}

fn straight_line(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
) {
    set_source(el, x, y, w, h, src, src_type, src_id);
    set_destination(el, x, y, w, h, dst, dst_type, dst_id);
    g.push(*el);
}

fn lut_perm_pip(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    _x: f64,
    _y: f64,
    _w: i32,
    _h: i32,
    src: &WireId,
    _src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    _dst: &WireId,
    _dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
) {
    let gap = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO) / 24;
    el.x1 = src.location.x + consts::slice_x1 - consts::wire_length_lut;
    el.y1 = src.location.y + consts::slice_y2
        - consts::wire_distance
            * (src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO + 1 + gap * 2) as f64
        + 3.0 * consts::slice_pitch;
    el.x2 = src.location.x + consts::slice_x1 - consts::wire_length;
    el.y2 = src.location.y + consts::slice_y2
        - consts::wire_distance
            * (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE + 1 + gap * 2) as f64
        + 3.0 * consts::slice_pitch;
    g.push(*el);
}

fn to_same_side_hor(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
    idx: i32,
) {
    let sign = if src_type == dst_type { 1 } else { -1 };
    set_source(el, x, y, w, h, src, src_type, src_id);
    el.x2 = el.x1;
    el.y2 = y
        + consts::switchbox_y1
        + (consts::switchbox_y2 - consts::switchbox_y1) / 2.0
        + sign as f64 * consts::wire_distance * idx as f64;
    g.push(*el);

    let mut el2 = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    set_destination(&mut el2, x, y, w, h, dst, dst_type, dst_id);

    el.x1 = el2.x2;
    el.y1 = el.y2;
    g.push(*el);

    el2.x1 = el.x1;
    el2.y1 = el.y1;
    g.push(el2);
}

fn to_same_side_ver(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
    idx: i32,
) {
    let sign = if src_type == dst_type { 1 } else { -1 };
    set_source(el, x, y, w, h, src, src_type, src_id);
    el.x2 = x
        + consts::switchbox_x1
        + (consts::switchbox_x2 - consts::switchbox_x1) / 2.0
        + sign as f64 * consts::wire_distance * idx as f64;
    el.y2 = el.y1;
    g.push(*el);

    let mut el2 = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    set_destination(&mut el2, x, y, w, h, dst, dst_type, dst_id);

    el.x1 = el.x2;
    el.y1 = el2.y2;
    g.push(*el);

    el2.x1 = el.x1;
    el2.y1 = el.y1;
    g.push(el2);
}

fn to_same_side_h1_ver(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
    idx: i32,
) {
    set_source(el, x, y, w, h, src, src_type, src_id);
    el.x2 = x + consts::switchbox_x1 + (consts::switchbox_x2 - consts::switchbox_x1) / 2.0
        - consts::wire_distance * idx as f64;
    el.y2 = el.y1;
    g.push(*el);

    let mut el2 = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    set_destination(&mut el2, x, y, w, h, dst, dst_type, dst_id);

    el.x1 = el.x2;
    el.y1 = el2.y2;
    g.push(*el);

    el2.x1 = el.x1;
    el2.y1 = el.y1;
    g.push(el2);
}

fn to_same_side_h1_hor(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
    _idx: i32,
) {
    set_source(el, x, y, w, h, src, src_type, src_id);

    let mut el2 = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    set_destination(&mut el2, x, y, w, h, dst, dst_type, dst_id);
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00
    {
        el.x2 = el.x1;
        el.y2 = el2.y2;
        g.push(*el);
    } else {
        el.x2 = el2.x2;
        el.y2 = el.y1;
        g.push(*el);
    }

    el2.x1 = el.x2;
    el2.y1 = el.y2;
    g.push(el2);
}

fn to_same_side_v1_ver(
    g: &mut Vec<gfx::GraphicElement>,
    el: &mut gfx::GraphicElement,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
    idx: i32,
) {
    set_source(el, x, y, w, h, src, src_type, src_id);
    el.x2 = el.x1;
    el.y2 = y + consts::switchbox_y1 + (consts::switchbox_y2 - consts::switchbox_y1) / 2.0
        - consts::wire_distance * idx as f64;
    g.push(*el);

    let mut el2 = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    set_destination(&mut el2, x, y, w, h, dst, dst_type, dst_id);

    el.x1 = el2.x2;
    el.y1 = el.y2;
    g.push(*el);

    el2.x1 = el.x1;
    el2.y1 = el.y1;
    g.push(el2);
}

pub fn tile_pip(
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src: &WireId,
    src_type: &gfx::ecp5::ConstId,
    src_id: &tilewire::GfxTileWireId,
    dst: &WireId,
    dst_type: &gfx::ecp5::ConstId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
) -> Vec<gfx::GraphicElement> {
    let mut g: Vec<gfx::GraphicElement> = vec![];
    let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    // To H00
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00
    {
        to_same_side_h1_ver(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H00L0000 + 30,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    // To H01
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H01E0001,
        );
    }

    // To H02
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        to_same_side_hor(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        to_same_side_hor(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        if y == src.location.y {
            straight_line(
                &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
            );
        } else {
            to_same_side_v1_ver(
                &mut g,
                &mut el,
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
                dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701,
            );
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    // To H06
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
    {
        to_same_side_hor(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
    {
        to_same_side_hor(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
    {
        if y == src.location.y {
            straight_line(
                &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
            );
        } else {
            to_same_side_v1_ver(
                &mut g,
                &mut el,
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
                dst_id - &tilewire::GfxTileWireId::TILE_WIRE_H06W0303,
            );
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    // To V00
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00
    {
        to_same_side_v1_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_H02W0701 + 20,
        );
    }

    // To V01
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V01N0001,
        );
    }

    // To V02
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        if x == src.location.x {
            to_same_side_h1_ver(
                &mut g,
                &mut el,
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
                dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701,
            );
        } else {
            straight_line(
                &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
            );
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303,
        );
    }

    // To V06
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
    {
        if x == src.location.x {
            to_same_side_h1_ver(
                &mut g,
                &mut el,
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
                dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303,
            );
        } else {
            straight_line(
                &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
            );
        }
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
    {
        to_same_side_h1_hor(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_V02N0701,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V06
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_V06N0303,
        );
    }

    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
    {
        to_same_side_h1_ver(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H00
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        to_same_side_h1_ver(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCE0,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
    {
        to_same_side_h1_ver(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        to_same_side_h1_ver(
            &mut g,
            &mut el,
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
            dst_id - &tilewire::GfxTileWireId::TILE_WIRE_JCE0,
        );
    }

    if (src_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00
        || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02)
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && ((dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
            || (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
                && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7))
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H02
        || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V00
        || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01
        || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V02)
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && ((src_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
            || (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
                && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7))
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI)
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO,
        );
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && dst_id == &tilewire::GfxTileWireId::TILE_WIRE_JCE0
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && src_id == &tilewire::GfxTileWireId::TILE_WIRE_JCE0
    {
        to_same_side_ver(
            &mut g,
            &mut el,
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
            src_id - &tilewire::GfxTileWireId::TILE_WIRE_JCE0,
        );
    }

    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SLICE && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE && src_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI
            && dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI_SLICE {
        // LUT permutation pseudo-pip
        let src_purpose = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO) % 24;
        let dst_purpose = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE) % 24;
        if src_purpose
            >= (tilewire::GfxTileWireId::TILE_WIRE_D7 - tilewire::GfxTileWireId::TILE_WIRE_FCO)
            && src_purpose
                <= (tilewire::GfxTileWireId::TILE_WIRE_A6
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO)
            && dst_purpose
                >= (tilewire::GfxTileWireId::TILE_WIRE_D7_SLICE
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE)
            && dst_purpose
                <= (tilewire::GfxTileWireId::TILE_WIRE_A6_SLICE
                    - tilewire::GfxTileWireId::TILE_WIRE_FCO_SLICE)
        {
            lut_perm_pip(
                &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
            );
        }
    }

    if (src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PLL
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_GSR
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_JTAG
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_OSC
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SED
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DTR
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_EXTREF
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DCU
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PCSCLKDIV
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DDRDLL
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_CCLK
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_DQS
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_EBR
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_MULT18
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_ALU54))
        && (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PLL
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_GSR
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_JTAG
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_OSC
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_SED
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DTR
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_EXTREF
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DCU
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PCSCLKDIV
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DDRDLL
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_CCLK
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_DQS
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_EBR
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_MULT18
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_ALU54))
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    if (src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC
            || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_PIO))
        && (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (src_type == &gfx::ecp5::ConstId::WIRE_TYPE_IOLOGIC
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_SIOLOGIC
            || src_type == &gfx::ecp5::ConstId::WIRE_TYPE_PIO))
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD)
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JDIA
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_ECLKD)
        && (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    if dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_NONE
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_HPBX
        && ((dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_JCE0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_JQ7)
            || (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_CLK0
                && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_FCI))
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }
    if (dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_H01
        || dst_type == &gfx::ecp5::ConstId::WIRE_TYPE_V01)
        && src_type == &gfx::ecp5::ConstId::WIRE_TYPE_G_HPBX
    {
        straight_line(
            &mut g, &mut el, x, y, w, h, src, src_type, src_id, dst, dst_type, dst_id,
        );
    }

    g
}
