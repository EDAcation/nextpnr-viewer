import {SupportedFamily} from '.';

import type {CellColorConfig, ColorConfig, ElementType, NextpnrJson, ReportJson} from '../pkg/nextpnr_renderer';

type WorkerRequest = {id: number; method: string; args: any[]};
type WorkerResponse = {id: number; result?: any; error?: string};

function createWorkerSource(pkgModuleUrl: string, wasmUrl: string): string {
    return `
const PKG_MODULE_URL = ${JSON.stringify(pkgModuleUrl)};
const WASM_URL = ${JSON.stringify(wasmUrl)};

let viewer = null;
let offscreenCanvas = null;
let pkgModulePromise = null;

function serializeError(error) {
    if (error instanceof Error) return error.message;
    return String(error);
}

async function getPkgModule() {
    if (!pkgModulePromise) {
        pkgModulePromise = import(PKG_MODULE_URL);
    }

    return pkgModulePromise;
}

async function initWasm() {
    const wasmResponse = await fetch(WASM_URL);
    if (!wasmResponse.ok) {
        throw new Error('Failed to fetch WASM (' + wasmResponse.status + ' ' + wasmResponse.statusText + ')');
    }

    const wasmBytes = await wasmResponse.arrayBuffer();
    const pkg = await getPkgModule();
    await pkg.default({module_or_path: wasmBytes});
}

async function initViewer(family, chipdbUrl, canvas, width, height, colors, cellColors) {
    await initWasm();

    offscreenCanvas = canvas;
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const pkg = await getPkgModule();
    const ViewerCtor = family === 'ecp5' ? pkg.ViewerECP5 : family === 'ice40' ? pkg.ViewerICE40 : null;
    if (!ViewerCtor) {
        throw new Error('Could not find suitable viewer for ' + family);
    }

    const chipdb = await fetch(chipdbUrl).then((resp) => resp.arrayBuffer());
    viewer = new ViewerCtor(canvas, new Uint8Array(chipdb), colors, cellColors);
    return null;
}

function callViewer(method, args) {
    if (!viewer) throw new Error('Viewer not initialized');

    const fn = viewer[method];
    if (typeof fn !== 'function') throw new Error('Unknown viewer method: ' + method);

    const result = fn.apply(viewer, args);
    if (method === 'get_decals') return Array.from(result.entries());

    return result;
}

self.onmessage = async (event) => {
    const {id, method, args} = event.data;

    try {
        let result;
        if (method === '__init__') {
            result = await initViewer(...args);
        } else if (method === '__resize_canvas__') {
            if (!offscreenCanvas) throw new Error('Canvas not initialized');
            offscreenCanvas.width = args[0];
            offscreenCanvas.height = args[1];
            result = null;
        } else if (method === '__destroy__') {
            if (viewer && typeof viewer.free === 'function') viewer.free();
            viewer = null;
            offscreenCanvas = null;
            result = null;
        } else {
            result = callViewer(method, args || []);
        }

        self.postMessage({id, result});
    } catch (error) {
        self.postMessage({id, error: serializeError(error)});
    }
};
`;
}

export class WorkerViewerAdapter {
    private worker: Worker;
    private workerScriptUrl: string;
    private msgId = 0;
    private pending = new Map<number, {resolve: (value: any) => void; reject: (reason?: any) => void}>();
    private destroyed = false;

    private constructor(worker: Worker, workerScriptUrl: string) {
        this.worker = worker;
        this.workerScriptUrl = workerScriptUrl;
        this.worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
            const message = event.data;
            if (!message || typeof message.id !== 'number') return;

            const handlers = this.pending.get(message.id);
            if (!handlers) return;

            this.pending.delete(message.id);
            if (message.error) {
                handlers.reject(new Error(message.error));
            } else {
                handlers.resolve(message.result);
            }
        });
        this.worker.addEventListener('error', (event) => {
            this._rejectAllPending(new Error(event.message || 'Worker error'));
        });
    }

    static async create(
        family: SupportedFamily,
        chipdbUrl: URL,
        offscreenCanvas: OffscreenCanvas,
        width: number,
        height: number,
        colors: ColorConfig,
        cellColors: CellColorConfig
    ): Promise<WorkerViewerAdapter> {
        const pkgModuleUrl = new URL('../pkg/nextpnr_renderer.js', import.meta.url).href;
        const wasmUrl = new URL('../pkg/nextpnr_renderer_bg.wasm', import.meta.url).href;
        const workerSource = createWorkerSource(pkgModuleUrl, wasmUrl);
        const workerScriptUrl = URL.createObjectURL(new Blob([workerSource], {type: 'text/javascript'}));
        const worker = new Worker(workerScriptUrl, {type: 'module'});

        const adapter = new WorkerViewerAdapter(worker, workerScriptUrl);
        await adapter._rpc(
            '__init__',
            [family, chipdbUrl.href, offscreenCanvas, width, height, colors, cellColors],
            [offscreenCanvas]
        );

        return adapter;
    }

    private _rpc(method: string, args: any[] = [], transfer: Transferable[] = []): Promise<any> {
        if (this.destroyed) {
            return Promise.reject(new Error('Viewer worker has been destroyed'));
        }

        const id = ++this.msgId;
        const req: WorkerRequest = {id, method, args};

        return new Promise((resolve, reject) => {
            this.pending.set(id, {resolve, reject});
            this.worker.postMessage(req, transfer);
        });
    }

    private _rejectAllPending(error: Error) {
        for (const [, handlers] of this.pending.entries()) {
            handlers.reject(error);
        }
        this.pending.clear();
    }

    async render(): Promise<void> {
        await this._rpc('render');
    }

    async resize_canvas(width: number, height: number): Promise<void> {
        await this._rpc('__resize_canvas__', [width, height]);
    }

    async show_json(nextpnrJson: NextpnrJson, reportJson?: ReportJson): Promise<void> {
        await this._rpc('show_json', [nextpnrJson, reportJson]);
    }

    async zoom(amt: number, x: number, y: number): Promise<void> {
        await this._rpc('zoom', [amt, x, y]);
    }

    async pan(x: number, y: number): Promise<void> {
        await this._rpc('pan', [x, y]);
    }

    async select(elementType: ElementType, decalId: string): Promise<void> {
        await this._rpc('select', [elementType, decalId]);
    }

    async select_at_coords(x: number, y: number, onlyHighlight: boolean): Promise<any> {
        return this._rpc('select_at_coords', [x, y, onlyHighlight]);
    }

    async get_decal_ids(decalType: ElementType): Promise<string[]> {
        return this._rpc('get_decal_ids', [decalType]);
    }

    async get_decals(decalType: ElementType, decalIds: string[]): Promise<Map<any, any>> {
        const entries = await this._rpc('get_decals', [decalType, decalIds]);
        return new Map(entries);
    }

    destroy() {
        if (this.destroyed) return;
        this._rpc('__destroy__')
            .catch(() => {
                /* ignore */
            })
            .finally(() => {
                this.destroyed = true;
                this.worker.terminate();
                URL.revokeObjectURL(this.workerScriptUrl);
                this._rejectAllPending(new Error('Viewer worker terminated'));
            });
    }
}
