use std::io::Cursor;

use crate::chipdb::reltypes::{
    read_reli32arr, read_relptr, read_relslice, read_relstring, read_relstringarr, read_relu32arr,
    ByteArray, POD,
};

use super::types::{
    BelConfigEntryPOD, BelConfigPOD, BelInfoPOD, BelPortPOD, BelWirePOD, BitstreamInfoPOD,
    CellPathDelayPOD, CellTimingPOD, ChipInfoPOD, ConfigBitPOD, ConfigEntryPOD,
    GlobalNetworkInfoPOD, IerenInfoPOD, PackageInfoPOD, PackagePinPOD, PipInfoPOD, SwitchInfoPOD,
    TileInfoPOD, WireInfoPOD, WireSegmentPOD,
};

use anyhow::Result;
use byteorder::{LittleEndian, ReadBytesExt};

pub fn get_chipdb(chipdata: &[u8]) -> Result<ChipInfoPOD> {
    let mut cur = Cursor::new(chipdata);

    let offset = cur.read_u32::<LittleEndian>()?;
    cur.set_position(offset as u64);

    ChipInfoPOD::new(&mut cur)
}

impl POD for BelWirePOD {
    // Size: 12

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            port: cur.read_i32::<LittleEndian>()?,
            r#type: cur.read_i32::<LittleEndian>()?,
            wire_index: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for BelInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            r#type: cur.read_i32::<LittleEndian>()?,
            bel_wires: read_relslice::<BelWirePOD>(cur)?,
            x: cur.read_i8()?,
            y: cur.read_i8()?,
            z: cur.read_i8()?,
            padding_0: cur.read_i8()?,
        })
    }
}

impl POD for BelPortPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            bel_index: cur.read_i32::<LittleEndian>()?,
            port: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for PipInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            // RelPtr<char> name;
            src: cur.read_i32::<LittleEndian>()?,
            dst: cur.read_i32::<LittleEndian>()?,
            fast_delay: cur.read_i32::<LittleEndian>()?,
            slow_delay: cur.read_i32::<LittleEndian>()?,
            x: cur.read_i8()?,
            y: cur.read_i8()?,
            src_seg: cur.read_i16::<LittleEndian>()?,
            dst_seg: cur.read_i16::<LittleEndian>()?,
            switch_mask: cur.read_i16::<LittleEndian>()?,
            switch_index: cur.read_i32::<LittleEndian>()?,

            // {
            //     FLAG_NONE = 0,
            //     FLAG_ROUTETHRU = 1,
            //     FLAG_NOCARRY = 2
            // };
            pip_flags: cur.read_u32::<LittleEndian>()?,
        })
    }
}

impl POD for WireSegmentPOD {
    // Size: 4

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            x: cur.read_i8()?,
            y: cur.read_i8()?,
            index: cur.read_i16::<LittleEndian>()?,
        })
    }
}

impl POD for WireInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            name_x: cur.read_i8()?,
            name_y: cur.read_i8()?,
            padding: cur.read_i16::<LittleEndian>()?,
            pips_uphill: read_reli32arr(cur)?,
            pips_downhill: read_reli32arr(cur)?,
            bel_pins: read_relslice::<BelPortPOD>(cur)?,
            segments: read_relslice::<WireSegmentPOD>(cur)?,

            fast_delay: cur.read_i32::<LittleEndian>()?,
            slow_delay: cur.read_i32::<LittleEndian>()?,

            x: cur.read_i8()?,
            y: cur.read_i8()?,
            z: cur.read_i8()?,

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
            r#type: cur.read_i8()?,
        })
    }
}

impl POD for PackagePinPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            bel_index: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for PackageInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            pins: read_relslice::<PackagePinPOD>(cur)?,
        })
    }
}

impl POD for ConfigBitPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            row: cur.read_i8()?,
            col: cur.read_i8()?,
        })
    }
}

impl POD for ConfigEntryPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            name: read_relstring(cur)?,
            bits: read_relslice::<ConfigBitPOD>(cur)?,
        })
    }
}

impl POD for TileInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            cols: cur.read_i8()?,
            rows: cur.read_i8()?,
            padding: cur.read_i16::<LittleEndian>()?,
            entries: read_relslice::<ConfigEntryPOD>(cur)?,
        })
    }
}

impl POD for SwitchInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            num_bits: cur.read_i32::<LittleEndian>()?,
            bel: cur.read_i32::<LittleEndian>()?,
            x: cur.read_i8()?,
            y: cur.read_i8()?,
            cbits: [
                // you shall not question my methods
                ConfigBitPOD::new(cur)?,
                ConfigBitPOD::new(cur)?,
                ConfigBitPOD::new(cur)?,
                ConfigBitPOD::new(cur)?,
                ConfigBitPOD::new(cur)?,
            ],
        })
    }
}

impl POD for IerenInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            iox: cur.read_i8()?,
            ioy: cur.read_i8()?,
            ioz: cur.read_i8()?,
            ierx: cur.read_i8()?,
            iery: cur.read_i8()?,
            ierz: cur.read_i8()?,
        })
    }
}

impl POD for BitstreamInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            tiles_nonrouting: read_relslice::<TileInfoPOD>(cur)?,
            switches: read_relslice::<SwitchInfoPOD>(cur)?,
            ierens: read_relslice::<IerenInfoPOD>(cur)?,
        })
    }
}

impl POD for BelConfigEntryPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            entry_name: read_relstring(cur)?,
            cbit_name: read_relstring(cur)?,
            x: cur.read_i8()?,
            y: cur.read_i8()?,
            padding: cur.read_i16::<LittleEndian>()?,
        })
    }
}

// Stores mapping between bel parameters and config bits,
// for extra cells where this mapping is non-trivial
impl POD for BelConfigPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            bel_index: cur.read_i32::<LittleEndian>()?,
            entries: read_relslice::<BelConfigEntryPOD>(cur)?,
        })
    }
}

impl POD for CellPathDelayPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            from_port: cur.read_i32::<LittleEndian>()?,
            to_port: cur.read_i32::<LittleEndian>()?,
            fast_delay: cur.read_i32::<LittleEndian>()?,
            slow_delay: cur.read_i32::<LittleEndian>()?,
        })
    }
}

impl POD for CellTimingPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            r#type: cur.read_i32::<LittleEndian>()?,
            path_delays: read_relslice::<CellPathDelayPOD>(cur)?,
        })
    }
}

impl POD for GlobalNetworkInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            gb_x: cur.read_u8()?,
            gb_y: cur.read_u8()?,

            pi_gb_x: cur.read_u8()?,
            pi_gb_y: cur.read_u8()?,
            pi_gb_pio: cur.read_u8()?,

            pi_eb_bank: cur.read_u8()?,
            pi_eb_x: cur.read_u16::<LittleEndian>()?,
            pi_eb_y: cur.read_u16::<LittleEndian>()?,

            pad: cur.read_u16::<LittleEndian>()?,
        })
    }
}

impl POD for ChipInfoPOD {
    // Size: XX

    fn new(cur: &mut Cursor<ByteArray>) -> Result<Self> {
        Ok(Self {
            width: cur.read_i32::<LittleEndian>()?,
            height: cur.read_i32::<LittleEndian>()?,
            num_switches: cur.read_u32::<LittleEndian>()?,
            bel_data: read_relslice::<BelInfoPOD>(cur)?,
            wire_data: read_relslice::<WireInfoPOD>(cur)?,
            pip_data: read_relslice::<PipInfoPOD>(cur)?,

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
            tile_grid: read_relu32arr(cur)?,

            bits_info: read_relptr::<BitstreamInfoPOD>(cur)?,
            bel_config: read_relslice::<BelConfigPOD>(cur)?,
            packages_data: read_relslice::<PackageInfoPOD>(cur)?,
            cell_timing: read_relslice::<CellTimingPOD>(cur)?,
            global_network_info: read_relslice::<GlobalNetworkInfoPOD>(cur)?,
            tile_wire_names: read_relstringarr(cur)?,
        })
    }
}
