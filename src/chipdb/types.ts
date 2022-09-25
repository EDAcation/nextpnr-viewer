import {
    WireDataInterface,
    WireDataTypeEnum,
    BelWiresInterface,
    BelDataInterface,
    ChipDbInterface,
    PipDataInterface,
    PipFlagsEnum,
    TileType
} from './chipdb.interface';

export class ChipDb {
    constructor(
        private _json_object: any,
        private _bel_data: Array<BelData>,
        private _wire_data: Array<WireData>,
        private _pip_data: Array<PipData>,
        private _group_data: Array<GroupId>
    ) {}

    static from_interface(obj: ChipDbInterface): ChipDb {
        const _json_object: any = obj as any;
        return new ChipDb(
            _json_object,
            (_json_object[obj.chip_info_384.bel_data] as Array<BelDataInterface>).map(
                v => BelData.from_interface(_json_object, v)
            ),
            (_json_object[obj.chip_info_384.wire_data] as Array<WireDataInterface>).map(
                v => WireData.from_interface(_json_object, v)
            ),
            (_json_object[obj.chip_info_384.pip_data] as Array<PipDataInterface>).map(
                v => PipData.from_interface(_json_object, v)
            ),
            GroupId.makeGroups(_json_object, obj)
        );
    }

    public get wire_data(): Array<WireData> { return this._wire_data; }
    public get group_data(): Array<GroupId> { return this._group_data; }
    public get bel_data(): Array<BelData> { return this._bel_data; }
    public get pip_data(): Array<PipData> { return this._pip_data; }
    public get width(): number { return this._json_object.dev_width; }
    public get height(): number { return this._json_object.dev_height; }
}

export class BelData {
    constructor(
        private _name: string,
        private _type: number,
        private _bel_wires: Array<BelWiresInterface>,
        private _x: number,
        private _y: number,
        private _z: number,
    ) {}

    static from_interface(obj: any, iface: BelDataInterface): BelData {
        return new BelData(
            iface.name,
            iface.type,
            obj[iface.bel_wires] as Array<BelWiresInterface>,
            iface.x,
            iface.y,
            iface.z
        );
    }

    public get type(): number { return this._type; }
    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }
    public get name(): string { return this._name; }
}

export class WireData {
    constructor(
        private name: string,
        private name_x: number,
        private name_y: number,
        private pips_uphill: Array<any>,
        private pips_downhill: Array<any>,
        private bel_pins: Array<any>,
        private _segments: Array<any>,
        private fast_delay: number,
        private slow_delay: number,
        private x: number,
        private y: number,
        private z: number,
        private type: WireDataTypeEnum
    ) {}

    static from_interface(obj: any, iface: WireDataInterface): WireData {
        return new WireData(
            iface.name,
            iface.name_x,
            iface.name_y,
            iface.pips_uphill === null ? [] : obj[iface.pips_uphill],
            iface.pips_downhill === null ? [] : obj[iface.pips_downhill],
            iface.bel_pins === null ? [] : obj[iface.bel_pins],
            obj[iface.segments],
            iface.fast_delay,
            iface.slow_delay,
            iface.x,
            iface.y,
            iface.z,
            iface.type
        )
    }

    public get segments(): Array<any> { return this._segments; }
}

export class PipData {
    constructor(
        private src: number,
        private dst: number,
        private fast_delay: number,
        private slow_delay: number,
        private x: number,
        private y: number,
        private src_seg: number,
        private dst_seg: number,
        private switch_mask: number,
        private switch_index: number,
        private flags: PipFlagsEnum
    ) {}

    static from_interface(obj: any, iface: PipDataInterface): PipData {
        return new PipData(
            iface.src,
            iface.dst,
            iface.fast_delay,
            iface.slow_delay,
            iface.x,
            iface.y,
            iface.src_seg,
            iface.dst_seg,
            iface.switch_mask,
            iface.switch_index,
            iface.flags
        );
    }
}

export enum GroupIdType {
    TYPE_NONE,
    TYPE_FRAME,
    TYPE_MAIN_SW,
    TYPE_LOCAL_SW,
    TYPE_LC0_SW,
    TYPE_LC1_SW,
    TYPE_LC2_SW,
    TYPE_LC3_SW,
    TYPE_LC4_SW,
    TYPE_LC5_SW,
    TYPE_LC6_SW,
    TYPE_LC7_SW
}

export class GroupId {
    constructor(
        private _type: GroupIdType,
        private _x: number,
        private _y: number
    ) {}

    static makeGroups(obj: any, iface: ChipDbInterface): Array<GroupId> {
        const ret: Array<GroupId> = [];

        for (let y = 0; y < iface.chip_info_384.dev_height; ++y) {
            for (let x = 0; x < iface.chip_info_384.dev_width; ++x) {
                const type: TileType = obj[iface.chip_info_384.tile_grid][y * iface.chip_info_384.dev_width + x].tiletype;

                if (type === TileType.TILE_NONE) continue;

                ret.push(new GroupId(GroupIdType.TYPE_MAIN_SW, x, y));
                ret.push(new GroupId(GroupIdType.TYPE_LOCAL_SW, x, y));

                if (type === TileType.TILE_LOGIC) {
                    ret.push(new GroupId(GroupIdType.TYPE_LC0_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC1_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC2_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC3_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC4_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC5_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC6_SW, x, y));
                    ret.push(new GroupId(GroupIdType.TYPE_LC7_SW, x, y));
                }
            }
        }

        return ret;
    }

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get type(): GroupIdType { return this._type; }
}

// bel_data
// wire_data
// pip_data
// (group_data) https://github.com/YosysHQ/nextpnr/blob/c60fb94b6c45ca74632e972995555170063b3a03/ice40/arch.cc#L564
