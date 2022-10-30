export interface LocationPOD {
    x: number;
    y: number;
}

export interface BelWirePOD {
    rel_wire_loc: LocationPOD;
    wire_index: number;
    port: number;
    type: number;
}

export interface BelInfoPOD {
    name: string;
    type: number;
    z: number;
    bel_wires: Array<BelWirePOD>;
}

export interface BelPortPOD {
    rel_bel_loc: LocationPOD;
    bel_index: number;
    port: number;
}

export interface PipInfoPOD {
    rel_src_loc: LocationPOD;
    rel_dst_loc: LocationPOD;
    src_idx: number;
    dst_idx: number;
    timing_class: number;
    tile_type: number;
    pip_type: number;
    lutperm_flags: number;
    padding: number;
}

export interface PipLocatorPOD {
    rel_loc: LocationPOD;
    index: number;
}

export interface WireInfoPOD {
    name: string;
    type: number;
    tile_wire: number;
    pips_uphill: Array<PipLocatorPOD>;
    pips_downhill: Array<PipLocatorPOD>;
    bel_pins: Array<BelPortPOD>;
}

export interface LocationTypePOD {
    bel_data: Array<BelInfoPOD>;
    wire_data: Array<WireInfoPOD>;
    pip_data: Array<PipInfoPOD>;
}

export interface PIOInfoPOD {
    abs_loc: LocationPOD;
    bel_index: number;
    function_name: string;
    bank: number;
    dqsgroup: number;
}

export interface PackagePinPOD {
    name: string;
    abs_loc: LocationPOD;
    bel_index: number;
}

export interface PackageInfoPOD {
    name: string;
    pin_data: Array<PackagePinPOD>;
}

export interface TileNamePOD {
    name: string;
    type_idx: number;
    padding: number;
}

export interface TileInfoPOD {
    tile_names: Array<TileNamePOD>;
}

export interface GlobalInfoPOD {
    tap_col: number;
    tap_dir: number;
    quad: number;
    spine_row: number;
    spine_col: number;
}

export interface CellPropDelayPOD {
    from_port: number;
    to_port: number;
    min_delay: number;
    max_delay: number;
}

export interface CellSetupHoldPOD {
    sig_port: number;
    clock_port: number;
    min_setup: number;
    max_setup: number;
    min_hold: number;
    max_hold: number;
}

export interface CellTimingPOD {
    cell_type: number;
    prop_delays: Array<CellPropDelayPOD>;
    setup_holds: Array<CellSetupHoldPOD>;
}

export interface PipDelayPOD {
    min_base_delay: number;
    max_base_delay: number;
    min_fanout_adder: number;
    max_fanout_adder: number;
}

export interface SpeedGradePOD {
    cell_timings: Array<CellTimingPOD>;
    pip_classes: Array<PipDelayPOD>;
}

export interface ChipInfoPOD {
    width: number;
    height: number;
    num_tiles: number;
    const_id_count: number;
    locations: Array<LocationTypePOD>;
    location_type: Array<number>;
    location_glbinfo: Array<GlobalInfoPOD>;
    tiletype_names: Array<string>;
    package_info: Array<PackageInfoPOD>;
    pio_info: Array<PIOInfoPOD>;
    tile_info: Array<TileInfoPOD>;
    speed_grades: Array<SpeedGradePOD>;
}
