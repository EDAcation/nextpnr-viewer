var $35JEj$parcelplugin = require("@parcel/plugin");
var $35JEj$parcelutils = require("@parcel/utils");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", () => $8eb468f465cdfc5f$export$2e2bcd8739ae039);


var $8eb468f465cdfc5f$export$2e2bcd8739ae039 = new (0, $35JEj$parcelplugin.Optimizer)({
    async optimize ({ contents: contents  }) {
        let buffer = await (0, $35JEj$parcelutils.blobToBuffer)(contents);
        return {
            contents: `new Uint8Array(Array.from(atob('${buffer.toString("base64")}')).map(c => c.charCodeAt(0))).buffer`
        };
    }
});


//# sourceMappingURL=parcel-optimizer-array-buffer.js.map
