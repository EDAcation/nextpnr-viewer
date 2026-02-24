# Usage

This document covers how to embed and use `nextpnr-viewer` in a web application.

## Installation

```sh
npm install --save nextpnr-viewer
```

## Minimal example

The following is the complete setup used in `viewer-test/`. It is the simplest possible integration.

**HTML** (`index.html`):

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="./src/index.ts" type="module"></script>
    </head>
    <body>
        <!-- File picker to load a nextpnr JSON output -->
        <input id="json-file" type="file" />

        <!-- The viewer will fill this element -->
        <div id="viewer" style="width: 100%; height: 100%;"></div>
    </body>
</html>
```

**TypeScript** (`src/index.ts`):

```ts
import {NextPNRViewer} from 'nextpnr-viewer';

window.onload = () => {
    const container = document.querySelector<HTMLDivElement>('#viewer')!;
    const fileInput = document.querySelector<HTMLInputElement>('#json-file')!;

    let viewer: NextPNRViewer | undefined;

    fileInput.addEventListener('change', () => {
        fileInput.files![0].text().then((text) => {
            const data = JSON.parse(text);

            if (!viewer) {
                viewer = new NextPNRViewer(container, {
                    width: 1620, // total width in px (canvas + sidebar)
                    height: 1080,
                    chip: data.chip,
                    sidebarWidth: 300
                });
                viewer.render();
            }

            viewer.showJson(data['data'], data['report']);
        });
    });
};
```

## Input file format

The JSON file loaded by the above viewer example is expected to have three top-level keys:

| Key      | Type                                 | Description                                                                                 |
| -------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `chip`   | `{ family: string, device: string }` | Identifies the FPGA target.                                                                 |
| `data`   | `NextpnrJson`                        | The placement/routing output from nextpnr (the JSON export from nextpnr's `--write` flag).  |
| `report` | `ReportJson` (optional)              | Timing analysis report from nextpnr (`--report` flag). Used to highlight the critical path. |

### Currently supported chips

| Family  | Devices                                                                                      |
| ------- | -------------------------------------------------------------------------------------------- |
| `ecp5`  | `12k`, `25k`, `um-25k`, `um5g-25k`, `45k`, `um-45k`, `um5g-45k`, `85k`, `um-85k`, `um5g-85k` |
| `ice40` | `lp384`, `lp1k`, `hx1k`, `u1k`, `u2k`, `u4k`, `up3k`, `up5k`, `lp8k`, `hx8k`, `lp4k`, `hx4k` |

Other chips are currently not supported. The process of adding new chips has been documented [here](chipsupport.md).

## API reference

### `new NextPNRViewer(container, config?)`

Creates a viewer instance inside `container` (must be an `HTMLDivElement`).

The `config` object (all fields optional, defaults shown):

```ts
{
    width: 1280,           // Total widget width in pixels (canvas + sidebar)
    height: 720,           // Total widget height in pixels
    sidebarWidth: 300,     // Width of the sidebar in pixels
    chip: { family: 'ecp5', device: '25k' },

    // CSS color strings for the renderer
    colors: {
        active:     '#F8F8F2',  // Placed/routed elements
        inactive:   '#6272A4',  // Unoccupied resources
        frame:      '#BD93F9',  // Chip outline / grid
        background: '#282A36',  // Canvas background
        critical:   '#FF0000',  // Critical path
        highlight:  '#81ff81',  // Highlighted element
        selected:   '#00FF00',  // Currently selected element
    },

    // Map from nextpnr cell type name to CSS color string
    cellColors: {},
}
```

The constructor immediately begins fetching the chipdb asset and initialising the WebAssembly module. Both operations are asynchronous; a loading indicator is shown in the canvas until they complete.

### `viewer.render()`

Triggers a render pass. Call this once after construction to display the chip outline before any placement data has been loaded.

### `viewer.showJson(nextpnrJson, reportJson?)`

Load placement and routing data into the viewer. Both arguments may be either a pre-parsed object or a raw JSON string.

- `nextpnrJson` — the object produced by nextpnr's `--write` flag.
- `reportJson` — optional timing report from `--report`, used to overlay the critical path.

Calling `showJson` a second time on the same viewer instance replaces the previous placement data.

### `viewer.resize(width, height)`

Resize the viewer to new pixel dimensions. Triggers a re-render automatically.

### `isSupported(chip)`

A standalone helper that returns `true` when the given `{ family, device }` object refers to a device the library has a chipdb for.

```ts
import {isSupported} from 'nextpnr-viewer';

if (isSupported({family: 'ice40', device: 'hx8k'})) {
    // safe to construct a viewer
}
```

## Cell colors

Each nextpnr cell type (e.g. `dff`, `mux`) can be given a distinct color to make different resources visually distinguishable. Pass a `cellColors` map in the config:

```ts
const viewer = new NextPNRViewer(container, {
    chip: {family: 'ecp5', device: '25k'},
    cellColors: {
        dff: '#50fa7b',
        mux: '#8be9fd'
    }
});
```

The value is a plain CSS color string. Any cell type not listed falls back to the `active` color from the `colors` config.

We maintain a list of common cell types to colors in our [edacation library](https://github.com/EDAcation/edacation/blob/main/src/project/groups.ts) which you can use.
