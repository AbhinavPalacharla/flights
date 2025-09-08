/**
 * Cookie handling for consent management
 */
import { Cookies } from './types';
export declare class CookiesImpl implements Cookies {
    readonly gws: string;
    readonly locale: string;
    readonly timestamp: number;
    constructor(params: {
        gws: string;
        locale: string;
        timestamp: number;
    });
    static new(params?: {
        locale?: string;
    }): CookiesImpl;
    toDict(): Record<string, string>;
    asBase64(): string;
}
//# sourceMappingURL=cookies.d.ts.map