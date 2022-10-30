import { ChipInfoPOD } from '../chipdb-new/ecp5.chipdb';
import { Architecture } from './architecture';
import { ECP5DecalID, ECP5DecalType } from '../decal-new/ecp5.decalid';
import { DecalXY } from '../decal-new/decal';
import { GFX } from '../gfx/ecp5.gfx';
import { GfxTileWireId } from '../gfx/tilewire.ecp5.gfx';
import { GraphicElement } from '../gfx/gfx';
import { Style } from '../gfx/styles';

export class ECP5Arch implements Architecture<ECP5DecalID> {
    constructor(
        private _chipdb: ChipInfoPOD
    ) {}

    public getDecalGraphics(decal: ECP5DecalID): Array<GraphicElement> {
        if (decal.type === ECP5DecalType.TYPE_BEL) {
            const tile = decal.location.y * this._chipdb.width + decal.location.x;
            const loc_info = this._chipdb.locations[this._chipdb.location_type[tile]];
            if (loc_info === undefined) return [];

            const x = decal.location.x;
            const y = decal.location.y;
            const z = loc_info.bel_data[decal.z].z;
            const width = this._chipdb.width;
            const height = this._chipdb.height;
            const type = loc_info.bel_data[decal.z].type;
            const style = decal.active ? Style.Active : Style.Inactive;

            return GFX.tileBel(x,y,z,width,height,type,style);
        } else if (decal.type === ECP5DecalType.TYPE_WIRE) {
            const tile = decal.location.y * this._chipdb.width + decal.location.x;
            const loc_info = this._chipdb.locations[this._chipdb.location_type[tile]];
            if (loc_info === undefined) return [];

            const x = decal.location.x;
            const y = decal.location.y;
            const width = this._chipdb.width;
            const height = this._chipdb.height;
            const wiretype = loc_info.wire_data[decal.z].type;
            const tilewire: GfxTileWireId = loc_info.wire_data[decal.z].tile_wire;
            const style = decal.active ? Style.Active : Style.Inactive;
            return GFX.tileWire(x,y,width,height,wiretype,tilewire,style);
        }

        return [];
    }

    public getBelDecals(): Array<DecalXY<ECP5DecalID>> {
        let cursor_index = 0;
        let cursor_tile = 0;

        const ret: Array<DecalXY<ECP5DecalID>> = [];

        while (cursor_tile != this._chipdb.width * this._chipdb.height) {
            while (cursor_tile < this._chipdb.num_tiles &&
                   cursor_index >= this._chipdb.locations[this._chipdb.location_type[cursor_tile]].bel_data.length) {
                cursor_index = 0;
                cursor_tile++;
            }

            ret.push(new DecalXY<ECP5DecalID>(
                new ECP5DecalID(
                    ECP5DecalType.TYPE_BEL,
                    {x: cursor_tile % this._chipdb.width, y: Math.floor(cursor_tile / this._chipdb.width)},
                    cursor_index,
                    false
                ),
                0,
                0
            ));
            cursor_index++;
        }
        return ret;
    }

    public getWireDecals(): Array<DecalXY<ECP5DecalID>> {
        let cursor_index = 0;
        let cursor_tile = 0;

        const ret: Array<DecalXY<ECP5DecalID>> = [];

        while (cursor_tile != this._chipdb.width * this._chipdb.height) {
            while (cursor_tile < this._chipdb.num_tiles &&
                   cursor_index >= this._chipdb.locations[this._chipdb.location_type[cursor_tile]].wire_data.length) {
                cursor_index = 0;
                cursor_tile++;
            }

            ret.push(new DecalXY<ECP5DecalID>(
                new ECP5DecalID(
                    ECP5DecalType.TYPE_WIRE,
                    {x: cursor_tile % this._chipdb.width, y: Math.floor(cursor_tile / this._chipdb.width)},
                    cursor_index,
                    false
                ),
                0,
                0
            ));
            cursor_index++;
        }
        return ret;
    }

    public getPipDecals(): Array<DecalXY<ECP5DecalID>> {
        return [];
    }

    public getGroupDecals(): Array<DecalXY<ECP5DecalID>> {
        return [];
    }

}
