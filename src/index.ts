import { Subject, Observable } from 'rxjs';
import { Renderer } from './renderer';
import { ChipInfoPODImpl } from './chipdb-new/ecp5-impl.chipdb';
import { ECP5Arch } from './architecture/ecp5.arch';

function getChipDb(url: string): Observable<ECP5Arch> {
    const subject: Subject<ECP5Arch> = new Subject<ECP5Arch>();

    var fileReq = new XMLHttpRequest();
    fileReq.responseType = 'arraybuffer';
    fileReq.open("GET", url);
    fileReq.onreadystatechange = _ => {
        if (fileReq.readyState === 4) {
            if (fileReq.status === 200 || fileReq.status === 0) {
                let arraybuffer = fileReq.response;
                let dataview = new DataView(arraybuffer);
                const impl = new ChipInfoPODImpl(new DataView(dataview.buffer, dataview.getInt32(0, true)));
                const arch = new ECP5Arch(impl);

                subject.next(arch);
            }
        }
    };
    fileReq.send(null);

    return subject.asObservable();
}

window.onload = () => {
    const canvas: HTMLCanvasElement|null = document.querySelector('#main-canvas');
    if (canvas === null) { console.error("Cannot find canvas"); return; }

    const context: CanvasRenderingContext2D|null = canvas.getContext("2d");
    if (context === null) { console.error("Cannot get context"); return; }


    getChipDb("http://localhost:5000/chipdb.bin").subscribe(arch => {
        const renderer = new Renderer(context, arch);

        canvas.addEventListener('wheel', e => {
            e.preventDefault();
            if (e.deltaY === 0) return;
            renderer.zoom(e.deltaY > 0 ? 0.1 : -0.1, e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        });

        let down = false;
        let first = true;
        let oldx = 0;
        let oldy = 0;
        canvas.addEventListener('mousedown', e => { down = true; first = true; });
        canvas.addEventListener('mouseup', e => { down = false; });
        canvas.addEventListener('mousemove', e => {
            if (down) {
                if (!first) {
                    renderer.pan(e.clientX - oldx, e.clientY - oldy);
                }

                first = false;
                oldx = e.clientX;
                oldy = e.clientY;
            }
        });

        renderer.render();

        document.querySelector("#show_wires")?.addEventListener('change', v => {
            const res = (v.target as {checked: boolean}|null)?.checked;
            renderer.config.showWires = res ? res : false;
            renderer.render();
        });
        document.querySelector("#show_groups")?.addEventListener('change', v => {
            const res = (v.target as {checked: boolean}|null)?.checked;
            renderer.config.showGroups = res ? res : false;
            renderer.render();
        });
        document.querySelector("#show_bels")?.addEventListener('change', v => {
            const res = (v.target as {checked: boolean}|null)?.checked;
            renderer.config.showBels = res ? res : false;
            renderer.render();
        });
    });
};
