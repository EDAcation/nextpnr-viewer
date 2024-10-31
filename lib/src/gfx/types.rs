/*
 *  nextpnr -- Next Generation Place and Route
 *
 *  Copyright (C) 2018  Claire Xenia Wolf <claire@yosyshq.com>
 *  Copyright (C) 2018  Serge Bazanski <q3k@q3k.org>
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
 * Source: https://github.com/YosysHQ/nextpnr/blob/9c2d96f86ed56b77c9c325041b67654f26308270/common/kernel/nextpnr_base_types.h
 */

#[derive(Debug, Clone, Copy)]
#[allow(dead_code)]
pub enum Type {
    None,
    Line,
    Arrow,
    Box,
    Circle,
    Label,
    LocalArrow, // Located entirely within the cell boundaries, coordinates in the range [0., 1.]
    LocalLine,
}

#[derive(Debug, Clone, Copy)]
#[allow(dead_code)]
pub enum Style {
    Grid,
    Frame,    // Static "frame". Contrast between Inactive and Active
    Hidden,   // Only display when object is selected or highlighted
    Inactive, // Render using low-contrast color
    Active,   // Render using high-contrast color

    // UI highlight groups
    Highlighted0,
    Highlighted1,
    Highlighted2,
    Highlighted3,
    Highlighted4,
    Highlighted5,
    Highlighted6,
    Highlighted7,

    Selected,
    Hover,
}

#[derive(Debug, Clone, Copy)]
pub struct GraphicElement {
    pub r#type: Type,
    pub style: Style,
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
    pub z: f64,
}

impl GraphicElement {
    pub fn new(r#type: Type, style: Style) -> Self {
        GraphicElement {
            r#type: r#type,
            style: style,
            x1: 0.0,
            y1: 0.0,
            x2: 0.0,
            y2: 0.0,
            z: 0.0,
        }
    }
}
