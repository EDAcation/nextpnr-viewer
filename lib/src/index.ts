import wasmInit, {ViewerECP5} from 'nextpnr-renderer';

// **** Auxiliary types ****
export const SUPPORTED_DEVICES = <const> {
    ecp5: ['25k', '45k', '85k'],
};
export type SupportedFamily = keyof typeof SUPPORTED_DEVICES;

interface Chip<Family extends SupportedFamily> {
    family: Family;
    device: typeof SUPPORTED_DEVICES[Family][number];
}
export type SupportedChip = Chip<keyof typeof SUPPORTED_DEVICES>;


// **** Config ****
type ColorConfig = {
    active: string;
    inactive: string;
    frame: string;
    background: string;
};

export type ViewerConfig = {
    width: number;
    height: number;
    createToggles: boolean;
    colors: ColorConfig;
    cellColors: Record<string, string>;
    chip: SupportedChip;
};

export const defaultConfig: ViewerConfig = {
    width: 1280,
    height: 720,
    createToggles: true,
    colors: {
        active: '#F8F8F2',
        inactive: '#6272A4',
        frame: '#BD93F9',
        background: '#282A36'
    },
    cellColors: {},
    chip: {
        family: 'ecp5',
        device: '25k'
    }
};


// **** Internal functions ****
type ChipDatabases = {
    [Family in SupportedFamily]: {
        [Device in typeof SUPPORTED_DEVICES[Family][number]]: URL;
    };
};
const CHIP_DBS: ChipDatabases = {
    "ecp5": {
        "25k": new URL(`../static/chipdb/ecp5/25k.bin`, import.meta.url),
        "45k": new URL(`../static/chipdb/ecp5/45k.bin`, import.meta.url),
        "85k": new URL(`../static/chipdb/ecp5/85k.bin`, import.meta.url),
    }
}

function getChipDbUrl(chip: SupportedChip) {
    const url = (CHIP_DBS[chip.family] ?? {})[chip.device];
    if (url === undefined) {
        throw new Error(`Could not find chip database for ${chip.family}:${chip.device}!`)
    }

    return url;
}

async function getChipDb(url: URL): Promise<Uint8Array> {
    let chipdb = await fetch(url).then((resp) => resp.arrayBuffer());
    return new Uint8Array(chipdb);
}

type Viewer = ViewerECP5;
const VIEWERS = <const> {
    'ecp5': ViewerECP5
}
function getViewer<Family extends SupportedFamily>(family: Family): typeof VIEWERS[Family] {
    let viewer = VIEWERS[family];
    if (viewer === undefined) {
        throw new Error(`Could not find suitable viewer for ${family}`);
    }

    return viewer;
}

let initialized = false;
async function init() {
    if (!initialized) await wasmInit();
}

// **** External API ****
export function isSupported<Family extends SupportedFamily>(family: Family, device: typeof SUPPORTED_DEVICES[Family][number]): boolean {
    const devices = SUPPORTED_DEVICES[family] ?? [];
    return devices.includes(device);
}

export class NextPNRViewer {
    private config: ViewerConfig;
    private viewer: Promise<Viewer>;

    constructor(canvas: HTMLCanvasElement, config?: Partial<ViewerConfig>) {
        this.config = {...defaultConfig, ...config};

        // Separate functions so we can throw an error prematurely instead of in the promise
        const url = getChipDbUrl(this.config.chip);
        const viewer = getViewer(this.config.chip.family);

        this.viewer = init().then(() => getChipDb(url).then((db) => new viewer(canvas, db)));
        this.viewer.then(() => this._addEventListeners(canvas));
    };

    async render() {
        const viewer = await this.viewer;

        viewer.render();
    }

    private async _addEventListeners(canvas: HTMLCanvasElement) {
        const viewer = await this.viewer;

        let down = false;
        let firstEvent = true;
        let oldx = 0;
        let oldy = 0;

        // Zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY === 0) return;
            viewer.zoom(
                e.deltaY > 0 ? 0.05 : -0.05,
                e.clientX - canvas.offsetLeft,
                e.clientY - canvas.offsetTop
            );
        });

        // Pan
        canvas.addEventListener('mousedown', (_) => {
            down = true;
            firstEvent = true;
        });
        canvas.addEventListener('mouseup', (_) => {
            down = false;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (down) {
                if (!firstEvent) {
                    viewer.pan(e.clientX - oldx, e.clientY - oldy);
                }

                firstEvent = false;
                oldx = e.clientX;
                oldy = e.clientY;
            }
        });
    }
}
