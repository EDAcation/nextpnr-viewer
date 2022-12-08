import { Architecture } from '../architecture/architecture';
export class NextpnrJSON {
    public static load<T>(architecture: Architecture<T>, json: object) {
        const obj = (json as any).modules.top.cells;
        const bel_names = Object.keys(obj).map(v => obj[v].attributes.NEXTPNR_BEL)
        bel_names.forEach(name => architecture.activateBelByName(name));
    }
}
