import {getElementGroups} from 'edacation/dist/project/groups';
import {NextPNRViewer} from 'nextpnr-viewer';

window.onload = () => {
    const container: HTMLDivElement | null = document.querySelector('#viewer');
    if (container === null) {
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

    let nextpnrViewer: NextPNRViewer | undefined = undefined;

    file_upload.addEventListener('change', (e) => {
        if (e.target !== file_upload || file_upload.files === null) {
            return;
        }

        file_upload.files[0].text().then((t) => {
            const data = JSON.parse(t);

            if (!nextpnrViewer) {
                nextpnrViewer = new NextPNRViewer(container, {
                    width: 1920,
                    height: 1080,
                    chip: data.chip,
                    cellColors: cellColors
                });
                nextpnrViewer.render();
            }

            nextpnrViewer.showJson(data['data'], data['report']);
        });
    });
};
