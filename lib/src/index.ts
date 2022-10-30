import { Renderer } from './renderer';
import { ChipInfoPODImpl } from './chipdb/ecp5-impl.chipdb';
import { ECP5Arch } from './architecture/ecp5.arch';
import chipdb from 'array-buffer:./chipdb/ecp5-bins/chipdb-25k.bin';

function getChipDb(): ECP5Arch {
    let dataview = new DataView(chipdb);
    const impl = new ChipInfoPODImpl(new DataView(dataview.buffer, dataview.getInt32(0, true)));

    return new ECP5Arch(impl);
}

export default (context: CanvasRenderingContext2D) => new Renderer(context, getChipDb());
