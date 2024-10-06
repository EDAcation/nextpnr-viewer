import {
    BelInfoPOD,
    BelPortPOD,
    BelWirePOD,
    CellPropDelayPOD,
    CellSetupHoldPOD,
    CellTimingPOD,
    ChipInfoPOD,
    GlobalInfoPOD,
    LocationPOD,
    LocationTypePOD,
    PIOInfoPOD,
    PackageInfoPOD,
    PackagePinPOD,
    PipDelayPOD,
    PipInfoPOD,
    PipLocatorPOD,
    SpeedGradePOD,
    TileInfoPOD,
    TileNamePOD,
    WireInfoPOD
} from './ecp5.chipdb';
import {RelInt32Arr, RelSlice, RelString, RelStringArr} from './relslice';

export class LocationPODImpl implements LocationPOD {
    private _x: number;
    private _y: number;

    constructor(private _dataview: DataView) {
        this._x = this._dataview.getInt16(0, true);
        this._y = this._dataview.getInt16(2, true);
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }
}

export class BelWirePODImpl implements BelWirePOD {
    public static readonly PODSize = 16;

    private _rel_wire_loc: LocationPOD;
    private _wire_index: number;
    private _port: number;
    private _type: number;

    constructor(private _dataview: DataView) {
        this._rel_wire_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._wire_index = this._dataview.getInt32(4, true);
        this._port = this._dataview.getInt32(8, true);
        this._type = this._dataview.getInt32(12, true);
    }

    public get rel_wire_loc(): LocationPOD {
        return this._rel_wire_loc;
    }

    public get wire_index(): number {
        return this._wire_index;
    }

    public get port(): number {
        return this._port;
    }

    public get type(): number {
        return this._type;
    }
}

export class BelInfoPODImpl implements BelInfoPOD {
    public static readonly PODSize = 20;

    private _name: string;
    private _type: number;
    private _z: number;
    private _bel_wires: Array<BelWirePOD>;

    constructor(private _dataview: DataView) {
        this._name = RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._type = this._dataview.getInt32(4, true);
        this._z = this._dataview.getInt32(8, true);
        const rs = new RelSlice<BelWirePOD>(BelWirePODImpl);
        this._bel_wires = rs.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 12));
    }

    public get name(): string {
        return this._name;
    }

    public get type(): number {
        return this._type;
    }

    public get z(): number {
        return this._z;
    }

    public get bel_wires(): Array<BelWirePOD> {
        return this._bel_wires;
    }
}

export class BelPortPODImpl implements BelPortPOD {
    public static readonly PODSize = 12;

    private _rel_bel_loc: LocationPOD;
    private _bel_index: number;
    private _port: number;

    constructor(private _dataview: DataView) {
        this._rel_bel_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._bel_index = this._dataview.getInt32(4, true);
        this._port = this._dataview.getInt32(8, true);
    }

    public get rel_bel_loc(): LocationPOD {
        return this._rel_bel_loc;
    }

    public get bel_index(): number {
        return this._bel_index;
    }

    public get port(): number {
        return this._port;
    }
}

export class PipInfoPODImpl implements PipInfoPOD {
    public static readonly PODSize = 20;

    private _rel_src_loc: LocationPOD;
    private _rel_dst_loc: LocationPOD;
    private _src_idx: number;
    private _dst_idx: number;
    private _timing_class: number;
    private _tile_type: number;
    private _pip_type: number;
    private _lutperm_flags: number;
    private _padding: number;

    constructor(private _dataview: DataView) {
        this._rel_src_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._rel_dst_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 4));
        this._src_idx = this._dataview.getInt16(8, true);
        this._dst_idx = this._dataview.getInt16(10, true);
        this._timing_class = this._dataview.getInt16(12, true);
        this._tile_type = this._dataview.getInt8(14);
        this._pip_type = this._dataview.getInt8(15);
        this._lutperm_flags = this._dataview.getInt16(16);
        this._padding = this._dataview.getInt16(18);
    }

    public get rel_src_loc(): LocationPOD {
        return this._rel_src_loc;
    }

    public get rel_dst_loc(): LocationPOD {
        return this._rel_dst_loc;
    }

    public get src_idx(): number {
        return this._src_idx;
    }

    public get dst_idx(): number {
        return this._dst_idx;
    }

    public get timing_class(): number {
        return this._timing_class;
    }

    public get tile_type(): number {
        return this._tile_type;
    }

    public get pip_type(): number {
        return this._pip_type;
    }

    public get lutperm_flags(): number {
        return this._lutperm_flags;
    }

    public get padding(): number {
        return this._padding;
    }
}

export class PipLocatorPODImpl implements PipLocatorPOD {
    public static readonly PODSize = 8;

    private _rel_loc: LocationPOD;
    private _index: number;

    constructor(private _dataview: DataView) {
        this._rel_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._index = this._dataview.getInt32(4, true);
    }

    public get rel_loc(): LocationPOD {
        return this._rel_loc;
    }

    public get index(): number {
        return this._index;
    }
}

export class WireInfoPODImpl implements WireInfoPOD {
    public static readonly PODSize = 32;

    private _name: string;
    private _type: number;
    private _tile_wire: number;
    private _pips_uphill?: Array<PipLocatorPOD> = undefined;
    private _pips_downhill?: Array<PipLocatorPOD> = undefined;
    private _bel_pins: Array<BelPortPOD>;

    constructor(private _dataview: DataView) {
        this._name = RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._type = this._dataview.getInt16(4, true);
        this._tile_wire = this._dataview.getInt16(6, true);

        /*
         * These are lazily evaluated in the getter for performance reasons
         *
        const rsPip = new RelSlice<PipLocatorPOD>(PipLocatorPODImpl);

        this._pips_uphill = rsPip.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 8));
        this._pips_downhill = rsPip.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 16));
        */

        const rsBel = new RelSlice<BelPortPOD>(BelPortPODImpl);

        this._bel_pins = rsBel.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 24));
    }

    public get name(): string {
        return this._name;
    }

    public get type(): number {
        return this._type;
    }

    public get tile_wire(): number {
        return this._tile_wire;
    }

    public get pips_uphill(): Array<PipLocatorPOD> {
        if (this._pips_uphill == undefined) {
            const rsPip = new RelSlice<PipLocatorPOD>(PipLocatorPODImpl);

            this._pips_uphill = rsPip.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 8));
        }
        return this._pips_uphill;
    }

    public get pips_downhill(): Array<PipLocatorPOD> {
        if (this._pips_downhill == undefined) {
            const rsPip = new RelSlice<PipLocatorPOD>(PipLocatorPODImpl);

            this._pips_downhill = rsPip.fromDataView(
                new DataView(this._dataview.buffer, this._dataview.byteOffset + 16)
            );
        }
        return this._pips_downhill;
    }

    public get bel_pins(): Array<BelPortPOD> {
        return this._bel_pins;
    }
}

export class LocationTypePODImpl implements LocationTypePOD {
    public static readonly PODSize = 24;

    private _bel_data: Array<BelInfoPOD>;
    private _wire_data: Array<WireInfoPOD>;
    private _pip_data: Array<PipInfoPOD>;

    constructor(private _dataview: DataView) {
        const rsBel = new RelSlice<BelInfoPOD>(BelInfoPODImpl);

        this._bel_data = rsBel.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));

        const rsWire = new RelSlice<WireInfoPOD>(WireInfoPODImpl);

        this._wire_data = rsWire.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 8));

        const rsPip = new RelSlice<PipInfoPOD>(PipInfoPODImpl);

        this._pip_data = rsPip.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 16));
    }

    public get bel_data(): Array<BelInfoPOD> {
        return this._bel_data;
    }

    public get wire_data(): Array<WireInfoPOD> {
        return this._wire_data;
    }

    public get pip_data(): Array<PipInfoPOD> {
        return this._pip_data;
    }
}

export class PIOInfoPODImpl implements PIOInfoPOD {
    public static readonly PODSize = 16;

    private _abs_loc: LocationPOD;
    private _bel_index: number;
    private _function_name: string;
    private _bank: number;
    private _dqsgroup: number;

    constructor(private _dataview: DataView) {
        this._abs_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._bel_index = this._dataview.getInt32(4, true);
        this._function_name = RelString.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 8)
        );
        this._bank = this._dataview.getInt16(12, true);
        this._dqsgroup = this._dataview.getInt16(14, true);
    }

    public get abs_loc(): LocationPOD {
        return this._abs_loc;
    }

    public get bel_index(): number {
        return this._bel_index;
    }

    public get function_name(): string {
        return this._function_name;
    }

    public get bank(): number {
        return this._bank;
    }

    public get dqsgroup(): number {
        return this._dqsgroup;
    }
}

export class PackagePinPODImpl implements PackagePinPOD {
    public static readonly PODSize = 12;

    private _name: string;
    private _abs_loc: LocationPOD;
    private _bel_index: number;

    constructor(private _dataview: DataView) {
        this._name = RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._abs_loc = new LocationPODImpl(new DataView(this._dataview.buffer, this._dataview.byteOffset + 4));
        this._bel_index = this._dataview.getInt32(8, true);
    }

    public get name(): string {
        return this._name;
    }

    public get abs_loc(): LocationPOD {
        return this._abs_loc;
    }

    public get bel_index(): number {
        return this._bel_index;
    }
}

export class PackageInfoPODImpl implements PackageInfoPOD {
    public static readonly PODSize = 12;

    private _name: string;
    private _pin_data: Array<PackagePinPOD>;

    constructor(private _dataview: DataView) {
        this._name = RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));

        const rs = new RelSlice<PackagePinPOD>(PackagePinPODImpl);
        this._pin_data = rs.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 4));
    }

    public get name(): string {
        return this._name;
    }

    public get pin_data(): Array<PackagePinPOD> {
        return this._pin_data;
    }
}

export class TileNamePODImpl implements TileNamePOD {
    public static readonly PODSize = 8;

    private _name: string;
    private _type_idx: number;
    private _padding: number;

    constructor(private _dataview: DataView) {
        this._name = RelString.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
        this._type_idx = this._dataview.getInt16(4, true);
        this._padding = this._dataview.getInt16(6, true);
    }

    public get name(): string {
        return this._name;
    }

    public get type_idx(): number {
        return this._type_idx;
    }

    public get padding(): number {
        return this._padding;
    }
}

export class TileInfoPODImpl implements TileInfoPOD {
    public static readonly PODSize = 8;

    private _tile_names: Array<TileNamePOD>;

    constructor(private _dataview: DataView) {
        const rs = new RelSlice<TileNamePOD>(TileNamePODImpl);
        this._tile_names = rs.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 0));
    }

    public get tile_names(): Array<TileNamePOD> {
        return this._tile_names;
    }
}

export class GlobalInfoPODImpl implements GlobalInfoPOD {
    public static readonly PODSize = 8;

    private _tap_col: number;
    private _tap_dir: number;
    private _quad: number;
    private _spine_row: number;
    private _spine_col: number;

    constructor(private _dataview: DataView) {
        this._tap_col = this._dataview.getInt16(0, true);
        this._tap_dir = this._dataview.getInt8(2);
        this._quad = this._dataview.getInt8(3);
        this._spine_row = this._dataview.getInt16(4, true);
        this._spine_col = this._dataview.getInt16(6, true);
    }

    public get tap_col(): number {
        return this._tap_col;
    }

    public get tap_dir(): number {
        return this._tap_dir;
    }

    public get quad(): number {
        return this._quad;
    }

    public get spine_row(): number {
        return this._spine_row;
    }

    public get spine_col(): number {
        return this._spine_col;
    }
}

export class CellPropDelayPODImpl implements CellPropDelayPOD {
    public static readonly PODSize = 16;

    private _from_port: number;
    private _to_port: number;
    private _min_delay: number;
    private _max_delay: number;

    constructor(private _dataview: DataView) {
        this._from_port = this._dataview.getInt32(0, true);
        this._to_port = this._dataview.getInt32(4, true);
        this._min_delay = this._dataview.getInt32(8, true);
        this._max_delay = this._dataview.getInt32(12, true);
    }

    public get from_port(): number {
        return this._from_port;
    }

    public get to_port(): number {
        return this._to_port;
    }

    public get min_delay(): number {
        return this._min_delay;
    }

    public get max_delay(): number {
        return this._max_delay;
    }
}

export class CellSetupHoldPODImpl implements CellSetupHoldPOD {
    public static readonly PODSize = 24;

    private _sig_port: number;
    private _clock_port: number;
    private _min_setup: number;
    private _max_setup: number;
    private _min_hold: number;
    private _max_hold: number;

    constructor(private _dataview: DataView) {
        this._sig_port = this._dataview.getInt32(0, true);
        this._clock_port = this._dataview.getInt32(4, true);
        this._min_setup = this._dataview.getInt32(8, true);
        this._max_setup = this._dataview.getInt32(12, true);
        this._min_hold = this._dataview.getInt32(16, true);
        this._max_hold = this._dataview.getInt32(20, true);
    }

    public get sig_port(): number {
        return this._sig_port;
    }

    public get clock_port(): number {
        return this._clock_port;
    }

    public get min_setup(): number {
        return this._min_setup;
    }

    public get max_setup(): number {
        return this._max_setup;
    }

    public get min_hold(): number {
        return this._min_hold;
    }

    public get max_hold(): number {
        return this._max_hold;
    }
}

export class CellTimingPODImpl implements CellTimingPOD {
    public static readonly PODSize = 20;

    private _cell_type: number;
    private _prop_delays: Array<CellPropDelayPOD>;
    private _setup_holds: Array<CellSetupHoldPOD>;

    constructor(private _dataview: DataView) {
        this._cell_type = this._dataview.getInt32(0, true);

        const rsPropDelay = new RelSlice<CellPropDelayPOD>(CellPropDelayPODImpl);
        this._prop_delays = rsPropDelay.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 4)
        );

        const rsSetupHold = new RelSlice<CellSetupHoldPOD>(CellSetupHoldPODImpl);
        this._setup_holds = rsSetupHold.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 12)
        );
    }

    public get cell_type(): number {
        return this._cell_type;
    }

    public get prop_delays(): Array<CellPropDelayPOD> {
        return this._prop_delays;
    }

    public get setup_holds(): Array<CellSetupHoldPOD> {
        return this._setup_holds;
    }
}

export class PipDelayPODImpl implements PipDelayPOD {
    public static readonly PODSize = 16;

    private _min_base_delay: number;
    private _max_base_delay: number;
    private _min_fanout_adder: number;
    private _max_fanout_adder: number;

    constructor(private _dataview: DataView) {
        this._min_base_delay = this._dataview.getInt32(0, true);
        this._max_base_delay = this._dataview.getInt32(4, true);
        this._min_fanout_adder = this._dataview.getInt32(8, true);
        this._max_fanout_adder = this._dataview.getInt32(12, true);
    }

    public get min_base_delay(): number {
        return this._min_base_delay;
    }

    public get max_base_delay(): number {
        return this._max_base_delay;
    }

    public get min_fanout_adder(): number {
        return this._min_fanout_adder;
    }

    public get max_fanout_adder(): number {
        return this._max_fanout_adder;
    }
}

export class SpeedGradePODImpl implements SpeedGradePOD {
    public static readonly PODSize = 16;

    private _cell_timings: Array<CellTimingPOD>;
    private _pip_classes: Array<PipDelayPOD>;

    constructor(private _dataview: DataView) {
        const rsCellTiming = new RelSlice<CellTimingPOD>(CellTimingPODImpl);
        this._cell_timings = rsCellTiming.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 0)
        );

        const rsPipClass = new RelSlice<PipDelayPOD>(PipDelayPODImpl);
        this._pip_classes = rsPipClass.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 8));
    }

    public get cell_timings(): Array<CellTimingPOD> {
        return this._cell_timings;
    }

    public get pip_classes(): Array<PipDelayPOD> {
        return this._pip_classes;
    }
}

export class ChipInfoPODImpl implements ChipInfoPOD {
    private _width: number;
    private _height: number;
    private _num_tiles: number;
    private _const_id_count: number;
    private _locations: Array<LocationTypePOD>;
    private _location_type: Array<number>;
    private _location_glbinfo: Array<GlobalInfoPOD>;
    private _tiletype_names: Array<string>;
    private _package_info: Array<PackageInfoPOD>;
    private _pio_info: Array<PIOInfoPOD>;
    private _tile_info: Array<TileInfoPOD>;
    private _speed_grades: Array<SpeedGradePOD>;

    constructor(private _dataview: DataView) {
        this._width = this._dataview.getInt32(0, true);
        this._height = this._dataview.getInt32(4, true);
        this._num_tiles = this._dataview.getInt32(8, true);
        this._const_id_count = this._dataview.getInt32(12, true);

        const rsLocType = new RelSlice<LocationTypePOD>(LocationTypePODImpl);
        this._locations = rsLocType.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 16));

        this._location_type = RelInt32Arr.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 24)
        );

        const rsGlobalInfo = new RelSlice<GlobalInfoPOD>(GlobalInfoPODImpl);
        this._location_glbinfo = rsGlobalInfo.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 32)
        );

        this._tiletype_names = RelStringArr.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 40)
        );

        const rsPackageInfo = new RelSlice<PackageInfoPOD>(PackageInfoPODImpl);
        this._package_info = rsPackageInfo.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 48)
        );

        const rsPIOInfo = new RelSlice<PIOInfoPOD>(PIOInfoPODImpl);
        this._pio_info = rsPIOInfo.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 56));

        const rsTileInfo = new RelSlice<TileInfoPOD>(TileInfoPODImpl);
        this._tile_info = rsTileInfo.fromDataView(new DataView(this._dataview.buffer, this._dataview.byteOffset + 64));

        const rsSpeedGrade = new RelSlice<SpeedGradePOD>(SpeedGradePODImpl);
        this._speed_grades = rsSpeedGrade.fromDataView(
            new DataView(this._dataview.buffer, this._dataview.byteOffset + 72)
        );
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public get num_tiles(): number {
        return this._num_tiles;
    }

    public get const_id_count(): number {
        return this._const_id_count;
    }

    public get locations(): Array<LocationTypePOD> {
        return this._locations;
    }

    public get location_type(): Array<number> {
        return this._location_type;
    }

    public get location_glbinfo(): Array<GlobalInfoPOD> {
        return this._location_glbinfo;
    }

    public get tiletype_names(): Array<string> {
        return this._tiletype_names;
    }

    public get package_info(): Array<PackageInfoPOD> {
        return this._package_info;
    }

    public get pio_info(): Array<PIOInfoPOD> {
        return this._pio_info;
    }

    public get tile_info(): Array<TileInfoPOD> {
        return this._tile_info;
    }

    public get speed_grades(): Array<SpeedGradePOD> {
        return this._speed_grades;
    }
}
