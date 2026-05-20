import type {CellColorConfig, ColorConfig, ElementType, NextpnrJson, ReportJson} from '../pkg/nextpnr_renderer';

import {SupportedFamily, VIEWERS} from './types';

type WorkerRequest = {id: number; method: string; args: any[]};
type WorkerResponse = {id: number; result?: any; error?: string};

const PKG_MODULE_URL = new URL('../pkg/nextpnr_renderer.js', import.meta.url).href;
const WASM_URL = new URL('../pkg/nextpnr_renderer_bg.wasm', import.meta.url).href;

async function getWasm(): Promise<ArrayBuffer> {
    const wasmResponse = await fetch(WASM_URL);
    if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch WASM (${wasmResponse.status} ${wasmResponse.statusText})`);
    }
    return await wasmResponse.arrayBuffer();
}

async function getPkgModuleUrl(): Promise<string> {
    const response = await fetch(PKG_MODULE_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch pkg module (${response.status} ${response.statusText})`);
    }
    const buffer = await response.arrayBuffer();
    const blob = new Blob([buffer], {type: 'application/javascript'});
    return URL.createObjectURL(blob);
}

async function getChipdb(url: URL): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch chipdb (${response.status} ${response.statusText})`);
    }
    return await response.arrayBuffer();
}

function createWorker(): Worker {
    const src = `
let viewer = null;
let offscreenCanvas = null;
let pkgModulePromise = null;

function serializeError(error) {
    if (error instanceof Error) return error.message;
    return String(error);
}

async function initViewer(pkgModuleUrl, wasmBytes, chipdb, viewerCtorName, canvas, width, height, colors, cellColors) {
    const pkg = await import(pkgModuleUrl);
    await pkg.default({module_or_path: wasmBytes});

    offscreenCanvas = canvas;
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const viewerCtor = pkg[viewerCtorName];
    if (!viewerCtor) {
        throw new Error('Could not find viewer ctor for ' + viewerCtorName);
    }

    viewer = new viewerCtor(canvas, new Uint8Array(chipdb), colors, cellColors);
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
    const blob = new Blob([src], {type: 'text/javascript'});
    const url = URL.createObjectURL(blob);
    return new Worker(url, {type: 'module'});
}

export class WorkerViewerAdapter {
    private worker: Worker;
    private msgId = 0;
    private pending = new Map<number, {resolve: (value: any) => void; reject: (reason?: any) => void}>();
    private destroyed = false;

    private constructor(worker: Worker) {
        this.worker = worker;
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
        const viewerClass = VIEWERS[family];

        const wasm = await getWasm();
        const pkgModuleUrl = await getPkgModuleUrl();
        const chipdb = await getChipdb(chipdbUrl);

        const worker = createWorker();
        const adapter = new WorkerViewerAdapter(worker);
        await adapter._rpc(
            '__init__',
            [pkgModuleUrl, wasm, chipdb, viewerClass.name, offscreenCanvas, width, height, colors, cellColors],
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
                this._rejectAllPending(new Error('Viewer worker terminated'));
            });
    }
}
