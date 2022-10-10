export class RelString {
    static fromDataView(dataview: DataView): string {
        const off = dataview.getInt32(0, true);

        dataview = new DataView(dataview.buffer, dataview.byteOffset + off);

        let cur = 0;
        let ret_str = "";
        let c;
        while ((c = dataview.getUint8(cur)) != 0) {
            ret_str += String.fromCharCode(c);
            cur++;
        }

        return ret_str;
    }
}

export class RelPtr<T> {
    constructor(private _factory: { new (dataview: DataView): T; }) {}

    fromDataView(dataview: DataView): T {
        const off = dataview.getInt32(0, true);

        return new this._factory(new DataView(
            dataview.buffer,
            dataview.byteOffset + off
        ));
    }
}

export class RelSlice<T> {
    constructor(private _factory: { new (dataview: DataView): T; PODSize: number}) {}

    fromDataView(dataview: DataView): Array<T> {
        const off = dataview.getInt32(0, true);
        const len = dataview.getInt32(4, true);

        const range = (n: number) => [...Array(n).keys()];

        return range(len).map(i => new this._factory(new DataView(
            dataview.buffer,
            dataview.byteOffset + off + i * this._factory.PODSize
        )));
    }
}
