import { ChipInfoPOD } from '../chipdb/ecp5.chipdb';
import { Architecture } from './architecture';
import { ECP5DecalID, ECP5DecalType } from '../decal/ecp5.decalid';
import { DecalXY } from '../decal/decal';
import { GFX } from '../gfx/ecp5.gfx';
import { GfxTileWireId } from '../gfx/tilewire.ecp5.gfx';
import { GraphicElement } from '../gfx/gfx';
import { Style } from '../gfx/styles';
import { Type } from '../gfx/types';
import {
    switchbox_x1,
    switchbox_x2,
    switchbox_y1,
    switchbox_y2,
} from '../gfx/ecp5.gfx.constants';

export class ECP5Arch implements Architecture<ECP5DecalID> {
    private _active_bels: Array<{x: number, y: number, name: string}> = [];
    private _active_wires: Array<{x: number, y: number, name: string}> = [];

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
        } else if (decal.type === ECP5DecalType.TYPE_GROUP) {
            const type = decal.z;
            const x = decal.location.x;
            const y = decal.location.y;

            if (type === 1 /* GroupId::TYPE_SWITCHBOX */) {
                const el = new GraphicElement();
                el.type = Type.Box;
                el.style = Style.Frame;

                el.x1 = x + switchbox_x1;
                el.x2 = x + switchbox_x2;
                el.y1 = y + switchbox_y1;
                el.y2 = y + switchbox_y2;
                return [el];
            }
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

            const x = cursor_tile % this._chipdb.width;
            const y = Math.floor(cursor_tile / this._chipdb.width);
            const name = this._chipdb.locations[this._chipdb.location_type[cursor_tile]]?.bel_data[cursor_index].name;

            ret.push(new DecalXY<ECP5DecalID>(
                new ECP5DecalID(
                    ECP5DecalType.TYPE_BEL,
                    {x, y},
                    cursor_index,
                    this._active_bels.filter(ab => ab.x === x && ab.y === y && ab.name === name).length === 1
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
            const x = cursor_tile % this._chipdb.width;
            const y = Math.floor(cursor_tile / this._chipdb.width);
            const name = this._chipdb.locations[this._chipdb.location_type[cursor_tile]]?.wire_data[cursor_index].name;

            ret.push(new DecalXY<ECP5DecalID>(
                new ECP5DecalID(
                    ECP5DecalType.TYPE_WIRE,
                    {x, y},
                    cursor_index,
                    this._active_wires.filter(aw => aw.x === x && aw.y === y && aw.name === name).length === 1
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
        const ret: Array<DecalXY<ECP5DecalID>> = [];

        for (let y = 0; y < this._chipdb.height - 1; ++y) {
            for (let x = 0; x < this._chipdb.width - 1; ++x) {
                ret.push(new DecalXY<ECP5DecalID>(
                    new ECP5DecalID(
                        ECP5DecalType.TYPE_GROUP,
                        {x, y},
                        1,
                        true
                    ),
                    0,
                    0
                ));
            }
        }

        return ret;
    }

    public activateBelByName(name: string) {
        const parts = name.split('/');

        const x_idx = parseInt(parts[0].replace('X', ''), 10);
        const y_idx = parseInt(parts[1].replace('Y', ''), 10);
        const bname = parts[2];

        this._active_bels.push({x: x_idx, y: y_idx, name: bname});
    }

    public activateWireByName(name: string) {
        const parts = name.split('/');

        const x_idx = parseInt(parts[0].replace('X', ''), 10);
        const y_idx = parseInt(parts[1].replace('Y', ''), 10);
        const wname = parts[2];

        this._active_wires.push({x: x_idx, y: y_idx, name: wname})
    }
}
