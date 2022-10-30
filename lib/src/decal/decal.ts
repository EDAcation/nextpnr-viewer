import { WireData, GroupId, PipData, BelData } from '../chipdb/types';

export enum DecalType {
    TYPE_NONE,
    TYPE_BEL,
    TYPE_WIRE,
    TYPE_PIP,
    TYPE_GROUP
}

class DecalId {
    constructor(
        private _type: DecalType,
        private _obj: WireData | GroupId | PipData | BelData,
        private _active: boolean
    ) {}

    public get type(): DecalType { return this._type; }
    public get obj(): WireData | GroupId | PipData | BelData { return this._obj; }
    public get active(): boolean { return this._active; }
}

export class DecalXY {
    constructor(
        private _decal: DecalId,
        public x: number,
        public y: number
    ) {}

    static from_wire(wire: WireData): DecalXY {
        return new DecalXY(
            new DecalId(DecalType.TYPE_WIRE, wire, false),
            0, 0
        );
    }

    static from_group(group: GroupId): DecalXY {
        return new DecalXY(
            new DecalId(DecalType.TYPE_GROUP, group, true),
            0, 0
        );
    }

    static from_pip(pip: PipData): DecalXY {
        return new DecalXY(
            new DecalId(DecalType.TYPE_PIP, pip, false),
            0, 0
        );
    }

    static from_bel(bel: BelData): DecalXY {
        return new DecalXY(
            new DecalId(DecalType.TYPE_BEL, bel, false),
            0, 0
        );
    }

    public get decal(): DecalId { return this._decal; }
}
