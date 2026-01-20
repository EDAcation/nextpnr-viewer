mod ecp5;
mod ice40;

#[allow(dead_code)]
#[derive(Clone)]
pub struct DecalXY<DecalID> {
    pub decal: DecalID,
    pub x: f64,
    pub y: f64,
    pub id: String,
}

impl<DecalID> DecalXY<DecalID> {
    pub fn new(decal: DecalID, x: f64, y: f64, id: String) -> Self {
        Self { decal, x, y, id }
    }
}

pub use ecp5::{ECP5DecalID, ECP5DecalType};
pub use ice40::{ICE40DecalID, ICE40DecalType, ICE40GroupId, ICE40GroupType, ICE40TileType};
