/*
NPNR_PACKED_STRUCT(struct BelWirePOD {
    int32_t port;
    int32_t type;
    int32_t wire_index;
});

NPNR_PACKED_STRUCT(struct BelInfoPOD {
    RelPtr<char> name;
    int32_t type;
    RelSlice<BelWirePOD> bel_wires;
    int8_t x, y, z;
    int8_t padding_0;
});

NPNR_PACKED_STRUCT(struct BelPortPOD {
    int32_t bel_index;
    int32_t port;
});

NPNR_PACKED_STRUCT(struct PipInfoPOD {
    enum PipFlags : uint32_t
    {
        FLAG_NONE = 0,
        FLAG_ROUTETHRU = 1,
        FLAG_NOCARRY = 2
    };

    // RelPtr<char> name;
    int32_t src, dst;
    int32_t fast_delay;
    int32_t slow_delay;
    int8_t x, y;
    int16_t src_seg, dst_seg;
    int16_t switch_mask;
    int32_t switch_index;
    PipFlags flags;
});

NPNR_PACKED_STRUCT(struct WireSegmentPOD {
    int8_t x, y;
    int16_t index;
});

NPNR_PACKED_STRUCT(struct WireInfoPOD {
    enum WireType : int8_t
    {
        WIRE_TYPE_NONE = 0,
        WIRE_TYPE_GLB2LOCAL = 1,
        WIRE_TYPE_GLB_NETWK = 2,
        WIRE_TYPE_LOCAL = 3,
        WIRE_TYPE_LUTFF_IN = 4,
        WIRE_TYPE_LUTFF_IN_LUT = 5,
        WIRE_TYPE_LUTFF_LOUT = 6,
        WIRE_TYPE_LUTFF_OUT = 7,
        WIRE_TYPE_LUTFF_COUT = 8,
        WIRE_TYPE_LUTFF_GLOBAL = 9,
        WIRE_TYPE_CARRY_IN_MUX = 10,
        WIRE_TYPE_SP4_V = 11,
        WIRE_TYPE_SP4_H = 12,
        WIRE_TYPE_SP12_V = 13,
        WIRE_TYPE_SP12_H = 14
    };

    RelPtr<char> name;
    int8_t name_x, name_y;
    int16_t padding;
    RelSlice<int32_t> pips_uphill, pips_downhill;

    RelSlice<BelPortPOD> bel_pins;

    RelSlice<WireSegmentPOD> segments;

    int32_t fast_delay;
    int32_t slow_delay;

    int8_t x, y, z;
    WireType type;
});

NPNR_PACKED_STRUCT(struct PackagePinPOD {
    RelPtr<char> name;
    int32_t bel_index;
});

NPNR_PACKED_STRUCT(struct PackageInfoPOD {
    RelPtr<char> name;
    RelSlice<PackagePinPOD> pins;
});

enum TileType : uint32_t
{
    TILE_NONE = 0,
    TILE_LOGIC = 1,
    TILE_IO = 2,
    TILE_RAMB = 3,
    TILE_RAMT = 4,
    TILE_DSP0 = 5,
    TILE_DSP1 = 6,
    TILE_DSP2 = 7,
    TILE_DSP3 = 8,
    TILE_IPCON = 9
};

NPNR_PACKED_STRUCT(struct ConfigBitPOD { int8_t row, col; });

NPNR_PACKED_STRUCT(struct ConfigEntryPOD {
    RelPtr<char> name;
    RelSlice<ConfigBitPOD> bits;
});

NPNR_PACKED_STRUCT(struct TileInfoPOD {
    int8_t cols, rows;
    int16_t padding;
    RelSlice<ConfigEntryPOD> entries;
});

static const int max_switch_bits = 5;

NPNR_PACKED_STRUCT(struct SwitchInfoPOD {
    int32_t num_bits;
    int32_t bel;
    int8_t x, y;
    ConfigBitPOD cbits[max_switch_bits];
});

NPNR_PACKED_STRUCT(struct IerenInfoPOD {
    int8_t iox, ioy, ioz;
    int8_t ierx, iery, ierz;
});

NPNR_PACKED_STRUCT(struct BitstreamInfoPOD {
    RelSlice<TileInfoPOD> tiles_nonrouting;
    RelSlice<SwitchInfoPOD> switches;
    RelSlice<IerenInfoPOD> ierens;
});

NPNR_PACKED_STRUCT(struct BelConfigEntryPOD {
    RelPtr<char> entry_name;
    RelPtr<char> cbit_name;
    int8_t x, y;
    int16_t padding;
});

// Stores mapping between bel parameters and config bits,
// for extra cells where this mapping is non-trivial
NPNR_PACKED_STRUCT(struct BelConfigPOD {
    int32_t bel_index;
    RelSlice<BelConfigEntryPOD> entries;
});

NPNR_PACKED_STRUCT(struct CellPathDelayPOD {
    int32_t from_port;
    int32_t to_port;
    int32_t fast_delay;
    int32_t slow_delay;
});

NPNR_PACKED_STRUCT(struct CellTimingPOD {
    int32_t type;
    RelSlice<CellPathDelayPOD> path_delays;
});

NPNR_PACKED_STRUCT(struct GlobalNetworkInfoPOD {
    uint8_t gb_x;
    uint8_t gb_y;

    uint8_t pi_gb_x;
    uint8_t pi_gb_y;
    uint8_t pi_gb_pio;

    uint8_t pi_eb_bank;
    uint16_t pi_eb_x;
    uint16_t pi_eb_y;

    uint16_t pad;
});

NPNR_PACKED_STRUCT(struct ChipInfoPOD {
    int32_t width, height;
    uint32_t num_switches;
    RelSlice<BelInfoPOD> bel_data;
    RelSlice<WireInfoPOD> wire_data;
    RelSlice<PipInfoPOD> pip_data;
    RelSlice<TileType> tile_grid;
    RelPtr<BitstreamInfoPOD> bits_info;
    RelSlice<BelConfigPOD> bel_config;
    RelSlice<PackageInfoPOD> packages_data;
    RelSlice<CellTimingPOD> cell_timing;
    RelSlice<GlobalNetworkInfoPOD> global_network_info;
    RelSlice<RelPtr<char>> tile_wire_names;
});
*/
import { RelSlice, RelString } from '../chipdb-new/relslice';

interface ChipInfoPOD {
    get width(): number;
    get height(): number;
    get num_switches(): number;
    get bel_data(): Array<BelInfoPOD>;
}

interface BelInfoPOD {
    get name(): string;
    get type(): number;
    get x(): number;
    get y(): number;
    get z(): number;
}

class BelInfoPODImpl implements BelInfoPOD {
    public static readonly PODSize = 20;

    constructor(private _dataview: DataView) {
    }

    public get name(): string {
        return RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
    }

    public get type(): number {
        return this._dataview.getInt32(4, true);
    }

    public get x(): number {
        return this._dataview.getInt8(16);
    }

    public get y(): number {
        return this._dataview.getInt8(17);
    }

    public get z(): number {
        return this._dataview.getInt8(18);
    }
}

export class ChipInfoPODImpl implements ChipInfoPOD {
    constructor(private _dataview: DataView) {
    }

    public get width(): number {
        return this._dataview.getInt32(0, true);
    }

    public get height(): number {
        return this._dataview.getInt32(4, true);
    }

    public get num_switches(): number {
        return this._dataview.getUint32(8, true);
    }

    public get bel_data(): Array<BelInfoPOD> {
        const rs = new RelSlice<BelInfoPOD>(BelInfoPODImpl);

        return rs.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 12));
    }
}
