import {getElementGroups} from 'edacation/dist/project/groups';
import {NextPNRViewer, NextpnrJson, ReportJson, SUPPORTED_DEVICES, SupportedFamily} from 'nextpnr-viewer';

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

function devicesForFamily(family: SupportedFamily): string[] {
    return Object.keys(SUPPORTED_DEVICES[family]);
}

// ── State ─────────────────────────────────────────────────────────────────────

type Mode = 'browse' | 'example' | 'nextpnr' | 'edacation';

interface AppState {
    mode: Mode;
    family: SupportedFamily;
    device: string;
    // example mode – pre-fetched example data
    examplePlace: File | null;
    exampleReport: File | null;
    exampleChip: {family: SupportedFamily; device: string} | null;
    // nextpnr mode – user-supplied files
    placeFile: File | null;
    reportFile: File | null;
    // EDAcation mode
    edaFile: File | null;
    edaChip: {family: SupportedFamily; device: string} | null;
    edaError: string | null;
    // viewer
    viewer: NextPNRViewer | null;
}

const state: AppState = {
    mode: 'browse',
    family: 'ice40',
    device: 'hx1k',
    examplePlace: null,
    exampleReport: null,
    exampleChip: null,
    placeFile: null,
    reportFile: null,
    edaFile: null,
    edaChip: null,
    edaError: null,
    viewer: null
};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const setupPage = document.getElementById('setup-page')! as HTMLDivElement;
const viewerPage = document.getElementById('viewer-page')! as HTMLDivElement;
const viewerContainer = document.getElementById('viewer-container')! as HTMLDivElement;

// Mode tabs
const modeTabs = document.getElementById('mode-tabs')! as HTMLDivElement;
const chipSection = document.getElementById('chip-section')! as HTMLDivElement;
const panelExample = document.getElementById('panel-example')! as HTMLDivElement;
const panelNextpnr = document.getElementById('panel-nextpnr')! as HTMLDivElement;
const panelEdacation = document.getElementById('panel-edacation')! as HTMLDivElement;

// Chip selectors
const familySelect = document.getElementById('chip-family')! as HTMLSelectElement;
const deviceSelect = document.getElementById('chip-device')! as HTMLSelectElement;

// Browse panel
const exampleSelect = document.getElementById('example-select')! as HTMLSelectElement;

// nextpnr panel
const placeInput = document.getElementById('place-json-input')! as HTMLInputElement;
const reportInput = document.getElementById('report-json-input')! as HTMLInputElement;
const placeLabel = document.getElementById('place-label')! as HTMLLabelElement;
const reportLabel = document.getElementById('report-label')! as HTMLLabelElement;
const placeNameEl = document.getElementById('place-name')! as HTMLSpanElement;
const reportNameEl = document.getElementById('report-name')! as HTMLSpanElement;
const placeRemoveBtn = document.getElementById('place-remove-btn')! as HTMLButtonElement;
const reportRemoveBtn = document.getElementById('report-remove-btn')! as HTMLButtonElement;

// EDAcation panel
const edaInput = document.getElementById('eda-json-input')! as HTMLInputElement;
const edaLabel = document.getElementById('eda-label')! as HTMLLabelElement;
const edaNameEl = document.getElementById('eda-name')! as HTMLSpanElement;
const edaRemoveBtn = document.getElementById('eda-remove-btn')! as HTMLButtonElement;
const edaChipInfo = document.getElementById('eda-chip-info')! as HTMLDivElement;
const edaChipValue = document.getElementById('eda-chip-value')! as HTMLSpanElement;
const edaChipError = document.getElementById('eda-chip-error')! as HTMLDivElement;
const edaChipErrorMsg = document.getElementById('eda-chip-error-msg')! as HTMLSpanElement;

// Example panel
const exampleChipInfo = document.getElementById('example-chip-info')! as HTMLDivElement;
const exampleChipValue = document.getElementById('example-chip-value')! as HTMLSpanElement;

// Buttons
const submitBtn = document.getElementById('submit-btn')! as HTMLButtonElement;
const viewerResetBtn = document.getElementById('viewer-reset-btn')! as HTMLButtonElement;

// ── Mode switching ────────────────────────────────────────────────────────────

function switchMode(mode: Mode) {
    state.mode = mode;

    for (const tab of modeTabs.querySelectorAll<HTMLButtonElement>('.mode-tab')) {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    }

    // Hide chip selector for modes where chip comes from file/example
    chipSection.style.display = mode === 'edacation' || mode === 'example' ? 'none' : '';

    panelExample.style.display = mode === 'example' ? 'flex' : 'none';
    panelNextpnr.style.display = mode === 'nextpnr' ? 'flex' : 'none';
    panelEdacation.style.display = mode === 'edacation' ? 'flex' : 'none';

    updateUI();
}

modeTabs.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.mode-tab');
    if (!btn || state.viewer) return;
    switchMode(btn.dataset.mode as Mode);
});

// ── Chip selector ─────────────────────────────────────────────────────────────

function populateDevices(family: SupportedFamily) {
    deviceSelect.innerHTML = '';
    for (const dev of devicesForFamily(family)) {
        const opt = document.createElement('option');
        opt.value = dev;
        opt.textContent = dev;
        deviceSelect.appendChild(opt);
    }
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

populateDevices(state.family);
familySelect.value = state.family;

// ── Examples (Example mode) ────────────────────────────────────────────────────

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

    if (!value) {
        state.examplePlace = null;
        state.exampleReport = null;
        state.exampleChip = null;
        updateUI();
        return;
    }

    const example = EXAMPLES[value];
    if (!example) return;

    exampleSelect.disabled = true;
    try {
        const [placeText, reportText] = await Promise.all([
            fetch(example.placeUrl).then((r) => r.text()),
            fetch(example.reportUrl).then((r) => r.text())
        ]);

        // Intentionally do NOT update the family/device dropdowns — chip comes from the example.
        state.exampleChip = {family: example.family, device: example.device};
        state.examplePlace = new File([placeText], `${example.label} — place.json`, {type: 'application/json'});
        state.exampleReport = new File([reportText], `${example.label} — report.json`, {type: 'application/json'});
    } finally {
        exampleSelect.disabled = false;
        updateUI();
    }
});

// ── nextpnr file pickers ──────────────────────────────────────────────────────

function setFileLabelState(
    label: HTMLLabelElement,
    nameEl: HTMLSpanElement,
    removeBtn: HTMLButtonElement,
    file: File | null,
    placeholder: string,
    disabled: boolean
) {
    label.classList.toggle('disabled', disabled);
    label.classList.toggle('has-file', file !== null);
    nameEl.textContent = file ? file.name : placeholder;
    removeBtn.disabled = disabled || file === null;
}

placeInput.addEventListener('change', () => {
    state.placeFile = placeInput.files?.[0] ?? null;
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

placeRemoveBtn.addEventListener('click', () => {
    state.placeFile = null;
    state.reportFile = null;
    placeInput.value = '';
    reportInput.value = '';
    updateUI();
});

reportRemoveBtn.addEventListener('click', () => {
    state.reportFile = null;
    reportInput.value = '';
    updateUI();
});

// ── EDAcation file picker ─────────────────────────────────────────────────────

edaInput.addEventListener('change', async () => {
    const file = edaInput.files?.[0] ?? null;
    state.edaFile = file;
    state.edaChip = null;
    state.edaError = null;

    if (file) {
        try {
            const parsed = JSON.parse(await file.text());
            if (
                parsed &&
                typeof parsed === 'object' &&
                parsed.chip &&
                typeof parsed.chip.family === 'string' &&
                typeof parsed.chip.device === 'string'
            ) {
                state.edaChip = {
                    family: parsed.chip.family as SupportedFamily,
                    device: parsed.chip.device
                };
            } else {
                state.edaError = 'Missing or invalid “chip” field in JSON.';
            }
        } catch {
            state.edaError = 'File is not valid JSON.';
        }
    }

    updateUI();
});

edaRemoveBtn.addEventListener('click', () => {
    state.edaFile = null;
    state.edaChip = null;
    state.edaError = null;
    edaInput.value = '';
    updateUI();
});

// ── UI state machine ──────────────────────────────────────────────────────────

function updateUI() {
    const isRendering = state.viewer !== null;

    for (const tab of modeTabs.querySelectorAll<HTMLButtonElement>('.mode-tab')) {
        tab.disabled = isRendering;
    }

    if (state.mode === 'browse') {
        familySelect.disabled = isRendering;
        deviceSelect.disabled = isRendering;
        submitBtn.disabled = isRendering;
    } else if (state.mode === 'example') {
        exampleSelect.disabled = isRendering;

        if (state.exampleChip) {
            exampleChipInfo.classList.add('visible');
            exampleChipValue.textContent = `${state.exampleChip.family.toUpperCase()} ${state.exampleChip.device}`;
        } else {
            exampleChipInfo.classList.remove('visible');
        }

        submitBtn.disabled = isRendering || state.exampleChip === null;
    } else if (state.mode === 'nextpnr') {
        familySelect.disabled = isRendering;
        deviceSelect.disabled = isRendering;

        const reportDisabled = isRendering || state.placeFile === null;

        placeInput.disabled = isRendering;
        reportInput.disabled = reportDisabled;

        setFileLabelState(
            placeLabel,
            placeNameEl,
            placeRemoveBtn,
            state.placeFile,
            'Choose place.json\u2026',
            isRendering
        );
        setFileLabelState(
            reportLabel,
            reportNameEl,
            reportRemoveBtn,
            state.reportFile,
            'Choose report.json\u2026',
            reportDisabled
        );

        submitBtn.disabled = isRendering || state.placeFile === null;
    } else {
        // EDAcation mode
        edaInput.disabled = isRendering;

        setFileLabelState(
            edaLabel,
            edaNameEl,
            edaRemoveBtn,
            state.edaFile,
            'Choose routed.nextpnr.json\u2026',
            isRendering
        );

        if (state.edaFile && state.edaChip) {
            // valid file
            edaChipInfo.classList.add('visible');
            edaChipValue.textContent = `${state.edaChip.family.toUpperCase()} ${state.edaChip.device}`;
            edaChipError.classList.remove('visible');
        } else if (state.edaFile && state.edaError) {
            // file loaded but chip detection failed
            edaChipInfo.classList.remove('visible');
            edaChipError.classList.add('visible');
            edaChipErrorMsg.textContent = state.edaError;
        } else {
            edaChipInfo.classList.remove('visible');
            edaChipError.classList.remove('visible');
        }

        submitBtn.disabled = isRendering || state.edaChip === null;
    }
}

// ── Submit ────────────────────────────────────────────────────────────────────

submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;

    let family = state.family;
    let device = state.device;
    let placeJson: NextpnrJson | undefined;
    let reportJson: ReportJson | undefined;

    if (state.mode === 'browse') {
        // bare-chip render: use family/device from dropdowns, no design files
        placeJson = undefined;
        reportJson = undefined;
    } else if (state.mode === 'example') {
        family = state.exampleChip!.family;
        device = state.exampleChip!.device;
        placeJson = state.examplePlace ? JSON.parse(await state.examplePlace.text()) : undefined;
        reportJson = state.exampleReport ? JSON.parse(await state.exampleReport.text()) : undefined;
    } else if (state.mode === 'nextpnr') {
        placeJson = state.placeFile ? JSON.parse(await state.placeFile.text()) : undefined;
        reportJson = state.reportFile ? JSON.parse(await state.reportFile.text()) : undefined;
    } else {
        // EDAcation mode
        const parsed = JSON.parse(await state.edaFile!.text());
        family = state.edaChip!.family;
        device = state.edaChip!.device;
        placeJson = parsed.data;
        reportJson = parsed.report;
    }

    setupPage.style.display = 'none';
    viewerPage.style.display = 'block';

    const w = viewerPage.clientWidth;
    const h = viewerPage.clientHeight;

    state.viewer = new NextPNRViewer(viewerContainer, {
        width: w,
        height: h,
        chip: {family, device: device as any},
        cellColors: getCellColors(),
        sidebarWidth: 300
    });

    await state.viewer.render();
    if (placeJson) {
        await state.viewer.showJson(placeJson, reportJson);
    }
    updateUI();
});

// ── Back ──────────────────────────────────────────────────────────────────────

function doReset() {
    // Call destroy() BEFORE clearing the DOM. This cancels any pending
    // animation-frame callbacks so they cannot fire against a torn-down
    // wasm object after the canvas has been removed.
    if (state.viewer) {
        state.viewer.destroy();
        state.viewer = null;
    }
    viewerContainer.innerHTML = '';

    viewerPage.style.display = 'none';
    setupPage.style.display = '';

    updateUI();
}

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

switchMode('browse');
