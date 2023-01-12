import { Architecture } from '../architecture/architecture';

type RoutingPart = {
    wire: string,
    pip: string,
    strength: number,
};

export class NextpnrJSON {
    public static load<T>(architecture: Architecture<T>, json: object) {
        const cells = (json as any).modules.top.cells;
        const netnames = (json as any).modules.top.netnames;

        const bel_names = Object.keys(cells).map(v => cells[v].attributes.NEXTPNR_BEL);
        bel_names.forEach(name => architecture.activateBelByName(name));

        const routings = Object.keys(netnames).map(v => netnames[v].attributes.ROUTING);
        routings.forEach(NextpnrJSON.parseRouting(architecture));
    }

    static parseRouting = <T>(architecture: Architecture<T>) => (routing: string) => {
        const strs = routing.split(';');

        const routingParts: RoutingPart[] = [];

        for (let i = 0; i < Math.floor(strs.length / 3); ++i) {
            const wire = strs[i * 3];
            const pip = strs[i * 3 + 1];
            const strength = parseInt(strs[i * 3 + 2], 10);

            routingParts.push({wire, pip, strength});
        }

        routingParts.forEach(({wire, pip, strength}: RoutingPart) => {
            console.log(wire, pip, strength);
            if (pip.length === 0) {
                architecture.activateWireByName(wire);
            } else {
                architecture.activateWireByName(wire);
                // bindPip
            }
        });
    }
}
