import { Renderer, ColorConfig } from './renderer.interface';

export type ViewerConfig = {
    width: number,
    height: number,
    createToggles: boolean,
    colors: ColorConfig
};

export const defaultConfig: ViewerConfig = {
    width: 1280,
    height: 720,
    createToggles: true,
    colors: {
        active:   "#F8F8F2",
        inactive: "#6272A4",
        frame:    "#BD93F9",
    }
}

export interface NextPNRViewer {
    get renderer(): Renderer;
    showJson(jsonString: string): void;
    resize(width: number, height: number): void;
}
