import init, {ViewerECP5} from 'nextpnr-renderer';

import {NextPNRViewer} from './viewer';
import {ViewerConfig} from './viewer.interface';

export default (div: HTMLDivElement, config: Partial<ViewerConfig>) => new NextPNRViewer(div, config);

type ChipType = '25k' | '45k' | '85k';

async function getChipDb(db: ChipType) {
    let input;
    switch (db) {
        case '25k':
            input = new URL(`../static/chipdb/ecp5/25k.bin`, import.meta.url);
            break;
        case '45k':
            input = new URL(`../static/chipdb/ecp5/45k.bin`, import.meta.url);
            break;
        case '85k':
            input = new URL(`../static/chipdb/ecp5/85k.bin`, import.meta.url);
            break;
    }

    let chipdb = await fetch(input).then((resp) => resp.arrayBuffer());
    return new Uint8Array(chipdb);
}

export async function get_wasm_viewer(canvas: HTMLCanvasElement, type: ChipType): Promise<ViewerECP5> {
    await init();

    const db = await getChipDb(type);
    return new ViewerECP5(canvas, db);
}
