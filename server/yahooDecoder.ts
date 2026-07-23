import protobuf from 'protobufjs';

const root = protobuf.Root.fromJSON({
  nested: {
    Yaticker: {
      fields: {
        id: { type: 'string', id: 1 },
        price: { type: 'float', id: 2 },
        time: { type: 'sint64', id: 3 },
        currency: { type: 'string', id: 4 },
        exchange: { type: 'string', id: 5 },
        quoteType: { type: 'int32', id: 6 },
        marketHours: { type: 'int32', id: 7 },
        changePercent: { type: 'float', id: 8 },
        dayVolume: { type: 'sint64', id: 9 },
        dayHigh: { type: 'float', id: 10 },
        dayLow: { type: 'float', id: 11 },
        change: { type: 'float', id: 12 },
        shortName: { type: 'string', id: 13 },
        expireDate: { type: 'sint64', id: 14 },
        openPrice: { type: 'float', id: 15 },
        previousClose: { type: 'float', id: 16 },
        strikePrice: { type: 'float', id: 17 },
        underlyingSymbol: { type: 'string', id: 18 },
        openInterest: { type: 'sint64', id: 19 },
        optionsType: { type: 'int32', id: 20 },
        miniOption: { type: 'sint64', id: 21 },
        lastSize: { type: 'sint64', id: 22 },
        bid: { type: 'float', id: 23 },
        bidSize: { type: 'sint64', id: 24 },
        ask: { type: 'float', id: 25 },
        askSize: { type: 'sint64', id: 26 },
        priceHint: { type: 'sint64', id: 27 },
        vol_24hr: { type: 'sint64', id: 28 },
        volAllCurrencies: { type: 'sint64', id: 29 },
        fromcurrency: { type: 'sint64', id: 30 },
        lastMarket: { type: 'string', id: 31 },
        circulatingSupply: { type: 'double', id: 32 },
        marketCap: { type: 'double', id: 33 }
      }
    }
  }
});

export const Yaticker = root.lookupType('Yaticker');

export function decodeYahooMessage(base64Str: string): any {
  try {
    const buffer = Buffer.from(base64Str, 'base64');
    const message = Yaticker.decode(buffer);
    return Yaticker.toObject(message, {
      longs: Number,
      enums: String,
      bytes: String,
      defaults: true
    });
  } catch (err) {
    // Slently ignore malformed frames
    return null;
  }
}
