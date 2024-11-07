use crate::chipdb;
use crate::decal;
use crate::gfx;

pub struct ArchitectureLocation {
    pub location: chipdb::ecp5::LocationPOD,
    pub name: String,
}

pub trait Architecture<DecalID> {
    fn get_decal_graphics(&self, decal: DecalID) -> Vec<gfx::GraphicElement>;
    fn get_bel_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_wire_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_pip_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn get_group_decals(&self) -> Vec<decal::DecalXY<DecalID>>;
    fn find_pip_decal_by_loc_from_to(
        &self,
        location: chipdb::ecp5::LocationPOD,
        from: ArchitectureLocation,
        to: ArchitectureLocation,
    ) -> Option<decal::DecalXY<DecalID>>;
}
