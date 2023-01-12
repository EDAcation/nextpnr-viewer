import { DecalXY } from '../decal/decal';
import { GraphicElement } from '../gfx/gfx';

export interface Architecture<DecalID> {
    getDecalGraphics(decal: DecalID): Array<GraphicElement>;
    getBelDecals(): Array<DecalXY<DecalID>>;
    getWireDecals(): Array<DecalXY<DecalID>>;
    getPipDecals(): Array<DecalXY<DecalID>>;
    getGroupDecals(): Array<DecalXY<DecalID>>;

    activateBelByName(name: string): void;
    activateWireByName(name: string): void;
}
