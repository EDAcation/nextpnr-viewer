export enum ECP5DecalType {
    TYPE_NONE,
    TYPE_BEL,
    TYPE_WIRE,
    TYPE_PIP,
    TYPE_GROUP
}

export class ECP5DecalID {
    constructor(
        public type: ECP5DecalType,
        public location: {x: number, y: number},
        public z: number,
    ) {}

    public static instance(): ECP5DecalID {
        return new ECP5DecalID(ECP5DecalType.TYPE_NONE, {x: 0, y: 0}, 0);
    }
}
