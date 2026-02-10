use std::ops::Sub;

use anyhow::{Error, Result};
use num_derive::FromPrimitive;
use num_traits::FromPrimitive;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[allow(non_camel_case_types)]
#[derive(Clone, Copy, PartialEq, Debug, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum ICE40DecalType {
    TYPE_NONE,
    TYPE_BEL,
    TYPE_WIRE,
    TYPE_PIP,
    TYPE_GROUP,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct ICE40DecalID {
    pub r#type: ICE40DecalType,
    pub index: i32,
    pub active: bool,
}

impl Default for ICE40DecalID {
    fn default() -> Self {
        ICE40DecalID {
            r#type: ICE40DecalType::TYPE_NONE,
            index: -1,
            active: false,
        }
    }
}

impl ICE40DecalID {
    pub fn new(r#type: ICE40DecalType, index: i32, active: bool) -> Self {
        ICE40DecalID {
            r#type,
            index,
            active,
        }
    }
}

impl Sub for &ICE40GroupType {
    type Output = i8;

    fn sub(self, rhs: Self) -> Self::Output {
        (*self as Self::Output) - (*rhs as Self::Output)
    }
}

impl Sub for ICE40GroupType {
    type Output = i8;

    fn sub(self, rhs: Self) -> Self::Output {
        (self as Self::Output) - (rhs as Self::Output)
    }
}

impl TryFrom<i8> for ICE40GroupType {
    type Error = Error;

    fn try_from(val: i8) -> Result<Self> {
        match FromPrimitive::from_i8(val) {
            Some(res) => Ok(res),
            None => Err(Error::msg("Could not derive ConstId from value")),
        }
    }
}

#[allow(non_camel_case_types)]
#[repr(i8)]
#[derive(Clone, Copy, PartialEq, PartialOrd, FromPrimitive)]
pub enum ICE40GroupType {
    TYPE_NONE = 0,
    TYPE_FRAME,
    TYPE_MAIN_SW,
    TYPE_LOCAL_SW,
    TYPE_LC0_SW,
    TYPE_LC1_SW,
    TYPE_LC2_SW,
    TYPE_LC3_SW,
    TYPE_LC4_SW,
    TYPE_LC5_SW,
    TYPE_LC6_SW,
    TYPE_LC7_SW,
}

#[derive(Clone)]
pub struct ICE40GroupId {
    pub r#type: ICE40GroupType,
    pub x: i8,
    pub y: i8,
}

impl Default for ICE40GroupId {
    fn default() -> Self {
        ICE40GroupId {
            r#type: ICE40GroupType::TYPE_NONE,
            x: 0,
            y: 0,
        }
    }
}

impl ICE40GroupId {
    pub fn new(r#type: ICE40GroupType, x: i8, y: i8) -> Self {
        ICE40GroupId { r#type, x, y }
    }

    pub fn name(&self) -> String {
        match self.r#type {
            ICE40GroupType::TYPE_FRAME => "tile".to_string(),
            ICE40GroupType::TYPE_MAIN_SW => "main_sw".to_string(),
            ICE40GroupType::TYPE_LOCAL_SW => "local_sw".to_string(),
            ICE40GroupType::TYPE_LC0_SW => "lc0_sw".to_string(),
            ICE40GroupType::TYPE_LC1_SW => "lc1_sw".to_string(),
            ICE40GroupType::TYPE_LC2_SW => "lc2_sw".to_string(),
            ICE40GroupType::TYPE_LC3_SW => "lc3_sw".to_string(),
            ICE40GroupType::TYPE_LC4_SW => "lc4_sw".to_string(),
            ICE40GroupType::TYPE_LC5_SW => "lc5_sw".to_string(),
            ICE40GroupType::TYPE_LC6_SW => "lc6_sw".to_string(),
            ICE40GroupType::TYPE_LC7_SW => "lc7_sw".to_string(),
            _ => "UNKNOWN_GROUP".to_string(),
        }
    }
}

impl TryFrom<u32> for ICE40TileType {
    type Error = Error;

    fn try_from(val: u32) -> Result<Self> {
        match FromPrimitive::from_u32(val) {
            Some(res) => Ok(res),
            None => Err(Error::msg("Could not derive ConstId from value")),
        }
    }
}

#[allow(non_camel_case_types)]
#[repr(u32)]
#[derive(Clone, Copy, PartialEq, PartialOrd, FromPrimitive)]
pub enum ICE40TileType {
    TILE_NONE = 0,
    TILE_LOGIC = 1,
    TILE_IO = 2,
    TILE_RAMB = 3,
    TILE_RAMT = 4,
    TILE_DSP0 = 5,
    TILE_DSP1 = 6,
    TILE_DSP2 = 7,
    TILE_DSP3 = 8,
    TILE_IPCON = 9,
}
