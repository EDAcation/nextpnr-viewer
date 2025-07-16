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

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
#[allow(dead_code)]
pub enum Type {
    None,
    Line,
    Arrow,
    Box,
    FilledBox,
    Circle,
    Label,
    LocalArrow, // Located entirely within the cell boundaries, coordinates in the range [0., 1.]
    LocalLine,
}

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq)]
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

#[derive(Debug, Clone, Copy, Hash, PartialEq, Eq, Serialize, Deserialize)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Color {
    pub fn float_r(&self) -> f32 {
        (self.r as f32).clamp(0.0, 255.0) / 255.0
    }

    pub fn float_g(&self) -> f32 {
        (self.g as f32).clamp(0.0, 255.0) / 255.0
    }

    pub fn float_b(&self) -> f32 {
        (self.b as f32).clamp(0.0, 255.0) / 255.0
    }
}

#[derive(Debug, Clone, Copy)]
#[allow(dead_code)]
pub struct GraphicElement {
    pub r#type: Type,
    pub style: Style,
    pub color: Option<Color>,
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
    pub z: f64,
}

impl GraphicElement {
    pub fn new(r#type: Type, style: Style) -> Self {
        GraphicElement {
            r#type,
            style,
            color: None,
            x1: 0.0,
            y1: 0.0,
            x2: 0.0,
            y2: 0.0,
            z: 0.0,
        }
    }
}
