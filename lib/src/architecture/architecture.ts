import {LocationPOD} from '../chipdb/ecp5.chipdb';
import {DecalXY} from '../decal/decal';
import {GraphicElement} from '../gfx/gfx';

export interface Architecture<DecalID> {
    getDecalGraphics(decal: DecalID): Array<GraphicElement>;
    getBelDecals(): Array<DecalXY<DecalID>>;
    getWireDecals(): Array<DecalXY<DecalID>>;
    getPipDecals(): Array<DecalXY<DecalID>>;
    getGroupDecals(): Array<DecalXY<DecalID>>;
    findPipDecalByLocFromTo(
        location: LocationPOD,
        from: {location: LocationPOD; name: string},
        to: {location: LocationPOD; name: string}
    ): DecalXY<DecalID> | null;
}
