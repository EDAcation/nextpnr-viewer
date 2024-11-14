import {getElementGroups} from 'edacation';
import {get_wasm_viewer} from 'nextpnr-viewer';

window.onload = () => {
    const div: HTMLDivElement | null = document.querySelector('#viewer-container');
    if (div === null) {
        console.error('Cannot find canvas');
        return;
    }

    const file_upload: HTMLInputElement | null = document.querySelector('#json-file');
    if (file_upload === null) {
        console.error('Cannot find file upload input');
        return;
    }

    // Get example cell colors from EDAcation library
    const cellColors = {};
    for (const elemGroup of getElementGroups().values()) {
        for (const elem of elemGroup.elements) {
            cellColors[elem] = elemGroup.color;
        }
    }

    const canvas = document.createElement('canvas');
    div.appendChild(canvas);

    canvas.style.width = `${1920}px`;
    canvas.style.height = `${1080}px`;
    canvas.style.display = 'flex';
    canvas.style.flexDirection = 'column';
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // const nextpnrViewer = viewer(div, {
    //     width: 1920,
    //     height: 1080,
    //     chip: {
    //         family: 'ecp5',
    //         device: '85k'
    //     },
    //     cellColors: cellColors
    // });
    get_wasm_viewer(canvas, '85k').then((viewer) => {
        viewer.render();
        // setInterval(() => viewer.zoom(0.05, 0, 0), 100);
    });

    // file_upload.addEventListener('change', (e) => {
    //     if (e.target !== file_upload || file_upload.files === null) {
    //         return;
    //     }

    //     file_upload.files[0].text().then((t) => nextpnrViewer.showJson(t));
    // });
};
