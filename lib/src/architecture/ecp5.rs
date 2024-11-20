use super::types::{Architecture, Pip, PipLocation};
use crate::chipdb;
use crate::decal;
use crate::decal::ECP5DecalID;
use crate::gfx;
use crate::gfx::ecp5::consts;

type DecalID = decal::ECP5DecalID;
type Decal = decal::DecalXY<DecalID>;

pub struct ECP5Arch {
    chipdb: chipdb::ecp5::ChipInfoPOD,
}

impl ECP5Arch {
    pub fn new(chipdb: chipdb::ecp5::ChipInfoPOD) -> Self {
        ECP5Arch { chipdb }
    }
}

impl Architecture<DecalID> for ECP5Arch {
    fn get_decal_graphics(&self, decal: &DecalID) -> Vec<gfx::GraphicElement> {
        if decal.r#type == decal::ECP5DecalType::TYPE_BEL {
            let tile = decal.location.y * (self.chipdb.width as f64) + decal.location.x;
            let Some(loc_info) = self
                .chipdb
                .location_type
                .get(tile as usize)
                .and_then(|&t| self.chipdb.locations.get(t as usize))
            else {
                return vec![];
            };

            let Some(bel_info) = loc_info.bel_data.get(decal.z as usize) else {
                return vec![];
            };

            let x = decal.location.x;
            let y = decal.location.y;
            let z = bel_info.z;
            let width = self.chipdb.width;
            let height = self.chipdb.height;
            let r#type = &bel_info.r#type;
            let style = &gfx::Style::Inactive;

            return gfx::ecp5::tile_bel(x, y, z, width, height, r#type, style);
        } else if decal.r#type == decal::ECP5DecalType::TYPE_WIRE {
            let tile = decal.location.y * (self.chipdb.width as f64) + decal.location.x;
            let Some(loc_info) = self
                .chipdb
                .location_type
                .get(tile as usize)
                .and_then(|&t| self.chipdb.locations.get(t as usize))
            else {
                return vec![];
            };

            let Some(wire_data) = loc_info.wire_data.get(decal.z as usize) else {
                return vec![];
            };

            let x = decal.location.x;
            let y = decal.location.y;
            let width = self.chipdb.width;
            let height = self.chipdb.height;
            let wiretype = &wire_data.r#type;
            let tilewire = &wire_data.tile_wire;
            let style = &gfx::Style::Inactive;
            return gfx::ecp5::tile_wire(x, y, width, height, wiretype, tilewire, style);
        } else if decal.r#type == decal::ECP5DecalType::TYPE_GROUP {
            let r#type = decal.z;
            let x = decal.location.x;
            let y = decal.location.y;

            if (r#type as i32) == 1
            /* GroupId::TYPE_SWITCHBOX */
            {
                let mut el = gfx::GraphicElement::new(gfx::Type::Box, gfx::Style::Frame);
                el.x1 = x + consts::switchbox_x1;
                el.x2 = x + consts::switchbox_x2;
                el.y1 = y + consts::switchbox_y1;
                el.y2 = y + consts::switchbox_y2;
                return vec![el];
            }
        } else if decal.r#type == decal::ECP5DecalType::TYPE_PIP {
            // Utility functions to get wire/decal loc info
            let loc_info_wire = |wire: &gfx::ecp5::WireId| {
                let tile = wire.location.y * (self.chipdb.width as f64) + wire.location.x;
                return self
                    .chipdb
                    .location_type
                    .get(tile as usize)
                    .and_then(|&t| self.chipdb.locations.get(t as usize));
            };
            let loc_info_decal = |decal: &decal::ECP5DecalID| {
                let tile = decal.location.y * (self.chipdb.width as f64) + decal.location.x;
                return self
                    .chipdb
                    .location_type
                    .get(tile as usize)
                    .and_then(|&t| self.chipdb.locations.get(t as usize));
            };

            // Get pip
            let Some(pip) = loc_info_decal(&decal).and_then(|l| l.pip_data.get(decal.z as usize))
            else {
                return vec![];
            };

            // Get src wire info
            let src_wire = gfx::ecp5::WireId {
                location: gfx::ecp5::Location {
                    x: decal.location.x + (pip.rel_src_loc.x as f64),
                    y: decal.location.y + (pip.rel_src_loc.y as f64),
                },
            };
            let Some(loc_src_wire) = loc_info_wire(&src_wire) else {
                return vec![];
            };
            let Some(src_wire_info) = loc_src_wire.wire_data.get(pip.src_idx as usize) else {
                return vec![];
            };

            // Get dst wire info
            let dst_wire = gfx::ecp5::WireId {
                location: gfx::ecp5::Location {
                    x: decal.location.x + (pip.rel_dst_loc.x as f64),
                    y: decal.location.y + (pip.rel_dst_loc.y as f64),
                },
            };
            let Some(loc_dst_wire) = loc_info_wire(&dst_wire) else {
                return vec![];
            };
            let Some(dst_wire_info) = loc_dst_wire.wire_data.get(pip.dst_idx as usize) else {
                return vec![];
            };

            let x = decal.location.x;
            let y = decal.location.y;

            let width = self.chipdb.width;
            let height = self.chipdb.height;

            let src_type = &src_wire_info.r#type;
            let dst_type = &dst_wire_info.r#type;

            let src_id = src_wire_info.tile_wire;
            let dst_id = dst_wire_info.tile_wire;

            let style = &gfx::Style::Hidden;

            return gfx::ecp5::tile_pip(
                x, y, width, height, &src_wire, src_type, &src_id, &dst_wire, dst_type, &dst_id,
                style,
            );
        }

        return vec![];
    }

    fn get_bel_decals(&self) -> Vec<Decal> {
        let mut cursor_index = 0;
        let mut cursor_tile = 0;

        let mut ret: Vec<Decal> = vec![];

        while cursor_tile != self.chipdb.width * self.chipdb.height {
            while cursor_tile < self.chipdb.num_tiles {
                let Some(len) = self
                    .chipdb
                    .location_type
                    .get(cursor_tile as usize)
                    .and_then(|&t| self.chipdb.locations.get(t as usize))
                    .map(|l| l.bel_data.len())
                else {
                    return vec![];
                };
                if cursor_index < len {
                    break;
                }

                cursor_index = 0;
                cursor_tile += 1;
            }

            let x = cursor_tile % self.chipdb.width;
            let y = cursor_tile / self.chipdb.width;

            let name = self
                .chipdb
                .location_type
                .get(cursor_tile as usize)
                .and_then(|&t| self.chipdb.locations.get(t as usize))
                .and_then(|l| l.bel_data.get(cursor_index))
                .map(|w| &w.name);

            ret.push(Decal::new(
                ECP5DecalID::new(
                    decal::ECP5DecalType::TYPE_BEL,
                    x as f64,
                    y as f64,
                    cursor_index as f64,
                ),
                0.0,
                0.0,
                format!("X{}/Y{}/{}", x, y, name.unwrap_or(&"Unnamed".to_string())),
            ));
            cursor_index += 1;
        }
        return ret;
    }

    fn get_wire_decals(&self) -> Vec<Decal> {
        let mut cursor_index = 0;
        let mut cursor_tile = 0;

        let mut ret: Vec<Decal> = vec![];

        while cursor_tile != self.chipdb.width * self.chipdb.height {
            while cursor_tile < self.chipdb.num_tiles {
                let Some(len) = self
                    .chipdb
                    .location_type
                    .get(cursor_tile as usize)
                    .and_then(|&t| self.chipdb.locations.get(t as usize))
                    .map(|l| l.wire_data.len())
                else {
                    return vec![];
                };
                if cursor_index < len {
                    break;
                }

                cursor_index = 0;
                cursor_tile += 1;
            }
            let x = cursor_tile % self.chipdb.width;
            let y = cursor_tile / self.chipdb.width;
            let name = self
                .chipdb
                .location_type
                .get(cursor_tile as usize)
                .and_then(|&t| self.chipdb.locations.get(t as usize))
                .and_then(|l| l.wire_data.get(cursor_index))
                .map(|w| &w.name);

            ret.push(Decal::new(
                DecalID::new(
                    decal::ECP5DecalType::TYPE_WIRE,
                    x as f64,
                    y as f64,
                    cursor_index as f64,
                ),
                0.0,
                0.0,
                format!("X{}/Y{}/{}", x, y, name.unwrap_or(&"Unnamed".to_string())),
            ));
            cursor_index += 1;
        }
        return ret;
    }

    fn get_pip_decals(&self) -> Vec<Decal> {
        let mut cursor_tile = 0;
        let mut cursor_index = 0;

        let mut ret: Vec<Decal> = vec![];

        while cursor_tile != self.chipdb.width * self.chipdb.height {
            while cursor_tile < self.chipdb.num_tiles {
                let Some(len) = self
                    .chipdb
                    .location_type
                    .get(cursor_tile as usize)
                    .and_then(|&t| self.chipdb.locations.get(t as usize))
                    .map(|l| l.pip_data.len())
                else {
                    return vec![];
                };
                if cursor_index < len {
                    break;
                }

                cursor_index = 0;
                cursor_tile += 1;
            }

            let x = cursor_tile % self.chipdb.width;
            let y = cursor_tile / self.chipdb.width;

            ret.push(Decal::new(
                ECP5DecalID::new(
                    decal::ECP5DecalType::TYPE_PIP,
                    x as f64,
                    y as f64,
                    cursor_index as f64,
                ),
                0.0,
                0.0,
                format!("TODO({}, {})", cursor_tile, cursor_index),
            ));

            cursor_index += 1;
        }
        return ret;
    }

    fn get_group_decals(&self) -> Vec<Decal> {
        let mut ret: Vec<Decal> = vec![];

        for y in 1..self.chipdb.height {
            for x in 1..self.chipdb.width {
                ret.push(Decal::new(
                    DecalID::new(decal::ECP5DecalType::TYPE_GROUP, x as f64, y as f64, 1.0),
                    0.0,
                    0.0,
                    format!("X{x}/Y{y}/UNKNOWN_GROUP"),
                ))
            }
        }

        return ret;
    }

    fn find_pip_decal_by_loc_from_to(
        &self,
        location: &PipLocation,
        from: &Pip,
        to: &Pip,
    ) -> Option<Decal> {
        let tile = (location.y as i32) * self.chipdb.width + (location.x as i32);
        let loc_type = self.chipdb.location_type.get(tile as usize)?;

        let index: usize = self
            .chipdb
            .locations
            .get(loc_type.clone() as usize)
            .map(|l| {
                l.pip_data
                    .iter()
                    .enumerate()
                    .filter(
                        // Relative offsets
                        |(_, pd)| {
                            pd.rel_src_loc.x == from.location.x
                                && pd.rel_src_loc.y == from.location.y
                                && pd.rel_dst_loc.x == to.location.x
                                && pd.rel_dst_loc.y == to.location.y
                        },
                    )
                    .filter(|(_, pd)| {
                        // From Name
                        let src_x = (location.x + pd.rel_src_loc.x) as usize;
                        let src_y = (location.y + pd.rel_src_loc.y) as usize;
                        let src_idx = pd.src_idx as usize;

                        let src_tile = src_y * (self.chipdb.width as usize) + src_x;
                        let Some(src_wire_data) = self
                            .chipdb
                            .location_type
                            .get(src_tile)
                            .and_then(|&t| self.chipdb.locations.get(t as usize))
                            .and_then(|l| l.wire_data.get(src_idx))
                        else {
                            return false;
                        };

                        return src_wire_data.name == from.name;
                    })
                    .filter(|(_, pd)| {
                        // To name
                        let dst_x = (location.x + pd.rel_dst_loc.x) as usize;
                        let dst_y = (location.y + pd.rel_dst_loc.y) as usize;
                        let dst_idx = pd.dst_idx as usize;

                        let dst_tile = dst_y * (self.chipdb.width as usize) + dst_x;
                        let Some(dst_wire_data) = self
                            .chipdb
                            .location_type
                            .get(dst_tile)
                            .and_then(|&t| self.chipdb.locations.get(t as usize))
                            .and_then(|l| l.wire_data.get(dst_idx))
                        else {
                            return false;
                        };

                        return dst_wire_data.name == to.name;
                    })
                    .map(|(i, _pd)| i) // Convert back into index
                    .collect()
            })
            .and_then(|v: Vec<usize>| v.get(0).cloned())?;

        return Some(Decal::new(
            DecalID::new(
                decal::ECP5DecalType::TYPE_PIP,
                location.x as f64,
                location.y as f64,
                index as f64,
            ),
            0.0,
            0.0,
            "${JSON.stringify([location, from, to])}".to_string(), // TODO: proper fmt
        ));
    }
}
