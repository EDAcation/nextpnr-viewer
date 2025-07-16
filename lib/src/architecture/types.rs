use crate::decal;
use crate::gfx;

#[derive(Clone)]
pub struct WireLocation {
    pub x: i16,
    pub y: i16,
}

#[derive(Clone)]
pub struct Wire {
    pub location: WireLocation,
    pub name: String,
}

pub trait Architecture<DecalID> {
    fn get_decal_graphics(&self, decal: &DecalID) -> Vec<gfx::GraphicElement>;
    fn get_bel_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_wire_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    #[allow(dead_code)]
    fn get_pip_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_group_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn find_pip_decal_by_loc_from_to(
        &self,
        location: &WireLocation,
        from: &Wire,
        to: &Wire,
    ) -> Option<decal::DecalXY<DecalID>>;
}
