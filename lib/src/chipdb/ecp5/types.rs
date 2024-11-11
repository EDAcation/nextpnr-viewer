use crate::gfx;

pub struct LocationPOD {
    pub x: i16,
    pub y: i16,
}

pub struct BelWirePOD {
    pub rel_wire_loc: LocationPOD,
    pub wire_index: i32,
    pub port: i32,
    pub r#type: i32,
}

pub struct BelInfoPOD {
    pub name: String,
    pub r#type: gfx::ConstId,
    pub z: i32,
    pub bel_wires: Vec<BelWirePOD>,
}

pub struct BelPortPOD {
    pub rel_bel_loc: LocationPOD,
    pub bel_index: i32,
    pub port: i32,
}

pub struct PipInfoPOD {
    pub rel_src_loc: LocationPOD,
    pub rel_dst_loc: LocationPOD,
    pub src_idx: i16,
    pub dst_idx: i16,
    pub timing_class: i16,
    pub tile_type: i8,
    pub pip_type: i8,
    pub lutperm_flags: i16,
    pub padding: i16,
}

pub struct PipLocatorPOD {
    pub rel_loc: LocationPOD,
    pub index: i32,
}

pub struct WireInfoPOD {
    pub name: String,
    pub r#type: gfx::ConstId,
    pub tile_wire: gfx::ecp5::GfxTileWireId,
    pub pips_uphill: Vec<PipLocatorPOD>,
    pub pips_downhill: Vec<PipLocatorPOD>,
    pub bel_pins: Vec<BelPortPOD>,
}

pub struct LocationTypePOD {
    pub bel_data: Vec<BelInfoPOD>,
    pub wire_data: Vec<WireInfoPOD>,
    pub pip_data: Vec<PipInfoPOD>,
}

pub struct PIOInfoPOD {
    pub abs_loc: LocationPOD,
    pub bel_index: i32,
    pub function_name: String,
    pub bank: i16,
    pub dqsgroup: i16,
}

pub struct PackagePinPOD {
    pub name: String,
    pub abs_loc: LocationPOD,
    pub bel_index: i32,
}

pub struct PackageInfoPOD {
    pub name: String,
    pub pin_data: Vec<PackagePinPOD>,
}

pub struct TileNamePOD {
    pub name: String,
    pub type_idx: i16,
    pub padding: i16,
}

pub struct TileInfoPOD {
    pub tile_names: Vec<TileNamePOD>,
}

pub struct GlobalInfoPOD {
    pub tap_col: i16,
    pub tap_dir: i8,
    pub quad: i8,
    pub spine_row: i16,
    pub spine_col: i16,
}

pub struct CellPropDelayPOD {
    pub from_port: i32,
    pub to_port: i32,
    pub min_delay: i32,
    pub max_delay: i32,
}

pub struct CellSetupHoldPOD {
    pub sig_port: i32,
    pub clock_port: i32,
    pub min_setup: i32,
    pub max_setup: i32,
    pub min_hold: i32,
    pub max_hold: i32,
}

pub struct CellTimingPOD {
    pub cell_type: i32,
    pub prop_delays: Vec<CellPropDelayPOD>,
    pub setup_holds: Vec<CellSetupHoldPOD>,
}

pub struct PipDelayPOD {
    pub min_base_delay: i32,
    pub max_base_delay: i32,
    pub min_fanout_adder: i32,
    pub max_fanout_adder: i32,
}

pub struct SpeedGradePOD {
    pub cell_timings: Vec<CellTimingPOD>,
    pub pip_classes: Vec<PipDelayPOD>,
}

pub struct ChipInfoPOD {
    pub width: i32,
    pub height: i32,
    pub num_tiles: i32,
    pub const_id_count: i32,
    pub locations: Vec<LocationTypePOD>,
    pub location_type: Vec<i32>,
    pub location_glbinfo: Vec<GlobalInfoPOD>,
    pub tiletype_names: Vec<String>,
    pub package_info: Vec<PackageInfoPOD>,
    pub pio_info: Vec<PIOInfoPOD>,
    pub tile_info: Vec<TileInfoPOD>,
    pub speed_grades: Vec<SpeedGradePOD>,
}
