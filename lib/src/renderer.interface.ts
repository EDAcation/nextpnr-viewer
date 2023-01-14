export type ColorConfig = {
    active: string,
    inactive: string,
    frame: string,
    background: string,
}
export interface Renderer {
    render(): void;
    zoom(amount: number, x: number, y: number): void;
    pan(x: number, y: number): void;
    loadJson(json: string): void;

    changeViewMode(viewMode: {
        showWires?: boolean,
        showGroups?: boolean,
        showBels?: boolean,
    }): void;

    get viewMode(): {
        showWires: boolean,
        showGroups: boolean,
        showBels: boolean,
    };
}
