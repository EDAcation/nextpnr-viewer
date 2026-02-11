use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[allow(non_camel_case_types)]
#[derive(Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum ECP5DecalType {
    TYPE_NONE,
    TYPE_BEL,
    TYPE_WIRE,
    TYPE_PIP,
    TYPE_GROUP,
}

#[derive(Clone, Copy, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct ECP5DecalLocation {
    pub x: f64,
    pub y: f64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ECP5DecalID {
    pub r#type: ECP5DecalType,
    pub location: ECP5DecalLocation,
    pub z: f64,
}

impl Default for ECP5DecalID {
    fn default() -> Self {
        ECP5DecalID {
            r#type: ECP5DecalType::TYPE_NONE,
            location: ECP5DecalLocation { x: 0.0, y: 0.0 },
            z: 0.0,
        }
    }
}

impl ECP5DecalID {
    pub fn new(r#type: ECP5DecalType, x: f64, y: f64, z: f64) -> Self {
        ECP5DecalID {
            r#type,
            location: ECP5DecalLocation { x, y },
            z,
        }
    }
}
