import { ViewerECP5, ViewerICE40 } from "../pkg/nextpnr_renderer";

export const VIEWERS = <const> {
    ecp5: ViewerECP5,
    ice40: ViewerICE40,
};

export type SupportedFamily = keyof typeof VIEWERS;
export type Viewer = typeof VIEWERS[keyof typeof VIEWERS];

const CHIP_DBS = <const> {
    ecp5: {
        "25k": new URL(`../static/chipdb/ecp5/25k-min.bin`, import.meta.url),
        "45k": new URL(`../static/chipdb/ecp5/45k-min.bin`, import.meta.url),
        "85k": new URL(`../static/chipdb/ecp5/85k-min.bin`, import.meta.url),
    },
    ice40: {
        "384": new URL(`../static/chipdb/ice40/384-min.bin`, import.meta.url),
        "1k": new URL(`../static/chipdb/ice40/1k-min.bin`, import.meta.url),
        "u4k": new URL(`../static/chipdb/ice40/u4k-min.bin`, import.meta.url),
        "5k": new URL(`../static/chipdb/ice40/5k-min.bin`, import.meta.url),
        "8k": new URL(`../static/chipdb/ice40/8k-min.bin`, import.meta.url),
    },
} satisfies Record<SupportedFamily, Record<string, URL>>;

// **** Auxiliary types ****
export const SUPPORTED_DEVICES = <const> {
    ecp5: {
        "12k": CHIP_DBS['ecp5']['25k'],
        "25k": CHIP_DBS['ecp5']['25k'],
        "um-25k": CHIP_DBS['ecp5']['25k'],
        "um5g-25k": CHIP_DBS['ecp5']['25k'],
        "45k": CHIP_DBS['ecp5']['45k'],
        "um-45k": CHIP_DBS['ecp5']['45k'],
        "um5g-45k": CHIP_DBS['ecp5']['45k'],
        "85k": CHIP_DBS['ecp5']['85k'],
        "um-85k": CHIP_DBS['ecp5']['85k'],
        "um5g-85k": CHIP_DBS['ecp5']['85k'],
    },
    ice40: {
        lp384: CHIP_DBS['ice40']['384'],
        lp1k: CHIP_DBS['ice40']['1k'],
        hx1k: CHIP_DBS['ice40']['1k'],
        u1k: CHIP_DBS['ice40']['u4k'],
        u2k: CHIP_DBS['ice40']['u4k'],
        u4k: CHIP_DBS['ice40']['u4k'],
        up3k: CHIP_DBS['ice40']['5k'],
        up5k: CHIP_DBS['ice40']['5k'],
        lp8k: CHIP_DBS['ice40']['8k'],
        hx8k: CHIP_DBS['ice40']['8k'],
        lp4k: CHIP_DBS['ice40']['8k'],
        hx4k: CHIP_DBS['ice40']['8k'],
    },
} satisfies Record<SupportedFamily, Record<string, URL>>;

interface Chip<Family extends SupportedFamily> {
    family: Family;
    device: keyof typeof SUPPORTED_DEVICES[Family];
}
export type SupportedChip = {
    [F in SupportedFamily]: Chip<F>
}[SupportedFamily];

// **** Functions ****
export function getChipDbUrl(chip: SupportedChip): URL {
    const {family, device} = chip;
    const familyDb = SUPPORTED_DEVICES[family];

    return familyDb[device as keyof typeof familyDb];
}

export async function getChipDb(url: URL): Promise<Uint8Array> {
    let chipdb = await fetch(url).then((resp) => resp.arrayBuffer());
    return new Uint8Array(chipdb);
}
