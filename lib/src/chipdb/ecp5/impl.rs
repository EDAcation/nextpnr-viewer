use std::io::Cursor;

use crate::chipdb::reltypes::{
    read_reli32arr, read_relslice, read_relstring, read_relstringarr, ByteArray, POD,
};
use crate::gfx::ecp5::{ConstId, GfxTileWireId};

use super::types::{
    BelInfoPOD, BelPortPOD, BelWirePOD, CellPropDelayPOD, CellSetupHoldPOD, CellTimingPOD,
    ChipInfoPOD, GlobalInfoPOD, LocationPOD, LocationTypePOD, MinimizedChipInfoPOD, PIOInfoPOD,
    PackageInfoPOD, PackagePinPOD, PipDelayPOD, PipInfoPOD, PipLocatorPOD, SpeedGradePOD,
    TileInfoPOD, TileNamePOD, WireInfoPOD,
};

use anyhow::{bail, Result};
use bincode::config;
use bincode::config::Configuration;
use byteorder::{BigEndian, LittleEndian, ReadBytesExt};
use miniz_oxide::{deflate, inflate};

const BINCODE_CFG: Configuration = config::standard().with_variable_int_encoding();

pub fn get_full_chipinfo(chipdata: &[u8]) -> Result<ChipInfoPOD> {
    let mut cur = Cursor::new(chipdata);

    let offset = cur.read_u32::<LittleEndian>()?;
    cur.set_position(offset as u64);

    ChipInfoPOD::new(&mut cur)
}

pub fn get_min_chipinfo(chipdata: &[u8]) -> Result<MinimizedChipInfoPOD> {
    let decompressed = match inflate::decompress_to_vec(chipdata) {
        Ok(res) => res,
        Err(_) => bail!("Failed to decompress chipdb"),
    };
    Ok(bincode::serde::decode_from_slice(&decompressed, BINCODE_CFG)?.0)
}

impl MinimizedChipInfoPOD {
    pub fn encode(&self) -> Result<Vec<u8>> {
        let encoded = bincode::serde::encode_to_vec(&self, BINCODE_CFG)?;
        Ok(deflate::compress_to_vec(&encoded, 5))
    }
}

impl POD for LocationPOD {
    // Size: 8

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            x: cur.read_i16::<LittleEndian>()?,
            y: cur.read_i16::<LittleEndian>()?,
        })
    }
}

impl POD for BelWirePOD {
    // Size: 16

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            rel_wire_loc: LocationPOD::new(cur)?,
            wire_index: cur.read_i32::<LittleEndian>()?,
            port: cur.read_i32::<LittleEndian>()?,
            r#type: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for BelInfoPOD {
    // Size: 20

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            r#type: ConstId::try_from(cur.read_u32::<LittleEndian>()?)?,
            z: cur.read_i32::<LittleEndian>()?,
            bel_wires: read_relslice::<BelWirePOD>(cur)?,
        })
    }
}

impl POD for BelPortPOD {
    // Size: 12

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            rel_bel_loc: LocationPOD::new(cur)?,
            bel_index: cur.read_i32::<LittleEndian>()?,
            port: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for PipInfoPOD {
    // Size: 20

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            rel_src_loc: LocationPOD::new(cur)?,
            rel_dst_loc: LocationPOD::new(cur)?,
            src_idx: cur.read_i16::<LittleEndian>()?,
            dst_idx: cur.read_i16::<LittleEndian>()?,
            timing_class: cur.read_i16::<LittleEndian>()?,
            tile_type: cur.read_i8()?,
            pip_type: cur.read_i8()?,
            lutperm_flags: cur.read_i16::<BigEndian>()?,
            padding: cur.read_i16::<BigEndian>()?,
        })
    }
}

impl POD for PipLocatorPOD {
    // Size: 8

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            rel_loc: LocationPOD::new(cur)?,
            index: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for WireInfoPOD {
    // Size: 32

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            r#type: ConstId::try_from(cur.read_i16::<LittleEndian>()? as u32)?,
            tile_wire: GfxTileWireId::try_from(cur.read_i16::<LittleEndian>()? as u32)?,
            pips_uphill: read_relslice::<PipLocatorPOD>(cur)?,
            pips_downhill: read_relslice::<PipLocatorPOD>(cur)?,
            bel_pins: read_relslice::<BelPortPOD>(cur)?,
        })
    }
}

impl POD for LocationTypePOD {
    // Size: 24

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            bel_data: read_relslice::<BelInfoPOD>(cur)?,
            wire_data: read_relslice::<WireInfoPOD>(cur)?,
            pip_data: read_relslice::<PipInfoPOD>(cur)?,
        })
    }
}

impl POD for PIOInfoPOD {
    // size: 16

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            abs_loc: LocationPOD::new(cur)?,
            bel_index: cur.read_i32::<LittleEndian>()?,
            function_name: read_relstring(cur)?,
            bank: cur.read_i16::<LittleEndian>()?,
            dqsgroup: cur.read_i16::<LittleEndian>()?,
        })
    }
}

impl POD for PackagePinPOD {
    // Size: 12

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            abs_loc: LocationPOD::new(cur)?,
            bel_index: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for PackageInfoPOD {
    // Size: 12

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            pin_data: read_relslice::<PackagePinPOD>(cur)?,
        })
    }
}

impl POD for TileNamePOD {
    // Size: 8

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            type_idx: cur.read_i16::<LittleEndian>()?,
            padding: cur.read_i16::<LittleEndian>()?,
        })
    }
}

impl POD for TileInfoPOD {
    // Size: 8

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            tile_names: read_relslice::<TileNamePOD>(cur)?,
        })
    }
}

impl POD for GlobalInfoPOD {
    // Size: 8

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            tap_col: cur.read_i16::<LittleEndian>()?,
            tap_dir: cur.read_i8()?,
            quad: cur.read_i8()?,
            spine_row: cur.read_i16::<LittleEndian>()?,
            spine_col: cur.read_i16::<LittleEndian>()?,
        })
    }
}

impl POD for CellPropDelayPOD {
    // Size: 16

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            from_port: cur.read_i32::<LittleEndian>()?,
            to_port: cur.read_i32::<LittleEndian>()?,
            min_delay: cur.read_i32::<LittleEndian>()?,
            max_delay: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for CellSetupHoldPOD {
    // Size: 24

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            sig_port: cur.read_i32::<LittleEndian>()?,
            clock_port: cur.read_i32::<LittleEndian>()?,
            min_setup: cur.read_i32::<LittleEndian>()?,
            max_setup: cur.read_i32::<LittleEndian>()?,
            min_hold: cur.read_i32::<LittleEndian>()?,
            max_hold: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for CellTimingPOD {
    // Size: 20

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            cell_type: cur.read_i32::<LittleEndian>()?,
            prop_delays: read_relslice::<CellPropDelayPOD>(cur)?,
            setup_holds: read_relslice::<CellSetupHoldPOD>(cur)?,
        })
    }
}

impl POD for PipDelayPOD {
    // Size: 16

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            min_base_delay: cur.read_i32::<LittleEndian>()?,
            max_base_delay: cur.read_i32::<LittleEndian>()?,
            min_fanout_adder: cur.read_i32::<LittleEndian>()?,
            max_fanout_adder: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for SpeedGradePOD {
    // Size: 16

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            cell_timings: read_relslice::<CellTimingPOD>(cur)?,
            pip_classes: read_relslice::<PipDelayPOD>(cur)?,
        })
    }
}

impl POD for ChipInfoPOD {
    // Size: 80

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            width: cur.read_i32::<LittleEndian>()?,
            height: cur.read_i32::<LittleEndian>()?,
            num_tiles: cur.read_i32::<LittleEndian>()?,
            const_id_count: cur.read_i32::<LittleEndian>()?,
            locations: read_relslice::<LocationTypePOD>(cur)?,
            location_type: read_reli32arr(cur)?,
            location_glbinfo: read_relslice::<GlobalInfoPOD>(cur)?,
            tiletype_names: read_relstringarr(cur)?,
            package_info: read_relslice::<PackageInfoPOD>(cur)?,
            pio_info: read_relslice::<PIOInfoPOD>(cur)?,
            tile_info: read_relslice::<TileInfoPOD>(cur)?,
            speed_grades: read_relslice::<SpeedGradePOD>(cur)?,
        })
    }
}
