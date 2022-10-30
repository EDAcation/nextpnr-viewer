export interface ChipDbInterface {
    chip_info_384: {
        dev_width: number,
        dev_height: number,
        num_switches: number,

        bel_data: string,
        wire_data: string,
        pip_data: string,
        tile_grid: string,
        bits_info: string,
        bel_config: string,
        packages_data: string,
        cell_timing: string,
        global_network_info: string,
        tile_wire_names: string
    },
}

export enum TileType {
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
}

export interface BelDataInterface {
    name: string,
    type: number,
    bel_wires: string,
    x: number,
    y: number,
    z: number
}

export interface BelWiresInterface {
    port: number,
    type: number,
    wire_index: number
}

export enum WireDataTypeEnum {
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
}

export interface WireDataInterface {
    name: string,
    name_x: number,
    name_y: number,
    pips_uphill: string|null,
    pips_downhill: string|null,
    bel_pins: string|null,
    segments: string,
    fast_delay: number,
    slow_delay: number,
    x: number,
    y: number,
    z: number,
    type: WireDataTypeEnum
}

export enum PipFlagsEnum {
    FLAG_NONE = 0,
    FLAG_ROUTETHRU = 1,
    FLAG_NOCARRY = 2
}

export interface PipDataInterface {
    src: number,
    dst: number,
    fast_delay: number,
    slow_delay: number,
    x: number,
    y: number,
    src_seg: number,
    dst_seg: number,
    switch_mask: number,
    switch_index: number,
    flags: PipFlagsEnum
}
