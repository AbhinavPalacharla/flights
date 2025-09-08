/**
 * Cookie handling for consent management
 */

import { Cookies } from './types';
import { createCookiesProto, serializeToBase64 } from './protobuf';

export class CookiesImpl implements Cookies {
  public readonly gws: string;
  public readonly locale: string;
  public readonly timestamp: number;

  constructor(params: {
    gws: string;
    locale: string;
    timestamp: number;
  }) {
    this.gws = params.gws;
    this.locale = params.locale;
    this.timestamp = params.timestamp;
  }

  static new(params: { locale?: string } = {}): CookiesImpl {
    const now = new Date();
    const gws = `gws_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-0_RC2`;
    const timestamp = Math.floor(now.getTime() / 1000);
    
    return new CookiesImpl({
      gws,
      locale: params.locale || 'en',
      timestamp
    });
  }

  toDict(): Record<string, string> {
    return {
      "CONSENT": "PENDING+987",
      "SOCS": this.asBase64()
    };
  }

  asBase64(): string {
    const proto = createCookiesProto(this.gws, this.locale, this.timestamp);
    return serializeToBase64(proto);
  }
}