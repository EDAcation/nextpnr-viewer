import { ViewerConfig, defaultConfig, NextPNRViewer as ViewerInterface } from './viewer.interface';
import { Renderer as RendererInterface } from './renderer.interface';
import { Renderer } from './renderer';
import { ChipInfoPODImpl } from './chipdb/ecp5-impl.chipdb';
import { ECP5Arch } from './architecture/ecp5.arch';
import { ECP5DecalID } from './decal/ecp5.decalid';
// @ts-ignore
import chipdb from 'array-buffer:./chipdb/ecp5-bins/chipdb-25k.bin';

function getChipDb(): ECP5Arch {
    let dataview = new DataView(chipdb);
    const impl = new ChipInfoPODImpl(new DataView(dataview.buffer, dataview.getInt32(0, true)));

    return new ECP5Arch(impl);
}

export class NextPNRViewer implements ViewerInterface {
    private _renderer: Renderer<ECP5DecalID>;
    private _canvas: HTMLCanvasElement;
    private _config: ViewerConfig;

    constructor(
        private _element: HTMLDivElement,
        config?: Partial<ViewerConfig>
    ) {
        this._config = { ...defaultConfig, ...config };

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.id = 'nextpnr-viewer';

        this._element.appendChild(canvas);
        this._canvas = canvas;

        //const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        //if (context === null) throw 'unable to create canvas';

        this._renderer = new Renderer(canvas, getChipDb(), this._config.colors);
        this._addEventListeners(canvas);
        const toggleDefaults = {
            showWires: true,
            showGroups: true,
            showBels: true,
            noSmallWires: true
        };

        if (this._config.createToggles) this._createToggles(toggleDefaults);

        this.resize(this._config.width, this._config.height);
        this._renderer.changeViewMode(toggleDefaults); // This also forces the first render
    }

    private _createToggles(defaults: {
                               showWires: boolean,
                               showGroups: boolean,
                               showBels: boolean,
                               noSmallWires: boolean
                           }) {
        this._element.appendChild(document.createElement('br'));
        this._createToggle(
            'show_wires',
            'Show Wires',
            (r, v) => r.changeViewMode({showWires: v}),
            defaults.showWires
        );
        this._createToggle(
            'show_groups',
            'Show Groups',
            (r, v) => r.changeViewMode({showGroups: v}),
            defaults.showGroups
        );
        this._createToggle(
            'show_bels',
            'Show BELs',
            (r, v) => r.changeViewMode({showBels: v}),
            defaults.showBels
        );
        this._createToggle(
            'no_small_wires',
            'Don\'t show small wires (improves performance)',
            (r, v) => r.changeViewMode({noSmallWires: v}),
            defaults.noSmallWires
        );
    }

    private _createToggle(
        toggle_id: string,
        toggle_description: string,
        toggle_action: (renderer: RendererInterface, value: boolean) => void,
        default_state: boolean
    ) {
        const inputElement: HTMLInputElement = document.createElement('input');
        inputElement.id = toggle_id;
        inputElement.type = 'checkbox';
        inputElement.name = toggle_id;
        inputElement.checked = default_state;

        inputElement.addEventListener('change', v => {
            const res = (v.target as {checked: boolean}|null)?.checked;
            if (res === undefined) throw 'no checked attribute on toggle?';

            toggle_action(this._renderer, res);
        });

        const labelElement: HTMLLabelElement = document.createElement('label');
        labelElement.setAttribute('for', inputElement.name);
        labelElement.innerHTML = toggle_description;

        this._element.appendChild(inputElement);
        this._element.appendChild(labelElement);
    }

    private _addEventListeners(canvas: HTMLCanvasElement) {
        let down = false;
        let first = true;
        let oldx = 0;
        let oldy = 0;
        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            if (e.deltaY === 0) return;
            this._renderer.zoom(e.deltaY > 0 ? 0.05 : -0.05, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        });
        canvas.addEventListener('mousedown', _ => { down = true; first = true; });
        canvas.addEventListener('mouseup', _ => { down = false; });
        canvas.addEventListener('mousemove', e => {
            if (down) {
                if (!first) {
                    this._renderer.pan(e.clientX - oldx, e.clientY - oldy);
                }

                first = false;
                oldx = e.clientX;
                oldy = e.clientY;
            }
        });
    }

    public get renderer(): RendererInterface {
        return this._renderer;
    }

    public showJson(jsonString: string) {
        this._renderer.loadJson(jsonString);
    }

    public resize(width: number, height: number) {
        this._canvas.width = width;
        this._canvas.height = height;

        this._renderer.render();
    }
}
