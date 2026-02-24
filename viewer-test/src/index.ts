import {getElementGroups} from 'edacation/dist/project/groups';
import {NextPNRViewer, SUPPORTED_DEVICES, SupportedFamily} from 'nextpnr-viewer';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getCellColors(): Record<string, string> {
    const colors: Record<string, string> = {};
    for (const group of getElementGroups().values()) {
        for (const elem of group.elements) {
            colors[elem] = group.color;
        }
    }
    return colors;
}

/** Returns the devices list for a given family, capitalised for display. */
function devicesForFamily(family: SupportedFamily): string[] {
    return Object.keys(SUPPORTED_DEVICES[family]);
}

// ── State ─────────────────────────────────────────────────────────────────────

interface AppState {
    family: SupportedFamily;
    device: string;
    placeFile: File | null;
    reportFile: File | null;
    viewer: NextPNRViewer | null;
}

const state: AppState = {
    family: 'ice40',
    device: 'hx1k',
    placeFile: null,
    reportFile: null,
    viewer: null
};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const setupPage = document.getElementById('setup-page')! as HTMLDivElement;
const viewerPage = document.getElementById('viewer-page')! as HTMLDivElement;
const viewerContainer = document.getElementById('viewer-container')! as HTMLDivElement;

const familySelect = document.getElementById('chip-family')! as HTMLSelectElement;
const deviceSelect = document.getElementById('chip-device')! as HTMLSelectElement;
const exampleSelect = document.getElementById('example-select')! as HTMLSelectElement;

const placeInput = document.getElementById('place-json-input')! as HTMLInputElement;
const reportInput = document.getElementById('report-json-input')! as HTMLInputElement;
const placeLabel = document.getElementById('place-label')! as HTMLLabelElement;
const reportLabel = document.getElementById('report-label')! as HTMLLabelElement;
const placeNameEl = document.getElementById('place-name')! as HTMLSpanElement;
const reportNameEl = document.getElementById('report-name')! as HTMLSpanElement;

const submitBtn = document.getElementById('submit-btn')! as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn')! as HTMLButtonElement;
const viewerResetBtn = document.getElementById('viewer-reset-btn')! as HTMLButtonElement;

// ── Chip selector ─────────────────────────────────────────────────────────────

function populateDevices(family: SupportedFamily) {
    deviceSelect.innerHTML = '';
    for (const dev of devicesForFamily(family)) {
        const opt = document.createElement('option');
        opt.value = dev;
        opt.textContent = dev;
        deviceSelect.appendChild(opt);
    }
    // Try to keep the previous device selected if it exists in the new family
    if (devicesForFamily(family).includes(state.device)) {
        deviceSelect.value = state.device;
    } else {
        state.device = devicesForFamily(family)[0];
        deviceSelect.value = state.device;
    }
}

familySelect.addEventListener('change', () => {
    state.family = familySelect.value as SupportedFamily;
    populateDevices(state.family);
});

deviceSelect.addEventListener('change', () => {
    state.device = deviceSelect.value;
});

// Initialise device list on load
populateDevices(state.family);
familySelect.value = state.family;

// ── Examples ──────────────────────────────────────────────────────────────────

interface Example {
    label: string;
    family: SupportedFamily;
    device: string;
    placeUrl: URL;
    reportUrl: URL;
}

const EXAMPLES: Record<string, Example> = {
    'ice40-lp8k': {
        label: 'iCE40 LP8K',
        family: 'ice40',
        device: 'lp8k',
        placeUrl: new URL('../../examples/ice40-lp8k/place.json', import.meta.url),
        reportUrl: new URL('../../examples/ice40-lp8k/report.json', import.meta.url)
    },
    'ecp5-12k': {
        label: 'ECP5 12K',
        family: 'ecp5',
        device: '12k',
        placeUrl: new URL('../../examples/ecp5-12k/place.json', import.meta.url),
        reportUrl: new URL('../../examples/ecp5-12k/report.json', import.meta.url)
    }
};

exampleSelect.addEventListener('change', async () => {
    const value = exampleSelect.value;
    if (!value) return;

    const example = EXAMPLES[value];
    if (!example) return;

    exampleSelect.disabled = true;
    try {
        const [placeText, reportText] = await Promise.all([
            fetch(example.placeUrl).then((r) => r.text()),
            fetch(example.reportUrl).then((r) => r.text())
        ]);

        state.family = example.family;
        state.device = example.device;
        familySelect.value = example.family;
        populateDevices(example.family);
        deviceSelect.value = example.device;

        state.placeFile = new File([placeText], `${example.label} — place.json`, {type: 'application/json'});
        state.reportFile = new File([reportText], `${example.label} — report.json`, {type: 'application/json'});
    } finally {
        exampleSelect.disabled = false;
        updateUI();
    }
});

// ── File pickers ──────────────────────────────────────────────────────────────

function setFileLabelState(
    label: HTMLLabelElement,
    nameEl: HTMLSpanElement,
    file: File | null,
    placeholder: string,
    disabled: boolean
) {
    label.classList.toggle('disabled', disabled);
    label.classList.toggle('has-file', file !== null);
    nameEl.textContent = file ? file.name : placeholder;
    // When disabled the underlying <input> is also disabled so the label click does nothing.
}

placeInput.addEventListener('change', () => {
    state.placeFile = placeInput.files?.[0] ?? null;
    // If place is cleared, report must be cleared too
    if (!state.placeFile) {
        state.reportFile = null;
        reportInput.value = '';
    }
    updateUI();
});

reportInput.addEventListener('change', () => {
    state.reportFile = reportInput.files?.[0] ?? null;
    updateUI();
});

// ── UI state machine ──────────────────────────────────────────────────────────

type ViewState = 'ready' | 'rendering';

function getViewState(): ViewState {
    if (state.viewer !== null) return 'rendering';
    return 'ready';
}

function updateUI() {
    const vs = getViewState();
    const isRendering = vs === 'rendering';
    const reportDisabled = isRendering || state.placeFile === null;

    // Controls enabled/disabled
    familySelect.disabled = isRendering;
    deviceSelect.disabled = isRendering;
    exampleSelect.disabled = isRendering;
    placeInput.disabled = isRendering;
    reportInput.disabled = reportDisabled;
    submitBtn.disabled = isRendering;
    resetBtn.disabled = isRendering; // show reset only in viewer

    setFileLabelState(placeLabel, placeNameEl, state.placeFile, 'Choose place.json\u2026', isRendering);
    setFileLabelState(reportLabel, reportNameEl, state.reportFile, 'Choose report.json\u2026', reportDisabled);
}

// ── Submit / Reset ────────────────────────────────────────────────────────────

submitBtn.addEventListener('click', async () => {
    // Disable everything while we load
    submitBtn.disabled = true;

    const placeJson = state.placeFile ? JSON.parse(await state.placeFile.text()) : undefined;
    const reportJson = state.reportFile ? JSON.parse(await state.reportFile.text()) : undefined;

    // Switch to viewer view
    setupPage.style.display = 'none';
    viewerPage.style.display = 'block';

    const w = viewerPage.clientWidth;
    const h = viewerPage.clientHeight;

    state.viewer = new NextPNRViewer(viewerContainer, {
        width: w,
        height: h,
        chip: {family: state.family, device: state.device as any},
        cellColors: getCellColors(),
        sidebarWidth: 300
    });

    await state.viewer.render();
    if (placeJson) {
        await state.viewer.showJson(placeJson, reportJson);
    }
    updateUI();
});

function doReset() {
    // Tear down the viewer
    state.viewer = null;
    viewerContainer.innerHTML = '';

    // Clear file state
    state.placeFile = null;
    state.reportFile = null;
    placeInput.value = '';
    reportInput.value = '';

    // Switch back to setup
    viewerPage.style.display = 'none';
    setupPage.style.display = '';

    updateUI();
}

resetBtn.addEventListener('click', doReset);
viewerResetBtn.addEventListener('click', doReset);

// ── Resize handling ───────────────────────────────────────────────────────────

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
window.addEventListener('resize', () => {
    if (!state.viewer) return;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(async () => {
        if (!state.viewer) return;
        await state.viewer.resize(viewerPage.clientWidth, viewerPage.clientHeight);
    }, 100);
});

// ── Boot ──────────────────────────────────────────────────────────────────────

updateUI();
