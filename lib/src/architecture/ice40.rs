use super::types::{Architecture, Wire, WireLocation};
use crate::chipdb;
use crate::decal;
use crate::decal::ICE40GroupId;
use crate::gfx;
use crate::gfx::ice40::{consts, tile_pip, tile_wire, ConstId, GfxTileWireId};

type DecalID = decal::ICE40DecalID;
type Decal = decal::DecalXY<DecalID>;

pub struct ICE40Arch {
    chipdb: chipdb::ice40::ChipInfoPOD,
}

impl ICE40Arch {
    pub fn new(chipdb: chipdb::ice40::ChipInfoPOD) -> Self {
        ICE40Arch { chipdb }
    }
}

impl Architecture<DecalID> for ICE40Arch {
    fn get_decal_graphics(&self, decal: &DecalID) -> Vec<gfx::GraphicElement> {
        let mut g: Vec<gfx::GraphicElement> = vec![];

        if decal.r#type == decal::ICE40DecalType::TYPE_GROUP {
            let r#type = decal::ICE40GroupType::try_from(((decal.index >> 16) & 255) as i8)
                .unwrap_or(decal::ICE40GroupType::TYPE_NONE);
            let x = ((decal.index >> 8) & 255) as f64;
            let y = (decal.index & 255) as f64;

            if r#type == decal::ICE40GroupType::TYPE_FRAME {
                let mut el = gfx::GraphicElement::new(gfx::Type::Line, gfx::Style::Frame);
                el.x1 = x + 0.01;
                el.x2 = x + 0.02;
                el.y1 = y + 0.01;
                el.y2 = y + 0.01;
                g.push(el);
                el.x1 = x + 0.01;
                el.x2 = x + 0.01;
                el.y1 = y + 0.01;
                el.y2 = y + 0.02;
                g.push(el);

                el.x1 = x + 0.99;
                el.x2 = x + 0.98;
                el.y1 = y + 0.01;
                el.y2 = y + 0.01;
                g.push(el);
                el.x1 = x + 0.99;
                el.x2 = x + 0.99;
                el.y1 = y + 0.01;
                el.y2 = y + 0.02;
                g.push(el);

                el.x1 = x + 0.99;
                el.x2 = x + 0.98;
                el.y1 = y + 0.99;
                el.y2 = y + 0.99;
                g.push(el);
                el.x1 = x + 0.99;
                el.x2 = x + 0.99;
                el.y1 = y + 0.99;
                el.y2 = y + 0.98;
                g.push(el);

                el.x1 = x + 0.01;
                el.x2 = x + 0.02;
                el.y1 = y + 0.99;
                el.y2 = y + 0.99;
                g.push(el);
                el.x1 = x + 0.01;
                el.x2 = x + 0.01;
                el.y1 = y + 0.99;
                el.y2 = y + 0.98;
                g.push(el);
            }

            if r#type == decal::ICE40GroupType::TYPE_MAIN_SW {
                let mut el = gfx::GraphicElement::new(gfx::Type::Box, gfx::Style::Frame);
                el.x1 = x + consts::main_swbox_x1;
                el.x2 = x + consts::main_swbox_x2;
                el.y1 = y + consts::main_swbox_y1;
                el.y2 = y + consts::main_swbox_y2;
                g.push(el);
            }

            if r#type == decal::ICE40GroupType::TYPE_LOCAL_SW {
                let mut el = gfx::GraphicElement::new(gfx::Type::Box, gfx::Style::Frame);
                el.x1 = x + consts::local_swbox_x1;
                el.x2 = x + consts::local_swbox_x2;
                el.y1 = y + consts::local_swbox_y1;
                el.y2 = y + consts::local_swbox_y2;
                g.push(el);
            }

            if decal::ICE40GroupType::TYPE_LC0_SW <= r#type
                && r#type <= decal::ICE40GroupType::TYPE_LC7_SW
            {
                let mut el = gfx::GraphicElement::new(gfx::Type::Box, gfx::Style::Frame);
                el.x1 = x + consts::lut_swbox_x1;
                el.x2 = x + consts::lut_swbox_x2;
                el.y1 = y
                    + consts::logic_cell_y1
                    + consts::logic_cell_pitch
                        * (r#type - decal::ICE40GroupType::TYPE_LC0_SW) as f64;
                el.y2 = y
                    + consts::logic_cell_y2
                    + consts::logic_cell_pitch
                        * (r#type - decal::ICE40GroupType::TYPE_LC0_SW) as f64;
                g.push(el);
            }
        }

        if decal.r#type == decal::ICE40DecalType::TYPE_WIRE {
            let p = &self.chipdb.wire_data[decal.index as usize].segments;

            let style = if decal.active {
                gfx::Style::Active
            } else {
                gfx::Style::Inactive
            };

            for i in 0..p.len() {
                tile_wire(
                    &mut g,
                    p[i].x.into(),
                    p[i].y.into(),
                    self.chipdb.width,
                    self.chipdb.height,
                    &GfxTileWireId::try_from(p[i].index as u32).unwrap(),
                    &style,
                );
            }
        }

        if decal.r#type == decal::ICE40DecalType::TYPE_PIP {
            let p = &self.chipdb.pip_data[decal.index as usize];
            let style = if decal.active {
                gfx::Style::Active
            } else {
                gfx::Style::Hidden
            };
            tile_pip(
                &mut g,
                p.x.into(),
                p.y.into(),
                &GfxTileWireId::try_from(p.src_seg as u32).unwrap(),
                &GfxTileWireId::try_from(p.dst_seg as u32).unwrap(),
                &style,
            );
        }

        if decal.r#type == decal::ICE40DecalType::TYPE_BEL {
            let bel_index = decal.index as usize;
            let bel_type =
                ConstId::try_from(self.chipdb.bel_data[bel_index].r#type as u32).unwrap();

            if bel_type == ConstId::ICESTORM_LC {
                let mut el = gfx::GraphicElement::new(
                    gfx::Type::Box,
                    if decal.active {
                        gfx::Style::Active
                    } else {
                        gfx::Style::Inactive
                    },
                );
                el.x1 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x1;
                el.x2 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x2;
                el.y1 = self.chipdb.bel_data[bel_index].y as f64
                    + consts::logic_cell_y1
                    + self.chipdb.bel_data[bel_index].z as f64 * consts::logic_cell_pitch;
                el.y2 = self.chipdb.bel_data[bel_index].y as f64
                    + consts::logic_cell_y2
                    + self.chipdb.bel_data[bel_index].z as f64 * consts::logic_cell_pitch;
                g.push(el);
            }

            if bel_type == ConstId::SB_IO {
                let mut el = gfx::GraphicElement::new(
                    gfx::Type::Box,
                    if decal.active {
                        gfx::Style::Active
                    } else {
                        gfx::Style::Inactive
                    },
                );
                el.x1 = self.chipdb.bel_data[bel_index].x as f64 + consts::lut_swbox_x1;
                el.x2 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x2;
                el.y1 = self.chipdb.bel_data[bel_index].y as f64
                    + consts::logic_cell_y1
                    + (4 * self.chipdb.bel_data[bel_index].z) as f64 * consts::logic_cell_pitch;
                el.y2 = self.chipdb.bel_data[bel_index].y as f64
                    + consts::logic_cell_y2
                    + (4 * self.chipdb.bel_data[bel_index].z + 3) as f64 * consts::logic_cell_pitch;
                g.push(el);
            }

            if bel_type == ConstId::ICESTORM_RAM {
                for i in 0..2 {
                    let mut el = gfx::GraphicElement::new(
                        gfx::Type::Box,
                        if decal.active {
                            gfx::Style::Active
                        } else {
                            gfx::Style::Inactive
                        },
                    );
                    el.x1 = self.chipdb.bel_data[bel_index].x as f64 + consts::lut_swbox_x1;
                    el.x2 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x2;
                    el.y1 =
                        self.chipdb.bel_data[bel_index].y as f64 + consts::logic_cell_y1 + i as f64;
                    el.y2 = self.chipdb.bel_data[bel_index].y as f64
                        + consts::logic_cell_y2
                        + i as f64
                        + 7.0 * consts::logic_cell_pitch;
                    g.push(el);
                }
            }

            if bel_type == ConstId::SB_GB {
                let mut el = gfx::GraphicElement::new(
                    gfx::Type::Box,
                    if decal.active {
                        gfx::Style::Active
                    } else {
                        gfx::Style::Inactive
                    },
                );
                el.x1 = self.chipdb.bel_data[bel_index].x as f64 + consts::local_swbox_x1 + 0.05;
                el.x2 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x2 - 0.05;
                el.y1 = self.chipdb.bel_data[bel_index].y as f64 + consts::main_swbox_y2 - 0.05;
                el.y2 = self.chipdb.bel_data[bel_index].y as f64 + consts::main_swbox_y2 - 0.10;
                g.push(el);
            }

            if bel_type == ConstId::ICESTORM_PLL || bel_type == ConstId::SB_WARMBOOT {
                let mut el = gfx::GraphicElement::new(
                    gfx::Type::Box,
                    if decal.active {
                        gfx::Style::Active
                    } else {
                        gfx::Style::Inactive
                    },
                );
                el.x1 = self.chipdb.bel_data[bel_index].x as f64 + consts::local_swbox_x1 + 0.05;
                el.x2 = self.chipdb.bel_data[bel_index].x as f64 + consts::logic_cell_x2 - 0.05;
                el.y1 = self.chipdb.bel_data[bel_index].y as f64 + consts::main_swbox_y2;
                el.y2 = self.chipdb.bel_data[bel_index].y as f64 + consts::main_swbox_y2 + 0.05;
                g.push(el);
            }
        }

        g
    }

    fn get_bel_decals(&self) -> Vec<Decal> {
        return self
            .chipdb
            .bel_data
            .iter()
            .enumerate()
            .map(|(i, bel)| {
                Decal::new(
                    DecalID::new(decal::ICE40DecalType::TYPE_BEL, i as i32, false),
                    0.0,
                    0.0,
                    format!("X{}/Y{}/{}", bel.x, bel.y, bel.name),
                )
            })
            .collect();
    }

    fn get_wire_decals(&self) -> Vec<Decal> {
        return self
            .chipdb
            .wire_data
            .iter()
            .enumerate()
            .map(|(i, wire)| {
                Decal::new(
                    DecalID::new(decal::ICE40DecalType::TYPE_WIRE, i as i32, false),
                    0.0,
                    0.0,
                    format!("X{}/Y{}/{}", wire.x, wire.y, wire.name),
                )
            })
            .collect();
    }

    fn get_pip_decals(&self) -> Vec<Decal> {
        return self
            .chipdb
            .pip_data
            .iter()
            .enumerate()
            .map(|(i, pip)| {
                Decal::new(
                    DecalID::new(decal::ICE40DecalType::TYPE_PIP, i as i32, false),
                    0.0,
                    0.0,
                    format!("X{}/Y{}", pip.x, pip.y),
                )
            })
            .collect();
    }

    fn get_group_decals(&self) -> Vec<Decal> {
        let mut groups: Vec<ICE40GroupId> = vec![];

        for y in 0..self.chipdb.height {
            for x in 0..self.chipdb.width {
                let tile_index = (y * self.chipdb.width + x) as usize;
                let tile_type = decal::ICE40TileType::try_from(self.chipdb.tile_grid[tile_index])
                    .unwrap_or(decal::ICE40TileType::TILE_NONE);
                if tile_type == decal::ICE40TileType::TILE_NONE {
                    continue;
                }

                let mut group =
                    ICE40GroupId::new(decal::ICE40GroupType::TYPE_FRAME, x as i8, y as i8);
                groups.push(group.clone());

                group.r#type = decal::ICE40GroupType::TYPE_MAIN_SW;
                groups.push(group.clone());

                group.r#type = decal::ICE40GroupType::TYPE_LOCAL_SW;
                groups.push(group.clone());

                if tile_type == decal::ICE40TileType::TILE_LOGIC {
                    group.r#type = decal::ICE40GroupType::TYPE_LC0_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC1_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC2_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC3_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC4_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC5_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC6_SW;
                    groups.push(group.clone());

                    group.r#type = decal::ICE40GroupType::TYPE_LC7_SW;
                    groups.push(group.clone());
                }
            }
        }

        return groups
            .iter()
            .map(|group| {
                let index = ((group.r#type as i32 & 255) << 16)
                    ^ ((group.x as i32 & 255) << 8)
                    ^ (group.y as i32 & 255);
                Decal::new(
                    DecalID::new(decal::ICE40DecalType::TYPE_GROUP, index, false),
                    0.0,
                    0.0,
                    format!("X{}/Y{}/{}", group.x, group.y, group.name()),
                )
            })
            .collect();
    }

    fn find_pip_decal_by_loc_from_to(
        &self,
        location: &WireLocation,
        from: &Wire,
        to: &Wire,
    ) -> Option<decal::DecalXY<DecalID>> {
        let pips = self
            .chipdb
            .pip_data
            .iter()
            .enumerate()
            .filter(|(_i, pip)| {
                // Pip location
                location.x == pip.x.into() && location.y == pip.y.into()
            })
            .filter(|(_i, pip)| {
                // Pip source wire
                let src_wire = &self.chipdb.wire_data[pip.src as usize];
                from.location.x == src_wire.x.into()
                    && from.location.y == src_wire.y.into()
                    && src_wire.name == from.name
            })
            .filter(|(_i, pip)| {
                // Pip dest wire
                let dst_wire = &self.chipdb.wire_data[pip.dst as usize];
                to.location.x == dst_wire.x.into()
                    && to.location.y == dst_wire.y.into()
                    && dst_wire.name == to.name
            })
            .map(|(i, _)| i)
            .collect::<Vec<_>>();

        let index = *pips.first()? as i32;

        Some(Decal::new(
            DecalID::new(decal::ICE40DecalType::TYPE_PIP, index, true),
            0.0,
            0.0,
            format!(
                "X{}/Y{};X{}/Y{}/{}->X{}/Y{}/{}",
                location.x,
                location.y,
                from.location.x,
                from.location.y,
                from.name,
                to.location.x,
                to.location.y,
                to.name
            ),
        ))
    }
}
