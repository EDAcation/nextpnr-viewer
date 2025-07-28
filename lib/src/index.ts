import wasmInit, {Color, ViewerECP5, ViewerICE40, ColorConfig as RendererColorConfig, NextpnrJson, CellColorConfig} from '../pkg';

export {NextpnrJson};

const CHIP_DBS = <const> {
    "ecp5": {
        "25k": new URL(`../static/chipdb/ecp5/25k-min.bin`, import.meta.url),
        "45k": new URL(`../static/chipdb/ecp5/45k-min.bin`, import.meta.url),
        "85k": new URL(`../static/chipdb/ecp5/85k-min.bin`, import.meta.url),
    },
    "ice40": {
        "384": new URL(`../static/chipdb/ice40/384-min.bin`, import.meta.url),
        "1k": new URL(`../static/chipdb/ice40/1k-min.bin`, import.meta.url),
        "u4k": new URL(`../static/chipdb/ice40/u4k-min.bin`, import.meta.url),
        "5k": new URL(`../static/chipdb/ice40/5k-min.bin`, import.meta.url),
        "8k": new URL(`../static/chipdb/ice40/8k-min.bin`, import.meta.url),
    },
}

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
};
export type SupportedFamily = keyof typeof SUPPORTED_DEVICES;

interface Chip<Family extends SupportedFamily> {
    family: Family;
    device: keyof typeof SUPPORTED_DEVICES[Family];
}
export type SupportedChip = {
    [F in SupportedFamily]: Chip<F>
}[SupportedFamily];


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
function getChipDbUrl(chip: SupportedChip): URL {
  const { family, device } = chip;
  const familyDb = SUPPORTED_DEVICES[family];

  return familyDb[device as keyof typeof familyDb];
}

async function getChipDb(url: URL): Promise<Uint8Array> {
    let chipdb = await fetch(url).then((resp) => resp.arrayBuffer());
    return new Uint8Array(chipdb);
}

let colCanvas: CanvasRenderingContext2D | null;
function fromCssColor(colorStr: string): Color {
    if (!colCanvas) {
        colCanvas = document.createElement('canvas').getContext('2d');
    }
    if (!colCanvas) throw new Error('Could not create canvas to convert color');
    

    colCanvas.fillStyle = colorStr;
    const col = colCanvas.fillStyle.replace('#', '');

    const rstr = col.slice(0,2);
    const gstr = col.slice(2,4);
    const bstr = col.slice(4,6);

    return {r: parseInt(rstr, 16), g: parseInt(gstr, 16), b: parseInt(bstr, 16)};
}

let animFrameId: number | null = null;
function doInAnimFrame(f: () => void) {
    if (animFrameId != null) window.cancelAnimationFrame(animFrameId);

    animFrameId = window.requestAnimationFrame(() => {
        f();

        animFrameId = null;
    })
}

type Viewer = ViewerECP5 | ViewerICE40;
const VIEWERS = <const> {
    'ecp5': ViewerECP5,
    'ice40': ViewerICE40,
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
    if (!initialized) {
        await wasmInit();
        initialized = true;
    }
}

// **** External API ****
export function isSupported(chip: {family: string, device: string}): chip is SupportedChip {
    const family = chip.family as SupportedFamily;
    if (!(family in SUPPORTED_DEVICES)) return false;

    const devices = SUPPORTED_DEVICES[family];
    return chip.device in devices;
}

export class NextPNRViewer {
    private config: ViewerConfig;
    private viewer: Promise<Viewer>;

    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;

    constructor(container: HTMLDivElement, config?: Partial<ViewerConfig>) {
        this.config = {...defaultConfig, ...config};

        // Separate functions so we can throw an error prematurely instead of in the promise
        const url = getChipDbUrl(this.config.chip);
        const viewer = getViewer(this.config.chip.family);
        const colors: RendererColorConfig = {
            active: fromCssColor(this.config.colors.active),
            inactive: fromCssColor(this.config.colors.inactive),
            frame: fromCssColor(this.config.colors.frame),
            background: fromCssColor(this.config.colors.background)
        };
        const cellColors: CellColorConfig = Object.fromEntries(
            Object.entries(this.config.cellColors).map(
                ([cell, colorStr]) => [cell, fromCssColor(colorStr)]
            )
        );

        this.container = container;
        this.canvas = this._createCanvas(container);
        this._doResize(this.config.width, this.config.height);

        this.viewer = Promise.all([
            init(),
            getChipDb(url),
        ]).then(([_, db]) => new viewer(this.canvas, db, colors, cellColors));
        this.viewer.then(() => this._addEventListeners(this.canvas));
    };

    async render() {
        // Explicit call to start rendering, so set force to true
        await this._doRender(true);
    }

    async showJson(json: NextpnrJson) {
        json = (typeof json === 'string') ? JSON.parse(json) : json;

        const viewer = await this.viewer;

        viewer.show_json(json);
    }

    async resize(width: number, height: number) {
        this._doResize(width, height);

        // First render can be delayed, so set force to false
        await this._doRender(false);
    }

    private async _doRender(force: boolean) {
        // The first render is relatively expensive, so it is a good idea to delay it until we really need it.
        // Setting force to true will immediately trigger this first render, while setting it to false essentially
        // makes this method a no-op until the first render has occurred.
        const viewer = await this.viewer;
        viewer.render(force);
    }

    private _doResize(width: number, height: number) {
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';

        this.canvas.style.flexGrow = '1';

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    private _createCanvas(container: HTMLDivElement): HTMLCanvasElement {
        const elem = document.createElement('canvas');
        container.innerHTML = '';
        container.appendChild(elem);
    
        return elem;
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
            doInAnimFrame(() => viewer.zoom(
                e.deltaY > 0 ? 0.05 : -0.05,
                e.clientX - canvas.offsetLeft,
                e.clientY - canvas.offsetTop
            ));
        });

        // Pan
        canvas.addEventListener('mousedown', (_) => {
            down = true;
            firstEvent = true;
        });
        canvas.addEventListener('mouseup', (_) => {
            down = false;
        });
        canvas.addEventListener('mousemove', (e) => doInAnimFrame(() => {
            if (down) {
                if (!firstEvent) {
                    viewer.pan(e.clientX - oldx, e.clientY - oldy);
                }

                firstEvent = false;
                oldx = e.clientX;
                oldy = e.clientY;
            }
        }));
    }
}
