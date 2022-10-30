import {Optimizer} from '@parcel/plugin';
import {blobToBuffer} from '@parcel/utils';

export default new Optimizer({
    async optimize({contents}) {
        let buffer = await blobToBuffer(contents);
        return {
            contents: `new Uint8Array(Array.from(atob('${buffer.toString('base64')}')).map(c => c.charCodeAt(0))).buffer`
        };
    }
});
