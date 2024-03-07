type RoutingPart = {
    wire: string,
    pip: string,
    strength: number,
};

type BEL = {
    nextpnrBel: string,
    cellType: string | undefined,
}

type ElementNames = {
    wire: string[],
    group: string[],
    bel: BEL[],
    pip: ReturnType<typeof NextpnrJSON.parsePip>[]
};

export class NextpnrJSON {
    public static load(json: object): ElementNames {
        const cells = (json as any).modules.top.cells;
        const netnames = (json as any).modules.top.netnames;

        const bels = Object.keys(cells).map(v => ({
            nextpnrBel: cells[v].attributes.NEXTPNR_BEL,
            cellType: cells[v].attributes.cellType
        }));

        const routings = Object.keys(netnames)
                               .map(v => netnames[v].attributes.ROUTING)
                               .map(NextpnrJSON.parseRouting);

        return {
            wire: routings.map(r => r.wire).flat(),
            group: [],
            bel: bels,
            pip: routings.map(r => r.pip.map(this.parsePip)).flat()
        }
    }

    static parseRouting = (routing: string) => {
        const strs = routing.split(';');

        const routingParts: RoutingPart[] = [];

        for (let i = 0; i < Math.floor(strs.length / 3); ++i) {
            const wire = strs[i * 3];
            const pip = strs[i * 3 + 1];
            const strength = parseInt(strs[i * 3 + 2], 10);

            routingParts.push({wire, pip, strength});
        }

        return {
            wire: routingParts.map(part => part.wire),
            pip: routingParts.map(part => part.pip).filter(s => s.length !== 0)
        };
    }

    static parsePip = (pip: string) => {
        let [x_str, y_str, pip_str] = pip.split('/');
        x_str = x_str.slice(1);
        y_str = y_str.slice(1);

        const [pip_from, pip_to] = pip_str.split("->");

        const parseFromTo = (s: string) => {
            const [x, y, ...rest] = s.split('_');
            return {
                location: { x: parseInt(x, 10), y: parseInt(y, 10) },
                name: rest.join('_')
            };
        };

        return {
            location: {
                x: parseInt(x_str, 10),
                y: parseInt(y_str, 10),
            },
            pip_from: parseFromTo(pip_from),
            pip_to: parseFromTo(pip_to),
            pip_name: pip
        };
    }
}
