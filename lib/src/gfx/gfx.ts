import { Style } from './styles';
import { Type } from './types';

export class GraphicElement {
    constructor(
        public type: Type = Type.Box,
        public style: Style = Style.Inactive,
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
