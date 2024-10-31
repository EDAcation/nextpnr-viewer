import init, {do_something} from 'nextpnr-renderer';
import {ReplaySubject, first, lastValueFrom} from 'rxjs';

import {ECP5Arch} from './architecture/ecp5.arch';
import {ChipInfoPODImpl} from './chipdb/ecp5-impl.chipdb';
import {ECP5DecalID} from './decal/ecp5.decalid';
import {Renderer} from './renderer';
import {Renderer as RendererInterface} from './renderer.interface';
import {ViewerConfig, NextPNRViewer as ViewerInterface, defaultConfig} from './viewer.interface';

async function getChipDb(db: '25k' | '45k' | '85k'): Promise<ECP5Arch> {
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
    let dataview = new DataView(chipdb);
    const impl = new ChipInfoPODImpl(new DataView(dataview.buffer, dataview.getInt32(0, true)));

    return new ECP5Arch(impl);
}

export class NextPNRViewer implements ViewerInterface {
    private _renderer: ReplaySubject<Renderer<ECP5DecalID>> = new ReplaySubject<Renderer<ECP5DecalID>>(1);
    private _canvas: HTMLCanvasElement;
    private _config: ViewerConfig;

    constructor(
        private _element: HTMLDivElement,
        config?: Partial<ViewerConfig>
    ) {
        this._config = {...defaultConfig, ...config};

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.id = 'nextpnr-viewer';

        this._element.appendChild(canvas);
        this._canvas = canvas;

        init().then(() => {
            const i = do_something();
            alert(i);

            getChipDb(this._config.chip.device).then((arch: ECP5Arch) => {
                const renderer = new Renderer(canvas, arch, this._config.colors, this._config.cellColors);
                this._renderer.next(renderer);

                this._addEventListeners(canvas);
                const toggleDefaults = {
                    showWires: true,
                    showGroups: true,
                    showBels: true
                };

                if (this._config.createToggles) this._createToggles(toggleDefaults);

                this.resize(this._config.width, this._config.height);
                renderer.changeViewMode(toggleDefaults);
            });
        });
    }

    private _createToggles(defaults: {showWires: boolean; showGroups: boolean; showBels: boolean}) {
        const toggleContainer = document.createElement('div');

        this._createToggle(
            'show_wires',
            'Show Wires',
            (r, v) => {
                r.changeViewMode({showWires: v});
                r.render();
            },
            defaults.showWires,
            toggleContainer
        );
        this._createToggle(
            'show_groups',
            'Show Groups',
            (r, v) => {
                r.changeViewMode({showGroups: v});
                r.render();
            },
            defaults.showGroups,
            toggleContainer
        );
        this._createToggle(
            'show_bels',
            'Show BELs',
            (r, v) => {
                r.changeViewMode({showBels: v});
                r.render();
            },
            defaults.showBels,
            toggleContainer
        );

        this._element.appendChild(toggleContainer);
    }

    private _createToggle(
        toggle_id: string,
        toggle_description: string,
        toggle_action: (renderer: RendererInterface, value: boolean) => void,
        default_state: boolean,
        elem: HTMLElement
    ) {
        const inputElement: HTMLInputElement = document.createElement('input');
        inputElement.id = toggle_id;
        inputElement.type = 'checkbox';
        inputElement.name = toggle_id;
        inputElement.checked = default_state;

        inputElement.addEventListener('change', (v) => {
            const res = (v.target as {checked: boolean} | null)?.checked;
            if (res === undefined) throw 'no checked attribute on toggle?';

            this._renderer
                .asObservable()
                .pipe(first())
                .subscribe((renderer) => toggle_action(renderer, res));
        });

        const labelElement: HTMLLabelElement = document.createElement('label');
        labelElement.setAttribute('for', inputElement.name);
        labelElement.innerHTML = toggle_description;

        elem.appendChild(inputElement);
        elem.appendChild(labelElement);
    }

    private _addEventListeners(canvas: HTMLCanvasElement) {
        let down = false;
        let firstEvent = true;
        let oldx = 0;
        let oldy = 0;
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY === 0) return;
            this._renderer
                .asObservable()
                .pipe(first())
                .subscribe((renderer) => {
                    renderer.zoom(
                        e.deltaY > 0 ? 0.05 : -0.05,
                        e.clientX - canvas.offsetLeft,
                        e.clientY - canvas.offsetTop
                    );
                });
        });
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
                    this._renderer
                        .asObservable()
                        .pipe(first())
                        .subscribe((renderer) => {
                            renderer.pan(e.clientX - oldx, e.clientY - oldy);
                        });
                }

                firstEvent = false;
                oldx = e.clientX;
                oldy = e.clientY;
            }
        });
    }

    public get renderer(): Promise<RendererInterface> {
        return lastValueFrom(this._renderer.asObservable());
    }

    public showJson(jsonString: string) {
        this._renderer
            .asObservable()
            .pipe(first())
            .subscribe((renderer) => {
                renderer.loadJson(jsonString);
            });
    }

    public resize(width: number, height: number) {
        this._element.style.width = `${width}px`;
        this._element.style.height = `${height}px`;
        this._element.style.display = 'flex';
        this._element.style.flexDirection = 'column';

        this._canvas.style.flexGrow = '1';

        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;

        this._renderer
            .asObservable()
            .pipe(first())
            .subscribe((renderer) => {
                renderer.render();
            });
    }
}
