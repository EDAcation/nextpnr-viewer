#![allow(dead_code)]

use minimize_derive::Minimize;

pub struct BelWirePOD {
    pub port: i32,
    pub r#type: i32,
    pub wire_index: i32,
}

#[derive(Minimize)]
pub struct BelInfoPOD {
    #[include]
    pub name: String,
    #[include]
    pub r#type: i32,
    pub bel_wires: Vec<BelWirePOD>,
    #[include]
    pub x: i8,
    #[include]
    pub y: i8,
    #[include]
    pub z: i8,
    pub padding_0: i8,
}

pub struct BelPortPOD {
    pub bel_index: i32,
    pub port: i32,
}

#[derive(Minimize)]
pub struct PipInfoPOD {
    // RelPtr<char> name;
    #[include]
    pub src: i32,
    #[include]
    pub dst: i32,
    pub fast_delay: i32,
    pub slow_delay: i32,
    #[include]
    pub x: i8,
    #[include]
    pub y: i8,
    #[include]
    pub src_seg: i16,
    #[include]
    pub dst_seg: i16,
    pub switch_mask: i16,
    pub switch_index: i32,

    // {
    //     FLAG_NONE = 0,
    //     FLAG_ROUTETHRU = 1,
    //     FLAG_NOCARRY = 2
    // };
    pub pip_flags: u32,
}

#[derive(Minimize)]
pub struct WireSegmentPOD {
    #[include]
    pub x: i8,
    #[include]
    pub y: i8,
    #[include]
    pub index: i16,
}

#[derive(Minimize)]
pub struct WireInfoPOD {
    #[include]
    pub name: String,
    pub name_x: i8,
    pub name_y: i8,
    pub padding: i16,
    pub pips_uphill: Vec<i32>,
    pub pips_downhill: Vec<i32>,
    pub bel_pins: Vec<BelPortPOD>,
    #[include_rewrite]
    pub segments: Vec<WireSegmentPOD>,

    pub fast_delay: i32,
    pub slow_delay: i32,

    #[include]
    pub x: i8,
    #[include]
    pub y: i8,
    pub z: i8,

    // {
    //     WIRE_TYPE_NONE = 0,
    //     WIRE_TYPE_GLB2LOCAL = 1,
    //     WIRE_TYPE_GLB_NETWK = 2,
    //     WIRE_TYPE_LOCAL = 3,
    //     WIRE_TYPE_LUTFF_IN = 4,
    //     WIRE_TYPE_LUTFF_IN_LUT = 5,
    //     WIRE_TYPE_LUTFF_LOUT = 6,
    //     WIRE_TYPE_LUTFF_OUT = 7,
    //     WIRE_TYPE_LUTFF_COUT = 8,
    //     WIRE_TYPE_LUTFF_GLOBAL = 9,
    //     WIRE_TYPE_CARRY_IN_MUX = 10,
    //     WIRE_TYPE_SP4_V = 11,
    //     WIRE_TYPE_SP4_H = 12,
    //     WIRE_TYPE_SP12_V = 13,
    //     WIRE_TYPE_SP12_H = 14
    // };
    pub r#type: i8,
}

pub struct PackagePinPOD {
    pub name: String,
    pub bel_index: i32,
}

pub struct PackageInfoPOD {
    pub name: String,
    pub pins: Vec<PackagePinPOD>,
}

pub struct ConfigBitPOD {
    pub row: i8,
    pub col: i8,
}

pub struct ConfigEntryPOD {
    pub name: String,
    pub bits: Vec<ConfigBitPOD>,
}

pub struct TileInfoPOD {
    pub cols: i8,
    pub rows: i8,
    pub padding: i16,
    pub entries: Vec<ConfigEntryPOD>,
}
pub struct SwitchInfoPOD {
    pub num_bits: i32,
    pub bel: i32,
    pub x: i8,
    pub y: i8,
    pub cbits: [ConfigBitPOD; 5],
}

pub struct IerenInfoPOD {
    pub iox: i8,
    pub ioy: i8,
    pub ioz: i8,
    pub ierx: i8,
    pub iery: i8,
    pub ierz: i8,
}

pub struct BitstreamInfoPOD {
    pub tiles_nonrouting: Vec<TileInfoPOD>,
    pub switches: Vec<SwitchInfoPOD>,
    pub ierens: Vec<IerenInfoPOD>,
}

pub struct BelConfigEntryPOD {
    pub entry_name: String,
    pub cbit_name: String,
    pub x: i8,
    pub y: i8,
    pub padding: i16,
}

// Stores mapping between bel parameters and config bits,
// for extra cells where this mapping is non-trivial
pub struct BelConfigPOD {
    pub bel_index: i32,
    pub entries: Vec<BelConfigEntryPOD>,
}

pub struct CellPathDelayPOD {
    pub from_port: i32,
    pub to_port: i32,
    pub fast_delay: i32,
    pub slow_delay: i32,
}

pub struct CellTimingPOD {
    pub r#type: i32,
    pub path_delays: Vec<CellPathDelayPOD>,
}

pub struct GlobalNetworkInfoPOD {
    pub gb_x: u8,
    pub gb_y: u8,

    pub pi_gb_x: u8,
    pub pi_gb_y: u8,
    pub pi_gb_pio: u8,

    pub pi_eb_bank: u8,
    pub pi_eb_x: u16,
    pub pi_eb_y: u16,

    pub pad: u16,
}

#[derive(Minimize)]
pub struct ChipInfoPOD {
    #[include]
    pub width: i32,
    #[include]
    pub height: i32,
    pub num_switches: u32,
    #[include_rewrite]
    pub bel_data: Vec<BelInfoPOD>,
    #[include_rewrite]
    pub wire_data: Vec<WireInfoPOD>,
    #[include_rewrite]
    pub pip_data: Vec<PipInfoPOD>,

    // {
    //     TILE_NONE = 0,
    //     TILE_LOGIC = 1,
    //     TILE_IO = 2,
    //     TILE_RAMB = 3,
    //     TILE_RAMT = 4,
    //     TILE_DSP0 = 5,
    //     TILE_DSP1 = 6,
    //     TILE_DSP2 = 7,
    //     TILE_DSP3 = 8,
    //     TILE_IPCON = 9
    // };
    #[include]
    pub tile_grid: Vec<u32>,

    pub bits_info: BitstreamInfoPOD,
    pub bel_config: Vec<BelConfigPOD>,
    pub packages_data: Vec<PackageInfoPOD>,
    pub cell_timing: Vec<CellTimingPOD>,
    pub global_network_info: Vec<GlobalNetworkInfoPOD>,
    pub tile_wire_names: Vec<String>,
}
