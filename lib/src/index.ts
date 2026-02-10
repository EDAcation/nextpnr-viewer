import wasmInit, { CellColorConfig, Color, ElementType, NextpnrJson, ColorConfig as RendererColorConfig, ReportJson, ViewerECP5, ViewerICE40 } from '../pkg';

export { NextpnrJson, ReportJson };

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

interface DecalInfo {
    id: string;
    is_active: boolean;
    is_critical: boolean;
    internal: any;
}


// **** Config ****
type ColorConfig = {
    active: string;
    inactive: string;
    frame: string;
    background: string;
    critical: string;
    highlight: string;
    selected: string;
};

export type ViewerConfig = {
    width: number;
    height: number;
    createToggles: boolean;
    colors: ColorConfig;
    cellColors: Record<string, string>;
    chip: SupportedChip;
    sidebarWidth: number;
};

export const defaultConfig: ViewerConfig = {
    width: 1280,
    height: 720,
    createToggles: true,
    colors: {
        active: '#F8F8F2',
        inactive: '#6272A4',
        frame: '#BD93F9',
        background: '#282A36',
        critical: '#FF0000',
        highlight: '#81ff81',
        selected: '#00FF00',
    },
    cellColors: {},
    chip: {
        family: 'ecp5',
        device: '25k'
    },
    sidebarWidth: 300
};


// **** Internal functions ****
function listGetters(instance: object) {
    // Utility function to peek into an object returned from rust_bindgen
    // https://stackoverflow.com/questions/60400066/how-to-enumerate-discover-getters-and-setters-in-javascript
    return Object.entries(
        Object.getOwnPropertyDescriptors(
        Reflect.getPrototypeOf(instance)
        )
    )
    .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
    .map(e => e[0]);
}

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
    private static readonly BATCH_SIZE = 100;

    private config: ViewerConfig;
    private viewer: Promise<Viewer>;

    private container: HTMLDivElement;
    private canvas: HTMLCanvasElement;
    private sidebar: HTMLDivElement;
    private loadingElement: HTMLDivElement | null = null;

    private decalsCache: Map<ElementType, string[]> = new Map();
    private decalInfoCache: Map<string, DecalInfo> = new Map();
    private renderedDecalItems: Map<string, HTMLDivElement> = new Map();
    private selectedElement: { type: ElementType, id: string } | null = null;
    private currentElementType: ElementType | null = null;
    private renderedBatches: Set<number> = new Set();
    private tabButtons: Map<ElementType, HTMLButtonElement> = new Map();
    private loadMoreButtons: Map<number, HTMLButtonElement> = new Map();
    private decalListElement: HTMLDivElement | null = null;

    constructor(container: HTMLDivElement, config?: Partial<ViewerConfig>) {
        this.config = {...defaultConfig, ...config};

        // Separate functions so we can throw an error prematurely instead of in the promise
        const url = getChipDbUrl(this.config.chip);
        const viewer = getViewer(this.config.chip.family);
        const colors: RendererColorConfig = {
            active: fromCssColor(this.config.colors.active),
            inactive: fromCssColor(this.config.colors.inactive),
            frame: fromCssColor(this.config.colors.frame),
            background: fromCssColor(this.config.colors.background),
            critical: fromCssColor(this.config.colors.critical),
            highlight: fromCssColor(this.config.colors.highlight),
            selected: fromCssColor(this.config.colors.selected),
        };
        const cellColors: CellColorConfig = Object.fromEntries(
            Object.entries(this.config.cellColors).map(
                ([cell, colorStr]) => [cell, fromCssColor(colorStr)]
            )
        );

        this.container = container;
        const { canvasContainer, sidebar } = this._createLayout(container);
        this.sidebar = sidebar;
        this.canvas = this._createCanvas(canvasContainer);
        this.loadingElement = this._createLoadingIndicator(canvasContainer);
        this._doResize(this.config.width, this.config.height);

        this.viewer = Promise.all([
            init(),
            getChipDb(url),
        ]).then(([_, db]) => new viewer(this.canvas, db, colors, cellColors));
        this.viewer.then(() => {
            this._hideLoadingIndicator();
            this._addEventListeners(this.canvas);
            this._setupSidebar();
        });
    };

    async render() {
        (await this.viewer).render();
    }

    async showJson(nextpnrJson: NextpnrJson, reportJson?: ReportJson) {
        nextpnrJson = (typeof nextpnrJson === 'string') ? JSON.parse(nextpnrJson) : nextpnrJson;
        reportJson = (typeof reportJson === 'string') ? JSON.parse(reportJson) : reportJson;

        const viewer = await this.viewer;

        viewer.show_json(nextpnrJson, reportJson);
    }

    async resize(width: number, height: number) {
        this._doResize(width, height);

        (await this.viewer).render();
    }

    private _doResize(width: number, height: number) {
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;

        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    private _createLayout(container: HTMLDivElement): { canvasContainer: HTMLDivElement, sidebar: HTMLDivElement } {
        container.innerHTML = '';
        container.style.display = 'flex';
        container.style.flexDirection = 'row';

        const canvasContainer = document.createElement('div');
        canvasContainer.style.flex = '1';
        canvasContainer.style.display = 'flex';
        canvasContainer.style.flexDirection = 'column';
        canvasContainer.style.minWidth = '0';

        const sidebar = document.createElement('div');
        sidebar.style.width = `${this.config.sidebarWidth}px`;
        sidebar.style.flexShrink = '0';
        sidebar.style.backgroundColor = '#1e1e1e';
        sidebar.style.color = '#d4d4d4';
        sidebar.style.overflowY = 'auto';
        sidebar.style.display = 'flex';
        sidebar.style.flexDirection = 'column';
        sidebar.style.borderLeft = '1px solid #444';

        container.appendChild(canvasContainer);
        container.appendChild(sidebar);

        return { canvasContainer, sidebar };
    }

    private _createCanvas(container: HTMLDivElement): HTMLCanvasElement {
        const elem = document.createElement('canvas');
        elem.style.flexGrow = '1';
        elem.style.width = '100%';
        elem.style.height = '100%';
        container.innerHTML = '';
        container.appendChild(elem);
    
        return elem;
    }

    private _createLoadingIndicator(container: HTMLDivElement): HTMLDivElement {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.backgroundColor = this.config.colors.background;
        loadingOverlay.style.zIndex = '1000';
        loadingOverlay.style.gap = '20px';

        // Create FPGA grid (5x5 cells)
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(5, 12px)';
        gridContainer.style.gridTemplateRows = 'repeat(5, 12px)';
        gridContainer.style.gap = '4px';
        gridContainer.style.padding = '8px';
        gridContainer.style.border = `2px solid ${this.config.colors.frame}`;
        gridContainer.style.borderRadius = '4px';

        // Create 25 cells
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.style.width = '12px';
            cell.style.height = '12px';
            cell.style.backgroundColor = this.config.colors.inactive;
            cell.style.borderRadius = '2px';
            cell.style.animation = `fpgaPulse 2s ease-in-out infinite`;
            cell.style.animationDelay = `${i * 0.08}s`;
            gridContainer.appendChild(cell);
        }

        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading Nextpnr Viewer...';
        loadingText.style.color = this.config.colors.frame;
        loadingText.style.fontSize = '14px';
        loadingText.style.fontFamily = 'monospace';

        // Inject keyframes animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fpgaPulse {
                0%, 100% { 
                    background-color: ${this.config.colors.inactive};
                    opacity: 0.3;
                }
                50% { 
                    background-color: ${this.config.colors.frame};
                    opacity: 1;
                    box-shadow: 0 0 8px ${this.config.colors.frame};
                }
            }
        `;
        document.head.appendChild(style);

        loadingOverlay.appendChild(gridContainer);
        loadingOverlay.appendChild(loadingText);
        container.style.position = 'relative';
        container.appendChild(loadingOverlay);

        return loadingOverlay;
    }

    private _hideLoadingIndicator() {
        if (this.loadingElement) {
            this.loadingElement.remove();
            this.loadingElement = null;
        }
    }

    private async _addEventListeners(canvas: HTMLCanvasElement) {
        const viewer = await this.viewer;

        let down = false;
        let firstEvent = true;
        let hasMoved = false;
        let oldx = 0;
        let oldy = 0;

        // Zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY === 0) return;
            doInAnimFrame(() => viewer.zoom(
                e.deltaY > 0 ? 0.05 : -0.05,
                e.offsetX,
                e.offsetY
            ));
        });

        // Pan
        canvas.addEventListener('mousedown', (_) => {
            down = true;
            firstEvent = true;
            hasMoved = false;
        });
        canvas.addEventListener('mouseup', async (e) => {
            down = false;

            // If the mouse was moved, we consider this a pan action and do not trigger selection
            if (hasMoved) return;

            const selection = viewer.select_at_coords(e.offsetX, e.offsetY, false);
            if (!selection || !Array.isArray(selection) || selection.length < 2) return;
            
            const elementType = selection[0] as ElementType;
            const decalId = selection[1] as string;
            
            await this._handleCanvasSelection(elementType, decalId);
        });
        canvas.addEventListener('mousemove', (e) => doInAnimFrame(() => {
            viewer.select_at_coords(e.offsetX, e.offsetY, true);

            if (down) {
                hasMoved = true;

                if (!firstEvent) {
                    viewer.pan(e.offsetX - oldx, e.offsetY - oldy);
                }

                firstEvent = false;
                oldx = e.offsetX;
                oldy = e.offsetY;
            }
        }));
    }

    private async _getDecalInfo(elementType: ElementType, decalId: string): Promise<DecalInfo | null> {
        const cached = this.decalInfoCache.get(decalId);
        if (cached) return cached;

        // if not cached, cache the entire batch
        const decals = this.decalsCache.get(elementType);
        if (!decals) return null;

        const decalIndex = decals.indexOf(decalId);
        if (decalIndex === -1) return null;

        const batchIndex = Math.floor(decalIndex / NextPNRViewer.BATCH_SIZE);
        const startIndex = batchIndex * NextPNRViewer.BATCH_SIZE;
        const endIndex = Math.min(startIndex + NextPNRViewer.BATCH_SIZE, decals.length);
        const batchIds = decals.slice(startIndex, endIndex);

        const decalInfos = (await this.viewer).get_decals(elementType, batchIds);
        for (const [id, info] of decalInfos.entries()) {
            this.decalInfoCache.set(id, info);
        }

        return this.decalInfoCache.get(decalId) || null;
    }

    private async _setupSidebar() {
        const viewer = await this.viewer;

        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.style.display = 'flex';
        tabsContainer.style.borderBottom = '1px solid #444';
        tabsContainer.style.backgroundColor = '#252526';

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.style.flex = '1';
        contentContainer.style.overflowY = 'auto';
        contentContainer.style.padding = '10px';

        this.sidebar.appendChild(tabsContainer);
        this.sidebar.appendChild(contentContainer);

        const elementTypes = [
            { type: ElementType.Wire, label: 'Wires' },
            { type: ElementType.Pip, label: 'Pips' },
            { type: ElementType.Bel, label: 'Bels' },
            { type: ElementType.Group, label: 'Groups' },
        ];

        const tabs: HTMLButtonElement[] = [];

        // Create tabs
        elementTypes.forEach(({ type, label }) => {
            const tab = document.createElement('button');
            tab.textContent = label;
            tab.style.flex = '1';
            tab.style.padding = '10px';
            tab.style.border = 'none';
            tab.style.backgroundColor = '#252526';
            tab.style.color = '#d4d4d4';
            tab.style.cursor = 'pointer';
            tab.style.outline = 'none';

            tab.addEventListener('click', async () => {
                // Update active tab styling
                tabs.forEach(t => {
                    t.style.backgroundColor = '#252526';
                    t.style.borderBottom = 'none';
                });
                tab.style.backgroundColor = '#1e1e1e';
                tab.style.borderBottom = '2px solid #007acc';

                // Load decal IDs for this element type
                await this._loadDecalList(viewer, type, contentContainer);
            });

            tabs.push(tab);
            this.tabButtons.set(type, tab);
            tabsContainer.appendChild(tab);
        });

        // Activate first tab by default
        if (tabs.length > 0) {
            tabs[0].click();
        }
    }

    private async _loadDecalList(viewer: Viewer, elementType: ElementType, container: HTMLDivElement) {
        container.innerHTML = '<div style="color: #888;">Loading...</div>';

        try {
            // Clear old data
            this.decalInfoCache.clear();
            this.renderedDecalItems.clear();
            this.currentElementType = elementType;
            this.renderedBatches.clear();
            this.loadMoreButtons.clear();

            // Fetch and cache all decal IDs if not already cached
            if (!this.decalsCache.has(elementType)) {
                const decals = viewer.get_decal_ids(elementType);
                this.decalsCache.set(elementType, decals);
            }

            const decals = this.decalsCache.get(elementType)!;
            if (decals.length === 0) {
                container.innerHTML = '<div style="color: #888;">No decals found</div>';
                return;
            }

            container.innerHTML = '';

            // Create list container
            this.decalListElement = document.createElement('div');
            this.decalListElement.style.display = 'flex';
            this.decalListElement.style.flexDirection = 'column';
            this.decalListElement.style.gap = '2px';

            // Create info header
            const info = document.createElement('div');
            info.style.padding = '8px';
            info.style.color = '#888';
            info.style.fontSize = '11px';
            info.style.borderBottom = '1px solid #333';
            info.style.marginBottom = '8px';
            info.textContent = `Total: ${decals.length} decals`;
            container.appendChild(info);

            container.appendChild(this.decalListElement);

            // Render first batch
            this._renderDecalBatch(viewer, elementType, 0);
        } catch (error) {
            container.innerHTML = `<div style="color: #f44747;">Error: ${error}</div>`;
        }
    }

    private async _renderDecalBatch(viewer: Viewer, elementType: ElementType, batchIndex: number) {
        // Check if already rendered
        if (this.renderedBatches.has(batchIndex)) {
            return;
        }

        const decals = this.decalsCache.get(elementType)!;
        const startIndex = batchIndex * NextPNRViewer.BATCH_SIZE;
        const endIndex = Math.min(startIndex + NextPNRViewer.BATCH_SIZE, decals.length);
        const decalsToRender = decals.slice(startIndex, endIndex);

        // Strategy: find the first 'load more' button before the batch to find where we need to insert
        let insertAfter: HTMLElement | null = null;
        for (const [btnBatch, button] of this.loadMoreButtons) {
            if (btnBatch <= batchIndex) {
                insertAfter = button;
            }
        }

        const newElements: HTMLElement[] = await Promise.all(decalsToRender.map(decal => this._createDecalItem(viewer, elementType, decal)));
        // Add button above batch if necessary and none exist yet
        if (startIndex > 0 && !this.renderedBatches.has(batchIndex - 1) && !this.loadMoreButtons.has(batchIndex - 1)) {
            const batchRange = `${Math.max(0, startIndex - NextPNRViewer.BATCH_SIZE + 1)} - ${startIndex}`;
            const btn = this._createLoadMoreButton(viewer, elementType, batchIndex - 1, `Load More (${batchRange})`);
            newElements.unshift(btn);
        }
        // Add button below batch if necessary and none exist yet
        if (endIndex < decals.length && !this.renderedBatches.has(batchIndex + 1) && !this.loadMoreButtons.has(batchIndex + 1)) {
            const batchRange = `${endIndex + 1} - ${Math.min(endIndex + NextPNRViewer.BATCH_SIZE, decals.length)}`;
            const btn = this._createLoadMoreButton(viewer, elementType, batchIndex + 1, `Load More (${batchRange})`);
            newElements.push(btn);
        }

        // Update DOM
        if (insertAfter) {
            insertAfter.after(...newElements);
        } else {
            // Insert at end
            this.decalListElement?.append(...newElements);
        }

        // If any buttons are serving this exact batch, remove them
        // do this last because if insertAfter is a button for this batch,
        // we need to keep it until after insertion
        const buttonForThisBatch = this.loadMoreButtons.get(batchIndex);
        if (buttonForThisBatch) buttonForThisBatch.remove();
        this.loadMoreButtons.delete(batchIndex);

        this.renderedBatches.add(batchIndex);
    }

    private async _createDecalItem(viewer: Viewer, elementType: ElementType, decalId: string): Promise<HTMLDivElement> {
        const decal = await this._getDecalInfo(elementType, decalId);

        const itemContainer = document.createElement('div');
        itemContainer.style.display = 'flex';
        itemContainer.style.flexDirection = 'column';

        // Track this item
        const itemKey = `${elementType}_${decalId}`;
        this.renderedDecalItems.set(itemKey, itemContainer);

        const header = document.createElement('div');
        header.style.padding = '8px';
        header.style.cursor = 'pointer';
        header.style.backgroundColor = '#2d2d30';
        header.style.borderRadius = '3px';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.transition = 'background-color 0.2s';

        const label = document.createElement('span');
        label.textContent = decalId;
        label.style.flex = '1';
        label.style.fontFamily = 'monospace';
        label.style.fontSize = '12px';

        const activeLabel = document.createElement('span');
        activeLabel.textContent = decal?.is_active ? '●' : '○';
        activeLabel.style.marginRight = '5px';
        activeLabel.style.color = decal?.is_active ? this.config.colors.highlight : '#888';
        activeLabel.style.fontSize = '10px';

        const criticalLabel = document.createElement('span');
        criticalLabel.textContent = decal?.is_critical ? '▲' : '△';
        criticalLabel.style.marginRight = '5px';
        criticalLabel.style.color = decal?.is_critical ? this.config.colors.critical : '#888';
        criticalLabel.style.fontSize = '10px';

        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.style.fontSize = '10px';
        arrow.style.transition = 'transform 0.2s';

        header.appendChild(label);
        header.appendChild(activeLabel);
        header.appendChild(criticalLabel);
        header.appendChild(arrow);

        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'none';
        detailsContainer.style.paddingLeft = '15px';
        detailsContainer.style.paddingTop = '5px';
        detailsContainer.style.paddingBottom = '5px';

        let isExpanded = false;
        let detailsLoaded = false;

        header.addEventListener('click', async (_e) => {
            // Select on canvas
            try {
                viewer.select(elementType, decalId);
                await this._updateSelection(elementType, decalId);
            } catch (error) {
                console.error('Error selecting decal:', error);
            }

            // Toggle expansion on second click if already selected
            if (this.selectedElement?.type === elementType && this.selectedElement?.id === decalId) {
                if (isExpanded) {
                    // Collapse
                    arrow.style.transform = 'rotate(0deg)';
                    detailsContainer.style.display = 'none';
                    isExpanded = false;
                    return;
                }

                // Expand
                arrow.style.transform = 'rotate(90deg)';
                detailsContainer.style.display = 'block';
                isExpanded = true;

                if (detailsLoaded) return;

                detailsContainer.innerHTML = '<div style="color: #888; font-size: 11px;">Loading...</div>';

                if (decal) {
                    detailsContainer.innerHTML = '';
                    this._renderDecalDetails(decal, detailsContainer);
                } else {
                    detailsContainer.innerHTML = '<div style="color: #888; font-size: 11px;">No details available</div>';
                }

                detailsLoaded = true;
            }
        });

        header.addEventListener('mouseenter', () => {
            header.style.backgroundColor = '#37373d';
        });

        header.addEventListener('mouseleave', () => {
            header.style.backgroundColor = '#2d2d30';
        });

        itemContainer.appendChild(header);
        itemContainer.appendChild(detailsContainer);

        return itemContainer;
    }

    private _renderDecalDetails(decal: DecalInfo, container: HTMLDivElement) {
        const table = document.createElement('div');
        table.style.fontFamily = 'monospace';
        table.style.fontSize = '11px';

        const keyWidth = this.config.sidebarWidth / 2;

        function addRow(key: string, value: any) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.padding = '3px 0';
            row.style.borderBottom = '1px solid #333';

            const keySpan = document.createElement('span');
            keySpan.textContent = key + ':';
            keySpan.style.color = '#9cdcfe';
            keySpan.style.fontWeight = 'bold';
            keySpan.style.minWidth = `${keyWidth}px`;
            keySpan.style.marginRight = '10px';

            const valueSpan = document.createElement('span');
            valueSpan.style.color = '#ce9178';
            valueSpan.style.wordBreak = 'break-all';

            if (typeof value === 'object' && value !== null) {
                valueSpan.textContent = JSON.stringify(value, null, 2);
                valueSpan.style.whiteSpace = 'pre-wrap';
            } else {
                valueSpan.textContent = String(value);
            }

            row.appendChild(keySpan);
            row.appendChild(valueSpan);
            table.appendChild(row);
        }

        function flattenObject(obj: any, prefix = '') {
            // converts nested objects into flat key-value pairs with dot notation
            const result: Record<string, any> = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null) {
                    Object.assign(result, flattenObject(value, newKey));
                } else {
                    result[newKey] = value;
                }
            }
            return result;
        }

        addRow((decal?.is_active ? '●' : '○') + ' Is active', decal.is_active);
        addRow((decal?.is_critical ? '▲' : '△') + ' Is critical', decal.is_critical);
        for (const [key, value] of Object.entries(flattenObject(decal.internal))) {
            addRow(key, value);
        }

        container.appendChild(table);
    }

    private async _updateSelection(elementType: ElementType, decalId: string) {
        // Clear previous selection highlight
        if (this.selectedElement) {
            const prevKey = `${this.selectedElement.type}_${this.selectedElement.id}`;
            const prevItem = this.renderedDecalItems.get(prevKey);
            if (prevItem) {
                const prevHeader = prevItem.children[0] as HTMLDivElement;
                prevHeader.style.backgroundColor = '#2d2d30';
                prevHeader.style.borderLeft = 'none';
            }
        }

        // Update selected element
        this.selectedElement = { type: elementType, id: decalId };

        // Highlight new selection
        const itemKey = `${elementType}_${decalId}`;
        const item = this.renderedDecalItems.get(itemKey);
        if (item) {
            const header = item.children[0] as HTMLDivElement;
            header.style.backgroundColor = '#094771';
            header.style.borderLeft = '3px solid #007acc';
            
            // Scroll into view
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    private async _handleCanvasSelection(elementType: ElementType, decalId: string) {
        const viewer = await this.viewer;

        // If selected element type doesn't match current tab, switch tabs
        if (this.currentElementType !== elementType) {
            const tab = this.tabButtons.get(elementType);
            if (tab) {
                tab.click();
                // Wait for tab switch to complete
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Ensure item is rendered
        await this._ensureDecalRendered(viewer, elementType, decalId);

        // Update selection highlight
        await this._updateSelection(elementType, decalId);
    }

    private async _ensureDecalRendered(viewer: Viewer, elementType: ElementType, decalId: string) {
        const itemKey = `${elementType}_${decalId}`;
        
        // Already rendered
        if (this.renderedDecalItems.has(itemKey)) {
            return;
        }

        if (!this.decalListElement) return;

        // Get all decal IDs and find the index of the selected one
        const allDecalIds = this.decalsCache.get(elementType);
        if (!allDecalIds) return;
        
        const selectedIndex = allDecalIds.indexOf(decalId);
        if (selectedIndex === -1) return;

        // Render batch
        const batchNumber = Math.floor(selectedIndex / NextPNRViewer.BATCH_SIZE);
        await this._renderDecalBatch(viewer, elementType, batchNumber);
    }

    private _createLoadMoreButton(
        viewer: Viewer,
        elementType: ElementType,
        batchIndex: number,
        label: string
    ): HTMLButtonElement {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.textContent = label;
        loadMoreBtn.style.margin = '10px';
        loadMoreBtn.style.padding = '8px';
        loadMoreBtn.style.backgroundColor = '#0e639c';
        loadMoreBtn.style.color = '#ffffff';
        loadMoreBtn.style.border = 'none';
        loadMoreBtn.style.borderRadius = '3px';
        loadMoreBtn.style.cursor = 'pointer';
        loadMoreBtn.style.fontSize = '11px';
        loadMoreBtn.style.fontWeight = 'bold';

        loadMoreBtn.addEventListener('mouseenter', () => {
            loadMoreBtn.style.backgroundColor = '#1177bb';
        });

        loadMoreBtn.addEventListener('mouseleave', () => {
            loadMoreBtn.style.backgroundColor = '#0e639c';
        });

        loadMoreBtn.addEventListener('click', async () => {
            await this._renderDecalBatch(viewer, elementType, batchIndex);
        });

        this.loadMoreButtons.set(batchIndex, loadMoreBtn);

        return loadMoreBtn;
    }
}
