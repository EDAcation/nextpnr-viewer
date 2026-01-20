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


// **** Config ****
type ColorConfig = {
    active: string;
    inactive: string;
    frame: string;
    background: string;
    critical: string;
    highlight: string;
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
        highlight: '#F8F8F2'
    },
    cellColors: {},
    chip: {
        family: 'ecp5',
        device: '25k'
    },
    sidebarWidth: 300
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
    private sidebar: HTMLDivElement;
    private canvasContainer: HTMLDivElement;
    private decalIdsCache: Map<ElementType, string[]> = new Map();
    private renderedDecalItems: Map<string, HTMLDivElement> = new Map();
    private selectedElement: { type: ElementType, id: string } | null = null;
    private currentElementType: ElementType | null = null;
    private loadedRanges: Map<ElementType, Array<[number, number]>> = new Map();
    private tabButtons: Map<ElementType, HTMLButtonElement> = new Map();

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
        };
        const cellColors: CellColorConfig = Object.fromEntries(
            Object.entries(this.config.cellColors).map(
                ([cell, colorStr]) => [cell, fromCssColor(colorStr)]
            )
        );

        this.container = container;
        const { canvasContainer, sidebar } = this._createLayout(container);
        this.canvasContainer = canvasContainer;
        this.sidebar = sidebar;
        this.canvas = this._createCanvas(canvasContainer);
        this._doResize(this.config.width, this.config.height);

        this.viewer = Promise.all([
            init(),
            getChipDb(url),
        ]).then(([_, db]) => new viewer(this.canvas, db, colors, cellColors));
        this.viewer.then(() => {
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
                e.offsetX,
                e.offsetY
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
                    viewer.pan(e.offsetX - oldx, e.offsetY - oldy);
                }

                firstEvent = false;
                oldx = e.offsetX;
                oldy = e.offsetY;
            }
        }));

        // Selection
        canvas.addEventListener('click', async (e) => {
            try {
                const selection = await viewer.select_at_coords(e.offsetX, e.offsetY);
                
                if (selection && Array.isArray(selection)) {
                    const elementType = selection[0] as ElementType;
                    const decalId = selection[1] as string;
                    
                    await this._handleCanvasSelection(elementType, decalId);
                }
            } catch (error) {
                console.error('Selection error:', error);
            }
        });
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
            // Clear rendered items map and update current type
            this.renderedDecalItems.clear();
            this.currentElementType = elementType;
            
            // Initialize loaded ranges for this element type
            if (!this.loadedRanges.has(elementType)) {
                this.loadedRanges.set(elementType, []);
            } else {
                this.loadedRanges.get(elementType)!.length = 0;
            }

            // Fetch and cache all decal IDs if not already cached
            if (!this.decalIdsCache.has(elementType)) {
                const decalIds = viewer.get_decal_ids(elementType);
                this.decalIdsCache.set(elementType, decalIds);
            }

            const decalIds = this.decalIdsCache.get(elementType)!;

            if (decalIds.length === 0) {
                container.innerHTML = '<div style="color: #888;">No decals found</div>';
                return;
            }

            container.innerHTML = '';

            // Create list container
            const list = document.createElement('div');
            list.style.display = 'flex';
            list.style.flexDirection = 'column';
            list.style.gap = '2px';

            // Create info header
            const info = document.createElement('div');
            info.style.padding = '8px';
            info.style.color = '#888';
            info.style.fontSize = '11px';
            info.style.borderBottom = '1px solid #333';
            info.style.marginBottom = '8px';
            info.textContent = `Total: ${decalIds.length} decals`;
            container.appendChild(info);

            container.appendChild(list);

            // Render first page
            this._renderDecalPage(viewer, elementType, decalIds, list, 0);
        } catch (error) {
            container.innerHTML = `<div style="color: #f44747;">Error: ${error}</div>`;
        }
    }

    private _addRange(elementType: ElementType, start: number, end: number) {
        const ranges = this.loadedRanges.get(elementType)!;
        ranges.push([start, end]);
        // Merge overlapping or adjacent ranges
        ranges.sort((a, b) => a[0] - b[0]);
        const merged: Array<[number, number]> = [];
        for (const [rangeStart, rangeEnd] of ranges) {
            if (merged.length === 0 || merged[merged.length - 1][1] < rangeStart) {
                merged.push([rangeStart, rangeEnd]);
            } else {
                merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], rangeEnd);
            }
        }
        this.loadedRanges.set(elementType, merged);
    }

    private _isIndexLoaded(elementType: ElementType, index: number): boolean {
        const ranges = this.loadedRanges.get(elementType);
        if (!ranges) return false;
        return ranges.some(([start, end]) => index >= start && index < end);
    }

    private _findGaps(elementType: ElementType, totalLength: number): Array<[number, number]> {
        const ranges = this.loadedRanges.get(elementType);
        if (!ranges || ranges.length === 0) {
            return [[0, totalLength]];
        }
        
        const gaps: Array<[number, number]> = [];
        
        // Gap before first range
        if (ranges[0][0] > 0) {
            gaps.push([0, ranges[0][0]]);
        }
        
        // Gaps between ranges
        for (let i = 0; i < ranges.length - 1; i++) {
            const gapStart = ranges[i][1];
            const gapEnd = ranges[i + 1][0];
            if (gapStart < gapEnd) {
                gaps.push([gapStart, gapEnd]);
            }
        }
        
        // Gap after last range
        const lastEnd = ranges[ranges.length - 1][1];
        if (lastEnd < totalLength) {
            gaps.push([lastEnd, totalLength]);
        }
        
        return gaps;
    }

    private _renderDecalPage(
        viewer: Viewer,
        elementType: ElementType,
        allDecalIds: string[],
        listContainer: HTMLDivElement,
        startIndex: number
    ) {
        const PAGE_SIZE = 100;
        const endIndex = Math.min(startIndex + PAGE_SIZE, allDecalIds.length);
        const decalsToRender = allDecalIds.slice(startIndex, endIndex);

        // Track loaded range
        this._addRange(elementType, startIndex, endIndex);

        // Render items for this page
        decalsToRender.forEach(decalId => {
            const item = this._createDecalItem(viewer, elementType, decalId);
            listContainer.appendChild(item);
        });

        // Add "Load items below" button if there are more items
        if (endIndex < allDecalIds.length) {
            const nextBatchSize = Math.min(PAGE_SIZE, allDecalIds.length - endIndex);
            const loadMoreBtn = this._createLoadMoreButton(
                viewer,
                elementType,
                allDecalIds,
                listContainer,
                endIndex,
                endIndex + nextBatchSize,
                `Load ${nextBatchSize} items below (${endIndex}-${endIndex + nextBatchSize - 1})`
            );
            listContainer.appendChild(loadMoreBtn);
        }
    }

    private _createDecalItem(viewer: Viewer, elementType: ElementType, decalId: string): HTMLDivElement {
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

        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.style.fontSize = '10px';
        arrow.style.transition = 'transform 0.2s';

        header.appendChild(label);
        header.appendChild(arrow);

        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'none';
        detailsContainer.style.paddingLeft = '15px';
        detailsContainer.style.paddingTop = '5px';
        detailsContainer.style.paddingBottom = '5px';

        let isExpanded = false;
        let detailsLoaded = false;

        header.addEventListener('click', async (e) => {
            // Select on canvas
            try {
                await viewer.select(elementType, decalId);
                await this._updateSelection(elementType, decalId);
                await viewer.render();
            } catch (error) {
                console.error('Error selecting decal:', error);
            }

            // Toggle expansion on second click if already selected
            if (this.selectedElement?.type === elementType && this.selectedElement?.id === decalId) {
                if (!isExpanded) {
                    // Expand
                    arrow.style.transform = 'rotate(90deg)';
                    detailsContainer.style.display = 'block';
                    isExpanded = true;

                    if (!detailsLoaded) {
                        detailsContainer.innerHTML = '<div style="color: #888; font-size: 11px;">Loading...</div>';
                        
                        try {
                            const decal = await viewer.get_decal(elementType, decalId);
                            
                            if (decal) {
                                detailsContainer.innerHTML = '';
                                this._renderDecalDetails(decal, detailsContainer);
                            } else {
                                detailsContainer.innerHTML = '<div style="color: #888; font-size: 11px;">No details available</div>';
                            }
                            
                            detailsLoaded = true;
                        } catch (error) {
                            detailsContainer.innerHTML = `<div style="color: #f44747; font-size: 11px;">Error: ${error}</div>`;
                        }
                    }
                } else {
                    // Collapse
                    arrow.style.transform = 'rotate(0deg)';
                    detailsContainer.style.display = 'none';
                    isExpanded = false;
                }
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

    private _renderDecalDetails(decal: any, container: HTMLDivElement) {
        const table = document.createElement('div');
        table.style.fontFamily = 'monospace';
        table.style.fontSize = '11px';

        const entries = Object.entries(decal);
        
        entries.forEach(([key, value]) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.padding = '3px 0';
            row.style.borderBottom = '1px solid #333';

            const keySpan = document.createElement('span');
            keySpan.textContent = key + ':';
            keySpan.style.color = '#9cdcfe';
            keySpan.style.fontWeight = 'bold';
            keySpan.style.minWidth = '80px';
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
        });

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

        // Check if item is already rendered
        const itemKey = `${elementType}_${decalId}`;
        if (!this.renderedDecalItems.has(itemKey)) {
            // Item not rendered yet - need to render it
            await this._ensureDecalRendered(viewer, elementType, decalId);
        }

        // Update selection highlight
        await this._updateSelection(elementType, decalId);
    }

    private async _ensureDecalRendered(viewer: Viewer, elementType: ElementType, decalId: string) {
        const itemKey = `${elementType}_${decalId}`;
        
        // Already rendered
        if (this.renderedDecalItems.has(itemKey)) {
            return;
        }

        // Find the list container
        const contentContainer = this.sidebar.children[1] as HTMLDivElement;
        const listContainer = contentContainer.children[1] as HTMLDivElement;
        
        if (!listContainer) return;

        // Get all decal IDs and find the index of the selected one
        const allDecalIds = this.decalIdsCache.get(elementType);
        if (!allDecalIds) return;
        
        const selectedIndex = allDecalIds.indexOf(decalId);
        if (selectedIndex === -1) return;

        const BATCH_SIZE = 100;

        // Calculate which batch contains the selected index
        const batchNumber = Math.floor(selectedIndex / BATCH_SIZE);
        const batchStartIndex = batchNumber * BATCH_SIZE;
        const batchEndIndex = Math.min(batchStartIndex + BATCH_SIZE, allDecalIds.length);

        // Find gaps around the batch we need to load
        const ranges = this.loadedRanges.get(elementType)!;
        
        // Find the end of the last loaded range before our batch (if any)
        let lastLoadedRangeEnd = 0;
        for (const [start, end] of ranges) {
            if (end <= batchStartIndex) {
                lastLoadedRangeEnd = end;
            }
        }
        
        // Find the start of the first loaded range after our batch (if any)
        let firstLoadedRangeStart = allDecalIds.length;
        for (const [start, end] of ranges) {
            if (start >= batchEndIndex) {
                firstLoadedRangeStart = start;
                break;
            }
        }

        // Find insertion point in DOM (before the first loaded after batch, or at end)
        let insertBeforeElement: HTMLElement | null = null;
        if (firstLoadedRangeStart < allDecalIds.length) {
            const insertBeforeKey = `${elementType}_${allDecalIds[firstLoadedRangeStart]}`;
            insertBeforeElement = this.renderedDecalItems.get(insertBeforeKey) || null;
        }

        // Remove any existing buttons in the gap before this batch
        if (lastLoadedRangeEnd > 0 && lastLoadedRangeEnd < batchStartIndex) {
            const lastLoadedKey = `${elementType}_${allDecalIds[lastLoadedRangeEnd - 1]}`;
            const lastLoadedElement = this.renderedDecalItems.get(lastLoadedKey);
            if (lastLoadedElement) {
                let nextSibling = lastLoadedElement.nextElementSibling;
                while (nextSibling && nextSibling.tagName === 'BUTTON' && nextSibling !== insertBeforeElement) {
                    const buttonToRemove = nextSibling;
                    nextSibling = nextSibling.nextElementSibling;
                    buttonToRemove.remove();
                }
            }
        }

        // Add "Load items below" button if there's a gap from last loaded to this batch
        if (lastLoadedRangeEnd < batchStartIndex) {
            const gapStart = lastLoadedRangeEnd;
            const gapEnd = batchStartIndex;
            const gapSize = gapEnd - gapStart;
            
            if (gapSize > 0) {
                // Load the first batch of the gap
                const nextBatchSize = Math.min(BATCH_SIZE, gapSize);
                
                const loadBtn = this._createLoadMoreButton(
                    viewer,
                    elementType,
                    allDecalIds,
                    listContainer,
                    gapStart,
                    gapStart + nextBatchSize,
                    `Load ${nextBatchSize} items below (${gapStart}-${gapStart + nextBatchSize - 1})`
                );
                
                // Insert before the newly loaded batch (which is itself before insertBeforeElement)
                if (insertBeforeElement) {
                    listContainer.insertBefore(loadBtn, insertBeforeElement);
                } else {
                    // Find the first item of the newly loaded batch
                    const firstNewItemKey = `${elementType}_${allDecalIds[batchStartIndex]}`;
                    const firstNewItem = this.renderedDecalItems.get(firstNewItemKey);
                    if (firstNewItem) {
                        listContainer.insertBefore(loadBtn, firstNewItem);
                    } else {
                        listContainer.appendChild(loadBtn);
                    }
                }
            }
        }

        // Load the entire batch containing the selected item
        this._addRange(elementType, batchStartIndex, batchEndIndex);
        
        for (let i = batchStartIndex; i < batchEndIndex; i++) {
            const decalIdToRender = allDecalIds[i];
            const existingKey = `${elementType}_${decalIdToRender}`;
            
            // Only create if not already rendered
            if (!this.renderedDecalItems.has(existingKey)) {
                const item = this._createDecalItem(viewer, elementType, decalIdToRender);
                
                // Add indicator only to the originally selected item
                if (i === selectedIndex) {
                    const header = item.children[0] as HTMLDivElement;
                    const indicator = document.createElement('span');
                    indicator.textContent = '🔍 ';
                    indicator.style.marginRight = '5px';
                    header.insertBefore(indicator, header.firstChild);
                }
                
                if (insertBeforeElement) {
                    listContainer.insertBefore(item, insertBeforeElement);
                } else {
                    listContainer.appendChild(item);
                }
            }
        }

        // Add "Load items above" button if there's a gap from this batch to first loaded after
        if (firstLoadedRangeStart > batchEndIndex) {
            const gapStart = batchEndIndex;
            const gapEnd = firstLoadedRangeStart;
            const gapSize = gapEnd - gapStart;
            
            if (gapSize > 0) {
                // Load the first batch of the gap
                const nextBatchSize = Math.min(BATCH_SIZE, gapSize);
                
                const loadBtn = this._createLoadMoreButton(
                    viewer,
                    elementType,
                    allDecalIds,
                    listContainer,
                    gapStart,
                    gapStart + nextBatchSize,
                    `Load ${nextBatchSize} items below (${gapStart}-${gapStart + nextBatchSize - 1})`
                );
                
                if (insertBeforeElement) {
                    listContainer.insertBefore(loadBtn, insertBeforeElement);
                } else {
                    listContainer.appendChild(loadBtn);
                }
            }
        }
    }

    private _createLoadMoreButton(
        viewer: Viewer,
        elementType: ElementType,
        allDecalIds: string[],
        listContainer: HTMLDivElement,
        startIndex: number,
        endIndex: number,
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

        loadMoreBtn.addEventListener('click', () => {
            const decalsToLoad = allDecalIds.slice(startIndex, endIndex);
            
            // Find insertion point for the first item (before the button)
            let insertPoint = loadMoreBtn;
            
            // Load all items in this range
            this._addRange(elementType, startIndex, endIndex);
            decalsToLoad.forEach((decalId) => {
                const item = this._createDecalItem(viewer, elementType, decalId);
                listContainer.insertBefore(item, insertPoint);
            });
            
            // Remove the button
            loadMoreBtn.remove();
            
            // Find gaps after loading this range
            const BATCH_SIZE = 100;
            const ranges = this.loadedRanges.get(elementType)!;
            
            // Find the start of the first loaded range after our newly loaded range
            let nextLoadedRangeStart = allDecalIds.length;
            for (const [start, end] of ranges) {
                if (start >= endIndex) {
                    nextLoadedRangeStart = start;
                    break;
                }
            }
            
            // Check if there's still a gap after the range we just loaded
            if (nextLoadedRangeStart > endIndex) {
                const gapSize = nextLoadedRangeStart - endIndex;
                const nextBatchSize = Math.min(BATCH_SIZE, gapSize);
                
                const newBtn = this._createLoadMoreButton(
                    viewer,
                    elementType,
                    allDecalIds,
                    listContainer,
                    endIndex,
                    endIndex + nextBatchSize,
                    `Load ${nextBatchSize} items below (${endIndex}-${endIndex + nextBatchSize - 1})`
                );
                
                // Find where to insert the new button
                if (nextLoadedRangeStart < allDecalIds.length) {
                    const nextLoadedKey = `${elementType}_${allDecalIds[nextLoadedRangeStart]}`;
                    const nextLoadedElement = this.renderedDecalItems.get(nextLoadedKey);
                    if (nextLoadedElement) {
                        listContainer.insertBefore(newBtn, nextLoadedElement);
                    } else {
                        listContainer.appendChild(newBtn);
                    }
                } else {
                    listContainer.appendChild(newBtn);
                }
            }
        });

        return loadMoreBtn;
    }
}
