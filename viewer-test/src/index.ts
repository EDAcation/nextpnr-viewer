import viewer from 'nextpnr-viewer';

window.onload = () => {
    const canvas: HTMLCanvasElement|null = document.querySelector('#main-canvas');
    if (canvas === null) { console.error("Cannot find canvas"); return; }

    const context: CanvasRenderingContext2D|null = canvas.getContext("2d");
    if (context === null) { console.error("Cannot get context"); return; }

    const renderer = viewer(context);

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
    document.querySelector("#no_small_wires")?.addEventListener('change', v => {
        const res = (v.target as {checked: boolean}|null)?.checked;
        renderer.config.noSmallWires = res ? res : false;
        renderer.render();
    });
};
