use crate::decal;
use crate::gfx;

#[derive(Clone)]
pub struct PipLocation {
    pub x: i16,
    pub y: i16,
}

#[derive(Clone)]
pub struct Pip {
    pub location: PipLocation,
    pub name: String,
}

pub trait Architecture<DecalID> {
    fn get_decal_graphics(&self, decal: &DecalID) -> Vec<gfx::GraphicElement>;
    fn get_bel_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_wire_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_pip_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_group_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn find_pip_decal_by_loc_from_to(
        &self,
        location: &PipLocation,
        from: &Pip,
        to: &Pip,
    ) -> Option<decal::DecalXY<DecalID>>;
}
