import { ChipInfoPOD, LocationPOD } from '../chipdb/ecp5.chipdb';
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
    constructor(
        private _chipdb: ChipInfoPOD
    ) { }

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
            const style = Style.Inactive;

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
            const style = Style.Inactive;
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
        } else if (decal.type === ECP5DecalType.TYPE_PIP) {
            const index = decal.z;
            const location = decal.location;

            const loc_info = (wire: {location: typeof location}) => {
                const tile = wire.location.y * this._chipdb.width + wire.location.x;
                return this._chipdb.locations[this._chipdb.location_type[tile]];
            };

            const wire_type = (wire: {location: typeof location, index: number}) => {
                return loc_info(wire).wire_data[wire.index].type;
            }

            const pip = loc_info(decal)?.pip_data[index];
            if (pip === undefined) return [];

            const src_wire = {
                location: {
                    x: decal.location.x + pip.rel_src_loc.x,
                    y: decal.location.y + pip.rel_src_loc.y,
                },
                index: pip.src_idx
            };
            const dst_wire = {
                location: {
                    x: decal.location.x + pip.rel_dst_loc.x,
                    y: decal.location.y + pip.rel_dst_loc.y,
                },
                index: pip.dst_idx
            };

            const x = decal.location.x;
            const y = decal.location.y;

            const src_id: GfxTileWireId = loc_info(src_wire).wire_data[src_wire.index].tile_wire;
            const dst_id: GfxTileWireId = loc_info(dst_wire).wire_data[dst_wire.index].tile_wire;

            const style = Style.Hidden;

            const width = this._chipdb.width;
            const height = this._chipdb.height;
            return GFX.tilePip(x, y, width, height, src_wire, wire_type(src_wire), src_id, dst_wire,
                               wire_type(dst_wire), dst_id, style);
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
                    cursor_index
                ),
                0,
                0,
                `X${x}/Y${y}/${name}`
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
                    cursor_index
                ),
                0,
                0,
                `X${x}/Y${y}/${name}`
            ));
            cursor_index++;
        }
        return ret;
    }

    public findPipDecalByLocFromTo(
        location: LocationPOD,
        from: {location: LocationPOD, name: string},
        to: {location: LocationPOD, name: string}) {
        const tile = location.y * this._chipdb.width + location.x;
        let pip_data = this._chipdb.locations[this._chipdb.location_type[tile]].pip_data;
        let pip_data_indexed = pip_data.map((v, i) => [i,v] as const);

        // Relative offsets
        pip_data_indexed = pip_data_indexed.filter(([,pd]) => pd.rel_src_loc.x === from.location.x
                                      && pd.rel_src_loc.y === from.location.y
                                      && pd.rel_dst_loc.x === to.location.x
                                      && pd.rel_dst_loc.y === to.location.y);

        // From Name
        pip_data_indexed = pip_data_indexed.filter(([,pd]) => {
            const src_x = location.x + pd.rel_src_loc.x;
            const src_y = location.y + pd.rel_src_loc.y;
            const src_idx = pd.src_idx;

            const src_tile = src_y * this._chipdb.width + src_x;
            const src_wire_data = this._chipdb.locations[this._chipdb.location_type[src_tile]].wire_data[src_idx];

            return src_wire_data.name === from.name;
        });

        // To Name
        pip_data_indexed = pip_data_indexed.filter(([,pd]) => {
            const dst_x = location.x + pd.rel_dst_loc.x;
            const dst_y = location.y + pd.rel_dst_loc.y;
            const dst_idx = pd.dst_idx;

            const dst_tile = dst_y * this._chipdb.width + dst_x;
            const dst_wire_data = this._chipdb.locations[this._chipdb.location_type[dst_tile]].wire_data[dst_idx];

            return dst_wire_data.name === to.name;
        });

        return new DecalXY(
            new ECP5DecalID(
                ECP5DecalType.TYPE_PIP,
                {...location},
                pip_data_indexed[0][0]
            ),
            0,
            0,
            `${JSON.stringify([location, from, to])}`
        );
    }

    public getPipDecals(): Array<DecalXY<ECP5DecalID>> {
        let cursor_tile = 0;
        let cursor_index = 0;

        const ret: Array<DecalXY<ECP5DecalID>> = [];

        while (cursor_tile != this._chipdb.width * this._chipdb.height) {
            while (cursor_tile < this._chipdb.num_tiles &&
                   cursor_index >= this._chipdb.locations[this._chipdb.location_type[cursor_tile]].pip_data.length) {
                cursor_index = 0;
                cursor_tile++;
            }

            const x = cursor_tile % this._chipdb.width;
            const y = Math.floor(cursor_tile / this._chipdb.width);

            ret.push(new DecalXY(
                new ECP5DecalID(
                    ECP5DecalType.TYPE_PIP,
                    {x, y},
                    cursor_index
                ),
                0,
                0,
                `TODO(${cursor_tile}, ${cursor_index})`
            ));

            cursor_index++;
        }
        return ret;
    }

    public getGroupDecals(): Array<DecalXY<ECP5DecalID>> {
        const ret: Array<DecalXY<ECP5DecalID>> = [];

        for (let y = 1; y < this._chipdb.height - 1; ++y) {
            for (let x = 1; x < this._chipdb.width - 1; ++x) {
                ret.push(new DecalXY<ECP5DecalID>(
                    new ECP5DecalID(
                        ECP5DecalType.TYPE_GROUP,
                        {x, y},
                        1
                    ),
                    0,
                    0,
                    `X${x}/Y${y}/UNKNOWN_GROUP`
                ));
            }
        }

        return ret;
    }
}
