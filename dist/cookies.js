"use strict";
/**
 * Cookie handling for consent management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookiesImpl = void 0;
const protobuf_1 = require("./protobuf");
class CookiesImpl {
    constructor(params) {
        this.gws = params.gws;
        this.locale = params.locale;
        this.timestamp = params.timestamp;
    }
    static new(params = {}) {
        const now = new Date();
        const gws = `gws_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-0_RC2`;
        const timestamp = Math.floor(now.getTime() / 1000);
        return new CookiesImpl({
            gws,
            locale: params.locale || 'en',
            timestamp
        });
    }
    toDict() {
        return {
            "CONSENT": "PENDING+987",
            "SOCS": this.asBase64()
        };
    }
    asBase64() {
        const proto = (0, protobuf_1.createCookiesProto)(this.gws, this.locale, this.timestamp);
        return (0, protobuf_1.serializeToBase64)(proto);
    }
}
exports.CookiesImpl = CookiesImpl;
//# sourceMappingURL=cookies.js.map