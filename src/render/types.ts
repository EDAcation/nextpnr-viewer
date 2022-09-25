export enum GraphicElementType {
    TYPE_NONE,
    TYPE_LINE,
    TYPE_ARROW,
    TYPE_BOX,
    TYPE_CIRCLE,
    TYPE_LABEL,
    TYPE_LOCAL_ARROW, // Located entirely within the cell boundaries, coordinates in the range [0., 1.]
    TYPE_LOCAL_LINE,
    TYPE_MAX
}

export enum GraphicElementStyle {
    STYLE_GRID,
    STYLE_FRAME,    // Static "frame". Contrast between STYLE_INACTIVE and STYLE_ACTIVE
    STYLE_HIDDEN,   // Only display when object is selected or highlighted
    STYLE_INACTIVE, // Render using low-contrast color
    STYLE_ACTIVE,   // Render using high-contast color

    // UI highlight groups
    STYLE_HIGHLIGHTED0,
    STYLE_HIGHLIGHTED1,
    STYLE_HIGHLIGHTED2,
    STYLE_HIGHLIGHTED3,
    STYLE_HIGHLIGHTED4,
    STYLE_HIGHLIGHTED5,
    STYLE_HIGHLIGHTED6,
    STYLE_HIGHLIGHTED7,

    STYLE_SELECTED,
    STYLE_HOVER,

    STYLE_MAX
}

export class GraphicElement {
    constructor(
        public type: GraphicElementType = GraphicElementType.TYPE_NONE,
        public style: GraphicElementStyle = GraphicElementStyle.STYLE_FRAME,
        public x1: number = 0,
        public x2: number = 0,
        public y1: number = 0,
        public y2: number = 0,
        public z: number = 0,

        public text: string = "",
    ) {}

    public clone(): GraphicElement {
        return new GraphicElement(this.type, this.style, this.x1, this.x2, this.y1, this.y2, this.z, this.text);
    }
}
