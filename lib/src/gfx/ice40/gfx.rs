#![allow(clippy::too_many_arguments)]

use super::consts;
use super::tilewire;
use crate::gfx;

pub fn tile_wire(
    g: &mut Vec<gfx::GraphicElement>,
    x: f64,
    y: f64,
    w: i32,
    h: i32,
    src_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
) {
    let mut el = gfx::GraphicElement::new(gfx::Type::Line, *style);

    // Horizontal Span-4 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_36
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_47
    {
        let idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_36) + 48;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1)) as f64);
        let y2 = y + 1.0 - (0.03 + 0.0025 * (60 - idx) as f64);

        el.x1 = x;
        el.x2 = x + 0.01;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el);

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y1;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + 0.02;
        el.x2 = x + 0.9;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * (idx + 35) as f64;
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_47
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_0;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (60 - idx) as f64);
        let y2 = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1)) as f64);
        let y3 = y + 1.0 - (0.03 + 0.0025 * (60 - (idx ^ 1) - 12) as f64);

        if idx >= 12 {
            el.x1 = x;
            el.x2 = x + 0.01;
            el.y1 = y1;
            el.y2 = y1;
            g.push(el);

            el.x1 = x + 0.01;
            el.x2 = x + 0.02;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el);
        }

        el.x1 = x + 0.02;
        el.x2 = x + 0.9;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + 0.9;
        el.x2 = x + 1.0;
        el.y1 = y2;
        el.y2 = y3;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35) as f64;
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    // Vertical Span-4 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_36
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_47
    {
        let idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_36) + 48;

        let x1 = x + 0.03 + 0.0025 * (60 - (idx ^ 1)) as f64;
        let x2 = x + 0.03 + 0.0025 * (60 - idx) as f64;

        el.y1 = y + 1.00;
        el.y2 = y + 0.99;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el);

        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        el.x1 = x1;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 0.98;
        el.y2 = y + 0.10;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - idx) as f64);
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_47
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_0;

        let x1 = x + 0.03 + 0.0025 * (60 - idx) as f64;
        let x2 = x + 0.03 + 0.0025 * (60 - (idx ^ 1)) as f64;
        let x3 = x + 0.03 + 0.0025 * (60 - (idx ^ 1) - 12) as f64;

        if idx >= 12 {
            el.y1 = y + 1.00;
            el.y2 = y + 0.99;
            el.x1 = x1;
            el.x2 = x1;
            g.push(el);

            el.y1 = y + 0.99;
            el.y2 = y + 0.98;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el);
        }

        el.y1 = y + 0.98;
        el.y2 = y + 0.10;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 0.10;
        el.y2 = y;
        el.x1 = x2;
        el.x2 = x3;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (145 - (idx ^ 1)) as f64);
        el.y2 = el.y1;
        el.x1 = x;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)) as f64);
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // Horizontal Span-12 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_22
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_23
    {
        let idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_22) + 24;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1)) as f64);
        let y2 = y + 1.0 - (0.03 + 0.0025 * (90 - idx) as f64);

        el.x1 = x;
        el.x2 = x + 0.01;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el);

        el.x1 = x + 0.01;
        el.x2 = x + 0.02;
        el.y1 = y1;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + 0.02;
        el.x2 = x + 0.98333;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * (idx + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_23
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_0;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (90 - idx) as f64);
        let y2 = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1)) as f64);
        let y3 = y + 1.0 - (0.03 + 0.0025 * (90 - (idx ^ 1) - 2) as f64);

        if idx >= 2 {
            el.x1 = x;
            el.x2 = x + 0.01;
            el.y1 = y1;
            el.y2 = y1;
            g.push(el);

            el.x1 = x + 0.01;
            el.x2 = x + 0.02;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el);
        }

        el.x1 = x + 0.02;
        el.x2 = x + 0.98333;
        el.y1 = y2;
        el.y2 = y2;
        g.push(el);

        el.x1 = x + 0.98333;
        el.x2 = x + 1.0;
        el.y1 = y2;
        el.y2 = y3;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y2;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    // Vertical Right Span-4

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_47
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_0;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (145 - (idx ^ 1)) as f64);

        el.y1 = y1;
        el.y2 = y1;
        el.x1 = x + consts::main_swbox_x2;
        el.x2 = x + 1.0;
        g.push(el);
    }

    // Vertical Span-12 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_22
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_23
    {
        let idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_22) + 24;

        let x1 = x + 0.03 + 0.0025 * (90 - (idx ^ 1)) as f64;
        let x2 = x + 0.03 + 0.0025 * (90 - idx) as f64;

        el.y1 = y + 1.00;
        el.y2 = y + 0.99;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el);

        el.y1 = y + 0.99;
        el.y2 = y + 0.98;
        el.x1 = x1;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 0.98;
        el.y2 = y + 0.01667;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - idx) as f64);
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_23
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_0;

        let x1 = x + 0.03 + 0.0025 * (90 - idx) as f64;
        let x2 = x + 0.03 + 0.0025 * (90 - (idx ^ 1)) as f64;
        let x3 = x + 0.03 + 0.0025 * (90 - (idx ^ 1) - 2) as f64;

        if idx >= 2 {
            el.y1 = y + 1.00;
            el.y2 = y + 0.99;
            el.x1 = x1;
            el.x2 = x1;
            g.push(el);

            el.y1 = y + 0.99;
            el.y2 = y + 0.98;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el);
        }

        el.y1 = y + 0.98;
        el.y2 = y + 0.01667;
        el.x1 = x2;
        el.x2 = x2;
        g.push(el);

        el.y1 = y + 0.01667;
        el.y2 = y;
        el.x1 = x2;
        el.x2 = x3;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)) as f64);
        el.y2 = el.y1;
        el.x1 = x2;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // IO Span-4 Wires connecting to fabric

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_47
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_0;
        let y1 = y + 1.0 - (0.03 + 0.0025 * (48 - (idx ^ 1)) as f64);

        el.x1 = x;
        el.x2 = x + 1.0;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35) as f64;
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_47
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_0;
        let x1 = x + 0.03 + 0.0025 * (48 - (idx ^ 1)) as f64;

        el.x1 = x1;
        el.x2 = x1;
        el.y1 = y;
        el.y2 = y + 1.0;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)) as f64);
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // IO Span-12 Wires connecting to fabric

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_23
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_0;
        let y1 = y + 1.0 - (0.03 + 0.0025 * (88 - (idx ^ 1)) as f64);

        el.x1 = x;
        el.x2 = x + 1.0;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el);

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_23
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_0;
        let x1 = x + 0.03 + 0.0025 * (88 - (idx ^ 1)) as f64;

        el.x1 = x1;
        el.x2 = x1;
        el.y1 = y;
        el.y2 = y + 1.0;
        g.push(el);

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)) as f64);
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // Horizontal IO Span-4 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_R_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_L_15
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_R_0;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (60 - idx) as f64);
        let y2 = y + 1.0 - (0.03 + 0.0025 * (60 - idx - 4) as f64);

        el.x1 = x;
        el.x2 = x + 0.9;
        el.y1 = y1;
        el.y2 = y1;
        g.push(el);

        if idx <= 15 {
            el.x1 = x + 0.9;
            el.x2 = x + 1.0;
            el.y1 = y1;
            el.y2 = y2;
            g.push(el);
        }

        el.x1 = x + consts::main_swbox_x1 + 0.0025 * (idx + 35) as f64;
        el.x2 = el.x1;
        el.y1 = y1;
        el.y2 = y + consts::main_swbox_y2;
        g.push(el);
    }

    // Vertical IO Span-4 Wires

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_B_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_T_15
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_B_0;

        let x1 = x + 0.03 + 0.0025 * (60 - idx) as f64;
        let x2 = x + 0.03 + 0.0025 * (60 - idx - 4) as f64;

        el.y1 = y + 1.00;
        el.y2 = y + 0.10;
        el.x1 = x1;
        el.x2 = x1;
        g.push(el);

        if idx <= 15 {
            el.y1 = y + 0.10;
            el.y2 = y;
            el.x1 = x1;
            el.x2 = x2;
            g.push(el);
        }

        if idx <= 15 && (x as i32 == 0 || x as i32 == w - 1) && y as i32 == 1 {
            let y1 = y - (0.03 + 0.0025 * (60 - idx - 4) as f64);

            el.x1 = x2;
            el.y1 = y;
            el.x2 = x2;
            el.y2 = y1;
            g.push(el);

            el.x1 = x2;
            el.y1 = y1;
            el.x2 = x + (x as i32 == 0) as i32 as f64;
            el.y2 = y1;
            g.push(el);
        }

        if idx >= 4 && (x as i32 == 0 || x as i32 == w - 1) && y as i32 == h - 2 {
            let y1 = y + 2.0 - (0.03 + 0.0025 * (60 - idx) as f64);

            el.x1 = x1;
            el.y1 = y + 1.0;
            el.x2 = x1;
            el.y2 = y1;
            g.push(el);

            el.x1 = x1;
            el.y1 = y1;
            el.x2 = x + (x as i32 == 0) as i32 as f64;
            el.y2 = y1;
            g.push(el);
        }

        el.y1 = y + 1.0 - (0.03 + 0.0025 * (270 - idx) as f64);
        el.y2 = el.y1;
        el.x1 = x1;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // Global2Local

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_3
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_0;
        el.x1 = x + consts::main_swbox_x1 + 0.005 * (idx + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y + consts::main_swbox_y1;
        el.y2 = el.y1 - 0.02;
        g.push(el);
    }

    // GlobalNets

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_7
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_0;
        el.x1 = x + consts::main_swbox_x1 - 0.05;
        el.x2 = x + consts::main_swbox_x1;
        el.y1 = y + consts::main_swbox_y1 + 0.005 * (13 - idx) as f64;
        el.y2 = el.y1;
        g.push(el);
    }

    // Neighbours

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_BNL_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_TOP_7
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_BNL_0;
        el.y1 = y + consts::main_swbox_y2 - (0.0025 * (idx + 10) as f64 + 0.01 * (idx / 8) as f64);
        el.y2 = el.y1;
        el.x1 = x + consts::main_swbox_x1 - 0.05;
        el.x2 = x + consts::main_swbox_x1;
        g.push(el);
    }

    // Local Tracks

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G3_7
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0;
        el.x1 = x + consts::main_swbox_x2;
        el.x2 = x + consts::local_swbox_x1;
        let yoff =
            y + (consts::local_swbox_y1 + consts::local_swbox_y2) / 2.0 - 0.005 * 16.0 - 0.075;
        el.y1 = yoff + 0.005 * idx as f64 + 0.05 * (idx / 8) as f64;
        el.y2 = el.y1;
        g.push(el);
    }

    // LC Inputs

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0;
        let z = idx / 4;
        let input = idx % 4;
        el.x1 = x + consts::local_swbox_x2;
        el.x2 = x + consts::lut_swbox_x1;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075
            - (0.005 * input as f64)
            + z as f64 * consts::logic_cell_pitch;
        el.y2 = el.y1;
        g.push(el);
    }

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3_LUT
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT;
        let z = idx / 4;
        let input = idx % 4;
        el.x1 = x + consts::lut_swbox_x2;
        el.x2 = x + consts::logic_cell_x1;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075
            - (0.005 * input as f64)
            + z as f64 * consts::logic_cell_pitch;
        el.y2 = el.y1;
        g.push(el);
    }

    // LC Outputs

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_OUT
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_OUT
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_OUT;

        let y1 = y + 1.0 - (0.03 + 0.0025 * (152 + idx) as f64);

        el.y1 = y1;
        el.y2 = y1;
        el.x1 = x + consts::main_swbox_x2;
        el.x2 = x + 0.97 + 0.0025 * (7 - idx) as f64;
        g.push(el);

        el.y1 = y1;
        el.y2 = y
            + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0
            + idx as f64 * consts::logic_cell_pitch;
        el.x1 = el.x2;
        g.push(el);

        el.y1 = el.y2;
        el.x1 = x + consts::logic_cell_x2;
        g.push(el);
    }

    // LC Control

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_CEN
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_S_R
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_CEN;

        el.x1 = x + consts::main_swbox_x2 - 0.005 * (idx + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y + consts::main_swbox_y1;
        el.y2 = el.y1 - 0.005 * (idx + 2) as f64;
        g.push(el);

        el.y1 = el.y2;
        el.x2 = x + consts::logic_cell_x2 - 0.005 * (2 - idx + 5) as f64;
        g.push(el);

        el.y2 = y + consts::logic_cell_y1;
        el.x1 = el.x2;
        g.push(el);

        for i in 0..6 {
            el.y1 = y + consts::logic_cell_y2 + i as f64 * consts::logic_cell_pitch;
            el.y2 = y + consts::logic_cell_y1 + (i + 1) as f64 * consts::logic_cell_pitch;
            g.push(el);
        }
    }

    // LC Control for IO and BRAM

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_CEN
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_S_R
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_CEN;

        el.x1 = x + consts::main_swbox_x2 - 0.005 * (idx + 5) as f64;
        el.x2 = el.x1;
        el.y1 = y + consts::main_swbox_y1;
        el.y2 = el.y1 - 0.005 * (idx + 2) as f64;
        g.push(el);

        el.y1 = el.y2;
        el.x2 = x + consts::logic_cell_x2 - 0.005 * (2 - idx + 5) as f64;
        g.push(el);

        el.y2 = y + consts::logic_cell_y1;
        el.x1 = el.x2;
        g.push(el);
    }

    if src_id == &tilewire::GfxTileWireId::TILE_WIRE_FABOUT {
        el.y1 = y + consts::main_swbox_y1;
        el.y2 = el.y1 - 0.005 * 4.0;
        el.x1 = x + consts::main_swbox_x2 - 0.005 * 9.0;
        el.x2 = el.x1;
        g.push(el);
    }

    if src_id == &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_G0 {
        el.y1 = y + consts::logic_cell_y1;
        el.y2 = el.y1 - 0.005 * 4.0;
        el.x1 = x + consts::logic_cell_x2 - 0.005 * 3.0;
        el.x2 = el.x1;
        g.push(el);
    }

    // LC Cascade

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_LOUT
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_6_LOUT
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_LOUT;
        el.x1 = x + consts::logic_cell_x1 + 0.005 * 5.0;
        el.x2 = el.x1;
        el.y1 = y + consts::logic_cell_y2 + idx as f64 * consts::logic_cell_pitch;
        el.y2 = y + consts::logic_cell_y1 + (idx + 1) as f64 * consts::logic_cell_pitch;
        g.push(el);
    }

    // Carry Chain

    if src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_COUT
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_COUT
    {
        let idx = src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_COUT;
        el.x1 = x + consts::logic_cell_x1 + 0.005 * 3.0;
        el.x2 = el.x1;
        el.y1 = y + consts::logic_cell_y2 + idx as f64 * consts::logic_cell_pitch;
        el.y2 = y
            + (if idx < 7 {
                consts::logic_cell_y1 + (idx + 1) as f64 * consts::logic_cell_pitch
            } else {
                1.0
            });
        g.push(el);
    }

    if src_id == &tilewire::GfxTileWireId::TILE_WIRE_CARRY_IN {
        el.x1 = x + consts::logic_cell_x1 + 0.005 * 3.0;
        el.x2 = el.x1;
        el.y1 = y;
        el.y2 = y + 0.01;
        g.push(el);
    }

    if src_id == &tilewire::GfxTileWireId::TILE_WIRE_CARRY_IN_MUX {
        el.x1 = x + consts::logic_cell_x1 + 0.005 * 3.0;
        el.x2 = el.x1;
        el.y1 = y + 0.02;
        el.y2 = y + consts::logic_cell_y1;
        g.push(el);
    }
}

pub fn get_wire_xy_main(tilewire: &tilewire::GfxTileWireId) -> Option<(f64, f64)> {
    // Horizontal Span-4 Wires

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_36
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_47
    {
        let idx = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_L_36) + 48;
        let x = consts::main_swbox_x1 + 0.0025 * (idx + 35) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_47
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP4_H_R_0;
        let x = consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    // Vertical Span-4 Wires

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_36
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_47
    {
        let idx = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_T_36) + 48;
        let y = 1.0 - (0.03 + 0.0025 * (270 - idx) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_47
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP4_V_B_0;
        let y = 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // Horizontal Span-12 Wires

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_22
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_23
    {
        let idx = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_L_22) + 24;
        let x = consts::main_swbox_x1 + 0.0025 * (idx + 5) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_23
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP12_H_R_0;
        let x = consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    // Vertical Right Span-4

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_47
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP4_R_V_B_0;
        let y = 1.0 - (0.03 + 0.0025 * (145 - (idx ^ 1)) as f64);
        let x = consts::main_swbox_x2;
        return Some((x, y));
    }

    // Vertical Span-12 Wires

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_22
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_23
    {
        let idx = (tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_T_22) + 24;
        let y = 1.0 - (0.03 + 0.0025 * (300 - idx) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_23
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SP12_V_B_0;
        let y = 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // IO Span-4 Wires connecting to fabric

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_47
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_0;
        let x = consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 35) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_47
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_0;
        let y = 1.0 - (0.03 + 0.0025 * (270 - (idx ^ 1)) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // IO Span-12 Wires connecting to fabric

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_23
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_HORZ_0;
        let x = consts::main_swbox_x1 + 0.0025 * ((idx ^ 1) + 5) as f64;
        let y = consts::main_swbox_y2;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_23
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN12_VERT_0;
        let y = 1.0 - (0.03 + 0.0025 * (300 - (idx ^ 1)) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // IO Span-4 Wires

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_R_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_L_15
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_HORZ_R_0;
        let y = consts::main_swbox_y2;
        let x = consts::main_swbox_x1 + 0.0025 * (idx + 35) as f64;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_B_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_T_15
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_SPAN4_VERT_B_0;
        let y = 1.0 - (0.03 + 0.0025 * (270 - idx) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // Global2Local

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_3
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_GLB2LOCAL_0;
        let x = consts::main_swbox_x1 + 0.005 * (idx + 5) as f64;
        let y = consts::main_swbox_y1;
        return Some((x, y));
    }

    // GlobalNets

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_7
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_GLB_NETWK_0;
        let x = consts::main_swbox_x1;
        let y = consts::main_swbox_y1 + 0.005 * (13 - idx) as f64;
        return Some((x, y));
    }

    // Neighbours

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_BNL_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_TOP_7
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_NEIGH_OP_BNL_0;
        let y = consts::main_swbox_y2 - (0.0025 * (idx + 10) as f64 + 0.01 * (idx / 8) as f64);
        let x = consts::main_swbox_x1;
        return Some((x, y));
    }

    // Local Tracks

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G3_7
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0;
        let yoff = (consts::local_swbox_y1 + consts::local_swbox_y2) / 2.0 - 0.005 * 16.0 - 0.075;
        let x = consts::main_swbox_x2;
        let y = yoff + 0.005 * idx as f64 + 0.05 * (idx / 8) as f64;
        return Some((x, y));
    }

    // LC Outputs

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_OUT
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_OUT
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_OUT;
        let y = 1.0 - (0.03 + 0.0025 * (152 + idx) as f64);
        let x = consts::main_swbox_x2;
        return Some((x, y));
    }

    // LC Control

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_CEN
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_S_R
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_GLOBAL_CEN;
        let x = consts::main_swbox_x2 - 0.005 * (idx + 5) as f64;
        let y = consts::main_swbox_y1;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_CEN
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_S_R
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_FUNC_GLOBAL_CEN;
        let x = consts::main_swbox_x2 - 0.005 * (idx + 5) as f64;
        let y = consts::main_swbox_y1;
        return Some((x, y));
    }

    if tilewire == &tilewire::GfxTileWireId::TILE_WIRE_FABOUT {
        let x = consts::main_swbox_x2 - 0.005 * 9.0;
        let y = consts::main_swbox_y1;
        return Some((x, y));
    }

    None
}

pub fn get_wire_xy_local(tilewire: &tilewire::GfxTileWireId) -> Option<(f64, f64)> {
    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G3_7
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_LOCAL_G0_0;
        let yoff = (consts::local_swbox_y1 + consts::local_swbox_y2) / 2.0 - 0.005 * 16.0 - 0.075;
        let x = consts::local_swbox_x1;
        let y = yoff + 0.005 * idx as f64 + 0.05 * (idx / 8) as f64;
        return Some((x, y));
    }

    if tilewire >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0
        && tilewire <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3
    {
        let idx = tilewire - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0;
        let z = idx / 4;
        let input = 3 - idx % 4;
        let x = consts::local_swbox_x2;
        let y = (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 - 0.0075
            + (0.005 * input as f64)
            + z as f64 * consts::logic_cell_pitch;
        return Some((x, y));
    }

    None
}

pub fn pip(
    g: &mut Vec<gfx::GraphicElement>,
    x: f64,
    y: f64,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    swx1: f64,
    swy1: f64,
    swx2: f64,
    swy2: f64,
    style: &gfx::Style,
) {
    let mut tx = 0.5 * (x1 + x2);
    let mut ty = 0.5 * (y1 + y2);
    let mut edge_pip = false;

    let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

    if (x1 - swx1).abs() < 0.001 && (x2 - swx1).abs() < 0.001 {
        tx = swx1 + 0.25 * (y1 - y2).abs();
        edge_pip = true;
    } else if (x1 - swx2).abs() < 0.001 && (x2 - swx2).abs() < 0.001 {
        tx = swx2 - 0.25 * (y1 - y2).abs();
        edge_pip = true;
    } else if (y1 - swy1).abs() < 0.001 && (y2 - swy1).abs() < 0.001 {
        ty = swy1 + 0.25 * (x1 - x2).abs();
        edge_pip = true;
    } else if (y1 - swy2).abs() < 0.001 && (y2 - swy2).abs() < 0.001 {
        ty = swy2 - 0.25 * (x1 - x2).abs();
        edge_pip = true;
    }

    if edge_pip {
        el.x1 = x + x1;
        el.y1 = y + y1;
        el.x2 = x + tx;
        el.y2 = y + ty;
        g.push(el);

        el.x1 = x + tx;
        el.y1 = y + ty;
        el.x2 = x + x2;
        el.y2 = y + y2;
        g.push(el);
    } else {
        el.x1 = x + x1;
        el.y1 = y + y1;
        el.x2 = x + x2;
        el.y2 = y + y2;
        g.push(el);
    }
}

pub fn tile_pip(
    g: &mut Vec<gfx::GraphicElement>,
    x: f64,
    y: f64,
    src_id: &tilewire::GfxTileWireId,
    dst_id: &tilewire::GfxTileWireId,
    style: &gfx::Style,
) {
    if let (Some(xy1), Some(xy2)) = (get_wire_xy_main(src_id), get_wire_xy_main(dst_id)) {
        pip(
            g,
            x,
            y,
            xy1.0,
            xy1.1,
            xy2.0,
            xy2.1,
            consts::main_swbox_x1,
            consts::main_swbox_y1,
            consts::main_swbox_x2,
            consts::main_swbox_y2,
            style,
        );
        return;
    }

    if let (Some(xy1), Some(xy2)) = (get_wire_xy_local(src_id), get_wire_xy_local(dst_id)) {
        pip(
            g,
            x,
            y,
            xy1.0,
            xy1.1,
            xy2.0,
            xy2.1,
            consts::local_swbox_x1,
            consts::local_swbox_y1,
            consts::local_swbox_x2,
            consts::local_swbox_y2,
            style,
        );
        return;
    }

    if &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT <= src_id
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3_LUT
        && &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_OUT <= dst_id
        && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_OUT
    {
        let lut_idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT) / 4;
        let in_idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT) % 4;

        let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

        el.x1 = x + consts::logic_cell_x1;
        el.x2 = x + consts::logic_cell_x2;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075
            - (0.005 * in_idx as f64)
            + lut_idx as f64 * consts::logic_cell_pitch;
        el.y2 = y
            + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0
            + lut_idx as f64 * consts::logic_cell_pitch;
        g.push(el);

        return;
    }

    if &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0 <= src_id
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3
        && &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT <= dst_id
        && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3_LUT
    {
        let lut_idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) / 4;
        let in_idx = (src_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) % 4;
        let out_idx = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0_LUT) % 4;

        let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

        el.x1 = x + consts::lut_swbox_x1;
        el.x2 = x + consts::lut_swbox_x2;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075
            - (0.005 * in_idx as f64)
            + lut_idx as f64 * consts::logic_cell_pitch;
        el.y2 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075
            - (0.005 * out_idx as f64)
            + lut_idx as f64 * consts::logic_cell_pitch;
        g.push(el);

        return;
    }

    if (src_id == &tilewire::GfxTileWireId::TILE_WIRE_CARRY_IN_MUX
        || (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_COUT
            && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_6_COUT))
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3
            && (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) % 4 == 3)
    {
        let lut_idx = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) / 4;

        let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);
        el.x1 = x + (consts::local_swbox_x2 + consts::lut_swbox_x1) / 2.0;
        el.x2 = el.x1;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075 - (0.005 * 3.0)
            + lut_idx as f64 * consts::logic_cell_pitch;
        el.y2 = y
            + (consts::logic_cell_y1 + consts::logic_cell_y2 - consts::logic_cell_pitch) / 2.0
            + lut_idx as f64 * consts::logic_cell_pitch;
        g.push(el);

        el.x1 = x + consts::logic_cell_x1 + 0.005 * 3.0;
        el.y1 = el.y2;
        g.push(el);

        return;
    }

    if (src_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_LOUT
        && src_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_6_LOUT)
        && (dst_id >= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0
            && dst_id <= &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_7_IN_3
            && (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) % 4 == 2)
    {
        let lut_idx = (dst_id - &tilewire::GfxTileWireId::TILE_WIRE_LUTFF_0_IN_0) / 4;

        let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

        el.x1 = x + (consts::local_swbox_x2 + consts::lut_swbox_x1) / 2.0 + 0.005;
        el.x2 = el.x1;
        el.y1 = y + (consts::logic_cell_y1 + consts::logic_cell_y2) / 2.0 + 0.0075 - (0.005 * 2.0)
            + lut_idx as f64 * consts::logic_cell_pitch;
        el.y2 = y
            + (consts::logic_cell_y1 + consts::logic_cell_y2 - consts::logic_cell_pitch) / 2.0
            + lut_idx as f64 * consts::logic_cell_pitch
            + 0.003;
        g.push(el);

        el.x1 = x + consts::logic_cell_x1 + 0.005 * 5.0;
        el.y1 = el.y2;
        g.push(el);
        return;
    }

    if src_id == &tilewire::GfxTileWireId::TILE_WIRE_CARRY_IN
        && dst_id == &tilewire::GfxTileWireId::TILE_WIRE_CARRY_IN_MUX
    {
        let mut el = gfx::GraphicElement::new(gfx::Type::Arrow, *style);

        el.x1 = x + consts::logic_cell_x1 + 0.005 * 3.0;
        el.x2 = el.x1;
        el.y1 = y + 0.01;
        el.y2 = y + 0.02;
        g.push(el);
    }
}
