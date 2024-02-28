import { Renderer, ColorConfig } from './renderer.interface';

type Chip = {
    family: 'ecp5',
    device: '25k' | '45k' | '85k'
} | {
    family: 'ice40',
    device: never
};

export type ViewerConfig = {
    width: number,
    height: number,
    createToggles: boolean,
    colors: ColorConfig,
    cellColors: Record<string, string>,
    chip: Chip
};

export const defaultConfig: ViewerConfig = {
    width: 1280,
    height: 720,
    createToggles: true,
    colors: {
        active:     "#F8F8F2",
        inactive:   "#6272A4",
        frame:      "#BD93F9",
        background: "#282A36"
    },
    cellColors: {},
    chip: {
        'family': 'ecp5',
        'device': '25k'
    }
};

export interface NextPNRViewer {
    get renderer(): Promise<Renderer>;
    showJson(jsonString: string): void;
    resize(width: number, height: number): void;
}
