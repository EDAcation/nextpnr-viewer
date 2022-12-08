import viewer from 'nextpnr-viewer';
import placejson from '../../place.json';

window.onload = () => {
    const div: HTMLDivElement|null = document.querySelector('#viewer-container');
    if (div === null) { console.error("Cannot find canvas"); return; }

    const nextpnrViewer = viewer(div, {width: 1280, height: 720});
    nextpnrViewer.showJson(placejson);
};
