var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function() {
  "use strict";
  function hexToView(input) {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }
    if (input.length % 2 !== 0) {
      throw new RangeError("Expected string to be an even number of characters");
    }
    const view = new Uint8Array(input.length / 2);
    for (let i = 0; i < input.length; i += 2) {
      view[i / 2] = Number.parseInt(input.substring(i, i + 2), 16);
    }
    return view;
  }
  const hexToString = (s) => {
    const hex = s.toString();
    let str = "";
    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(Number.parseInt(hex.substring(n, 2), 16));
    }
    return str;
  };
  function viewToString(view, outputType = "string") {
    let result = "";
    let value;
    for (let i = 0; i < view.length; i++) {
      value = view[i].toString(16);
      result += value.length === 1 ? `0${value}` : value;
    }
    if (result.startsWith("000de140")) {
      result = result.replace("000de140", "");
    }
    return outputType === "hex" ? result : hexToString(result);
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var cbor$1 = { exports: {} };
  (function(module) {
    (function(global2, undefined$1) {
      var POW_2_24 = Math.pow(2, -24), POW_2_32 = Math.pow(2, 32), POW_2_53 = Math.pow(2, 53);
      function encode(value) {
        var data = new ArrayBuffer(256);
        var dataView = new DataView(data);
        var lastLength;
        var offset = 0;
        function ensureSpace(length) {
          var newByteLength = data.byteLength;
          var requiredLength = offset + length;
          while (newByteLength < requiredLength)
            newByteLength *= 2;
          if (newByteLength !== data.byteLength) {
            var oldDataView = dataView;
            data = new ArrayBuffer(newByteLength);
            dataView = new DataView(data);
            var uint32count = offset + 3 >> 2;
            for (var i2 = 0; i2 < uint32count; ++i2)
              dataView.setUint32(i2 * 4, oldDataView.getUint32(i2 * 4));
          }
          lastLength = length;
          return dataView;
        }
        function write() {
          offset += lastLength;
        }
        function writeFloat64(value2) {
          write(ensureSpace(8).setFloat64(offset, value2));
        }
        function writeUint8(value2) {
          write(ensureSpace(1).setUint8(offset, value2));
        }
        function writeUint8Array(value2) {
          var dataView2 = ensureSpace(value2.length);
          for (var i2 = 0; i2 < value2.length; ++i2)
            dataView2.setUint8(offset + i2, value2[i2]);
          write();
        }
        function writeUint16(value2) {
          write(ensureSpace(2).setUint16(offset, value2));
        }
        function writeUint32(value2) {
          write(ensureSpace(4).setUint32(offset, value2));
        }
        function writeUint64(value2) {
          var low = value2 % POW_2_32;
          var high = (value2 - low) / POW_2_32;
          var dataView2 = ensureSpace(8);
          dataView2.setUint32(offset, high);
          dataView2.setUint32(offset + 4, low);
          write();
        }
        function writeTypeAndLength(type, length) {
          if (length < 24) {
            writeUint8(type << 5 | length);
          } else if (length < 256) {
            writeUint8(type << 5 | 24);
            writeUint8(length);
          } else if (length < 65536) {
            writeUint8(type << 5 | 25);
            writeUint16(length);
          } else if (length < 4294967296) {
            writeUint8(type << 5 | 26);
            writeUint32(length);
          } else {
            writeUint8(type << 5 | 27);
            writeUint64(length);
          }
        }
        function encodeItem(value2) {
          var i2;
          if (value2 === false)
            return writeUint8(244);
          if (value2 === true)
            return writeUint8(245);
          if (value2 === null)
            return writeUint8(246);
          if (value2 === undefined$1)
            return writeUint8(247);
          switch (typeof value2) {
            case "number":
              if (Math.floor(value2) === value2) {
                if (0 <= value2 && value2 <= POW_2_53)
                  return writeTypeAndLength(0, value2);
                if (-POW_2_53 <= value2 && value2 < 0)
                  return writeTypeAndLength(1, -(value2 + 1));
              }
              writeUint8(251);
              return writeFloat64(value2);
            case "string":
              var utf8data = [];
              for (i2 = 0; i2 < value2.length; ++i2) {
                var charCode = value2.charCodeAt(i2);
                if (charCode < 128) {
                  utf8data.push(charCode);
                } else if (charCode < 2048) {
                  utf8data.push(192 | charCode >> 6);
                  utf8data.push(128 | charCode & 63);
                } else if (charCode < 55296) {
                  utf8data.push(224 | charCode >> 12);
                  utf8data.push(128 | charCode >> 6 & 63);
                  utf8data.push(128 | charCode & 63);
                } else {
                  charCode = (charCode & 1023) << 10;
                  charCode |= value2.charCodeAt(++i2) & 1023;
                  charCode += 65536;
                  utf8data.push(240 | charCode >> 18);
                  utf8data.push(128 | charCode >> 12 & 63);
                  utf8data.push(128 | charCode >> 6 & 63);
                  utf8data.push(128 | charCode & 63);
                }
              }
              writeTypeAndLength(3, utf8data.length);
              return writeUint8Array(utf8data);
            default:
              var length;
              if (Array.isArray(value2)) {
                length = value2.length;
                writeTypeAndLength(4, length);
                for (i2 = 0; i2 < length; ++i2)
                  encodeItem(value2[i2]);
              } else if (value2 instanceof Uint8Array) {
                writeTypeAndLength(2, value2.length);
                writeUint8Array(value2);
              } else {
                var keys = Object.keys(value2);
                length = keys.length;
                writeTypeAndLength(5, length);
                for (i2 = 0; i2 < length; ++i2) {
                  var key = keys[i2];
                  encodeItem(key);
                  encodeItem(value2[key]);
                }
              }
          }
        }
        encodeItem(value);
        if ("slice" in data)
          return data.slice(0, offset);
        var ret = new ArrayBuffer(offset);
        var retView = new DataView(ret);
        for (var i = 0; i < offset; ++i)
          retView.setUint8(i, dataView.getUint8(i));
        return ret;
      }
      function decode(data, tagger, simpleValue) {
        var dataView = new DataView(data);
        var offset = 0;
        if (typeof tagger !== "function")
          tagger = function(value) {
            return value;
          };
        if (typeof simpleValue !== "function")
          simpleValue = function() {
            return undefined$1;
          };
        function read(value, length) {
          offset += length;
          return value;
        }
        function readArrayBuffer(length) {
          return read(new Uint8Array(data, offset, length), length);
        }
        function readFloat16() {
          var tempArrayBuffer = new ArrayBuffer(4);
          var tempDataView = new DataView(tempArrayBuffer);
          var value = readUint16();
          var sign = value & 32768;
          var exponent = value & 31744;
          var fraction = value & 1023;
          if (exponent === 31744)
            exponent = 255 << 10;
          else if (exponent !== 0)
            exponent += 127 - 15 << 10;
          else if (fraction !== 0)
            return fraction * POW_2_24;
          tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
          return tempDataView.getFloat32(0);
        }
        function readFloat32() {
          return read(dataView.getFloat32(offset), 4);
        }
        function readFloat64() {
          return read(dataView.getFloat64(offset), 8);
        }
        function readUint8() {
          return read(dataView.getUint8(offset), 1);
        }
        function readUint16() {
          return read(dataView.getUint16(offset), 2);
        }
        function readUint32() {
          return read(dataView.getUint32(offset), 4);
        }
        function readUint64() {
          return readUint32() * POW_2_32 + readUint32();
        }
        function readBreak() {
          if (dataView.getUint8(offset) !== 255)
            return false;
          offset += 1;
          return true;
        }
        function readLength(additionalInformation) {
          if (additionalInformation < 24)
            return additionalInformation;
          if (additionalInformation === 24)
            return readUint8();
          if (additionalInformation === 25)
            return readUint16();
          if (additionalInformation === 26)
            return readUint32();
          if (additionalInformation === 27)
            return readUint64();
          if (additionalInformation === 31)
            return -1;
          throw "Invalid length encoding";
        }
        function readIndefiniteStringLength(majorType) {
          var initialByte = readUint8();
          if (initialByte === 255)
            return -1;
          var length = readLength(initialByte & 31);
          if (length < 0 || initialByte >> 5 !== majorType)
            throw "Invalid indefinite length element";
          return length;
        }
        function appendUtf16data(utf16data, length) {
          for (var i = 0; i < length; ++i) {
            var value = readUint8();
            if (value & 128) {
              if (value < 224) {
                value = (value & 31) << 6 | readUint8() & 63;
                length -= 1;
              } else if (value < 240) {
                value = (value & 15) << 12 | (readUint8() & 63) << 6 | readUint8() & 63;
                length -= 2;
              } else {
                value = (value & 15) << 18 | (readUint8() & 63) << 12 | (readUint8() & 63) << 6 | readUint8() & 63;
                length -= 3;
              }
            }
            if (value < 65536) {
              utf16data.push(value);
            } else {
              value -= 65536;
              utf16data.push(55296 | value >> 10);
              utf16data.push(56320 | value & 1023);
            }
          }
        }
        function decodeItem() {
          var initialByte = readUint8();
          var majorType = initialByte >> 5;
          var additionalInformation = initialByte & 31;
          var i;
          var length;
          if (majorType === 7) {
            switch (additionalInformation) {
              case 25:
                return readFloat16();
              case 26:
                return readFloat32();
              case 27:
                return readFloat64();
            }
          }
          length = readLength(additionalInformation);
          if (length < 0 && (majorType < 2 || 6 < majorType))
            throw "Invalid length";
          switch (majorType) {
            case 0:
              return length;
            case 1:
              return -1 - length;
            case 2:
              if (length < 0) {
                var elements = [];
                var fullArrayLength = 0;
                while ((length = readIndefiniteStringLength(majorType)) >= 0) {
                  fullArrayLength += length;
                  elements.push(readArrayBuffer(length));
                }
                var fullArray = new Uint8Array(fullArrayLength);
                var fullArrayOffset = 0;
                for (i = 0; i < elements.length; ++i) {
                  fullArray.set(elements[i], fullArrayOffset);
                  fullArrayOffset += elements[i].length;
                }
                return fullArray;
              }
              return readArrayBuffer(length);
            case 3:
              var utf16data = [];
              if (length < 0) {
                while ((length = readIndefiniteStringLength(majorType)) >= 0)
                  appendUtf16data(utf16data, length);
              } else
                appendUtf16data(utf16data, length);
              return String.fromCharCode.apply(null, utf16data);
            case 4:
              var retArray;
              if (length < 0) {
                retArray = [];
                while (!readBreak())
                  retArray.push(decodeItem());
              } else {
                retArray = new Array(length);
                for (i = 0; i < length; ++i)
                  retArray[i] = decodeItem();
              }
              return retArray;
            case 5:
              var retObject = {};
              for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
                var key = decodeItem();
                retObject[key] = decodeItem();
              }
              return retObject;
            case 6:
              return tagger(decodeItem(), length);
            case 7:
              switch (length) {
                case 20:
                  return false;
                case 21:
                  return true;
                case 22:
                  return null;
                case 23:
                  return undefined$1;
                default:
                  return simpleValue(length);
              }
          }
        }
        var ret = decodeItem();
        if (offset !== data.byteLength)
          throw "Remaining bytes";
        return ret;
      }
      var obj = { encode, decode };
      if (module.exports)
        module.exports = obj;
      else if (!global2.CBOR)
        global2.CBOR = obj;
    })(commonjsGlobal);
  })(cbor$1);
  var cborExports = cbor$1.exports;
  const cbor = /* @__PURE__ */ getDefaultExportFromCjs(cborExports);
  function hexToArrayBuffer(input) {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }
    if (input.length % 2 !== 0) {
      throw new RangeError("Expected string to be an even number of characters");
    }
    const view = new Uint8Array(input.length / 2);
    for (let i = 0; i < input.length; i += 2) {
      view[i / 2] = Number.parseInt(input.substring(i, i + 2), 16);
    }
    return view.buffer;
  }
  function decodeBalance(balanceCbor) {
    const decoded = cborExports.decode(hexToArrayBuffer(balanceCbor));
    if (typeof decoded === "number") {
      return decoded;
    }
    if (Array.isArray(decoded)) {
      const lovelace = decoded[0];
      if (typeof lovelace === "number") {
        return lovelace;
      }
    }
    return 0;
  }
  class DefaultWalletHandler {
    constructor(info, defaultApi, _enabledApi, _enable) {
      __publicField(this, "_isDisconnected", false);
      this.info = info;
      this.defaultApi = defaultApi;
      this._enabledApi = _enabledApi;
      this._enable = _enable;
    }
    async reenable() {
      const enabledApi = await this._enable();
      if (enabledApi) {
        this._enabledApi = enabledApi;
        return true;
      }
      return false;
    }
    get enabledApi() {
      return this._enabledApi;
    }
    /**
     * Gets the change address for the wallet.
     * @returns The change address in hex format.
     */
    async getChangeAddressHex() {
      return this._enabledApi.getChangeAddress();
    }
    /**
     * Gets the change address for the wallet.
     * @returns The change address in Bech32 format.
     */
    async getChangeAddressBech32() {
      const hex = await this.getChangeAddressHex();
      return hexToBech32(hex);
    }
    /**
     * Gets the stake address for the wallet.
     * @returns The stake address in hex format.
     */
    async getStakeAddressHex() {
      const rewardAddresses = await this._enabledApi.getRewardAddresses();
      return rewardAddresses[0];
    }
    /**
     * Gets the stake address for the wallet.
     * @returns The stake address in Bech32 format.
     */
    async getStakeAddressBech32() {
      const hex = await this.getStakeAddressHex();
      return hexToBech32(hex);
    }
    /**
     * Gets the network ID for the wallet.
     * @returns The network ID.
     */
    async getNetworkId() {
      return this._enabledApi.getNetworkId();
    }
    /**
     * Gets the balance for the wallet in CBOR format.
     * @returns The balance in CBOR format.
     */
    async getBalance() {
      return this._enabledApi.getBalance();
    }
    /**
     * Gets the balance for the wallet in Lovelace.
     * @returns The balance in Lovelace.
     * @throws {WalletBalanceDecodeError} If the balance cannot be decoded.
     */
    async getBalanceLovelace() {
      const balanceCbor = await this.getBalance();
      const balanceLovelace = decodeBalance(balanceCbor);
      if (typeof balanceLovelace !== "number") {
        throw new WalletBalanceDecodeError(
          `Could not retrieve the ${this.info.displayName} wallet's lovelace balance from cbor`
        );
      }
      return balanceLovelace;
    }
    /**
     * Gets the balance of assets for the wallet.
     * @returns The balance by policies.
     */
    async getBalanceAssets() {
      const balance = await this.getBalance();
      const obj = { cardano: { lovelace: 0 } };
      if (balance) {
        const decoded = cbor.decode(hexToView(balance).buffer);
        if (typeof decoded === "number") {
          obj.cardano = { lovelace: decoded };
          return obj;
        }
        const [lovelace, assets] = decoded;
        obj.cardano = { lovelace };
        for (const policy of Object.keys(assets)) {
          const policyString = viewToString(
            new Uint8Array(policy.split(",").map((p) => Number(p))),
            "hex"
          );
          obj[policyString] = {};
          const assetNames = Object.keys(assets[policy]);
          for (const assetName of assetNames) {
            const nameString = viewToString(
              new Uint8Array(assetName.split(",").map((p) => Number(p)))
            );
            const quantity = assets[policy][assetName];
            obj[policyString][nameString] = quantity;
          }
        }
      }
      return obj;
    }
    /**
     * Gets the default API for the wallet.
     * @returns The default wallet API.
     */
    getDefaultApi() {
      return this.defaultApi;
    }
    /**
     * Checks if the wallet is connected.
     * @returns True if the wallet is connected, otherwise false.
     */
    async isConnected() {
      return this.defaultApi.isEnabled();
    }
    /**
     * Checks if the wallet is connected to a specific wallet key.
     * @param wallet - The wallet key to check.
     * @returns True if connected to the specified wallet key, otherwise false.
     */
    async isConnectedTo(wallet) {
      if (this.info.key !== wallet) return false;
      return this.isConnected();
    }
    /**
     * Gets the UTXOs for the wallet.
     * @returns The UTXOs.
     */
    async getUtxos() {
      return this._enabledApi.getUtxos();
    }
    /**
     * Signs a transaction.
     * @param tx - The transaction to sign.
     * @param [partialSign=true] - Whether to partially sign the transaction.
     * @returns The signed transaction.
     */
    async signTx(tx, partialSign = true) {
      return this._enabledApi.signTx(tx, partialSign);
    }
    /**
     * Submits a transaction.
     * @param tx - The transaction to submit.
     * @returns
     */
    async submitTx(tx) {
      return this._enabledApi.submitTx(tx);
    }
    /**
     * Signs data with the wallet's stake address.
     * @param payload - The data to sign.
     * @returns The signed data.
     */
    async signData(payload) {
      const stake = await this.getStakeAddressHex();
      return this._enabledApi.signData(stake, payload);
    }
    get isDisconnected() {
      return this._isDisconnected;
    }
    async disconnect() {
      this._isDisconnected = true;
    }
  }
  function getDefaultWalletConnector(HandlerConstructor) {
    return async (key) => {
      const defaultApi = await getWindowCardano({ key });
      if (!defaultApi) {
        const message = "Could not retrieve the wallet API";
        throw new WalletConnectionError(message);
      }
      const info = getWalletInfo({ key, defaultApi });
      const enable = () => enableWallet(defaultApi);
      const enabledApi = await enable();
      if (!enabledApi) {
        const message = "Could not enable the wallet";
        throw new WalletConnectionError(message);
      }
      let handler;
      if (HandlerConstructor) {
        handler = new HandlerConstructor(info, defaultApi, enabledApi, enable);
      } else {
        handler = new DefaultWalletHandler(info, defaultApi, enabledApi, enable);
      }
      return handler;
    };
  }
  function createCustomWallet({ connector: connector2, initialize }) {
    return {
      connector: connector2 ?? getDefaultWalletConnector(),
      initialize
    };
  }
  function identity(value) {
    return value;
  }
  function deferredPromise() {
    let resolve = identity;
    let reject = identity;
    const promise = new Promise((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });
    return { promise, resolve, reject };
  }
  function runOnce(fn) {
    let state = { status: "idle" };
    return async () => {
      if (state.status === "initialized") {
        return;
      }
      if (state.status === "loading") {
        return state.promise;
      }
      const { promise, resolve } = deferredPromise();
      state = { status: "loading", promise };
      const res = await fn();
      state = { status: res ? "initialized" : "idle" };
      resolve();
      return promise;
    };
  }
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  function initializeDAppConnectorBridge(onBridgeCreated) {
    const _label = "DAppConnectorBridge: ";
    let _walletNamespace = null;
    let _initialApiObject = null;
    let _fullApiObject = null;
    const _bridge = { type: "cardano-dapp-connector-bridge", source: null, origin: null };
    const _requestMap = {};
    const _methodMap = {
      // Initial 3 methods to establish connection. More endpoints will be added by the wallet.
      connect: "connect",
      handshake: "handshake",
      enable: "enable",
      isEnabled: "isEnabled"
    };
    function generateUID() {
      return ("000" + (Math.random() * 46656 | 0).toString(36)).slice(-3) + ("000" + (Math.random() * 46656 | 0).toString(36)).slice(-3);
    }
    function createRequest(method) {
      const args = [...arguments];
      if (args.length > 0) args.shift();
      return new Promise((resolve, reject) => {
        var _a;
        const request = {
          payload: {
            type: _bridge.type,
            to: _walletNamespace,
            uid: generateUID(),
            method,
            args
          },
          resolve,
          reject
        };
        _requestMap[request.payload.uid] = request;
        (_a = _bridge.source) == null ? void 0 : _a.postMessage(request.payload, _bridge.origin);
      });
    }
    function generateApiFunction(method) {
      return function() {
        return createRequest(method, ...arguments);
      };
    }
    function generateApiObject(obj) {
      const apiObj = {};
      for (const key in obj) {
        const value = obj[key];
        if (typeof value === "string") {
          if (key === "feeAddress") {
            apiObj[key] = value;
          } else {
            apiObj[key] = generateApiFunction(value);
            _methodMap[value] = value;
          }
        } else if (typeof value === "object") {
          apiObj[key] = generateApiObject(value);
        } else {
          apiObj[key] = value;
        }
      }
      return apiObj;
    }
    function initBridge(source, origin, walletNamespace, initialApi) {
      if (!hasOwnProperty(window, "cardano")) {
        window.cardano = {};
      }
      if (hasOwnProperty(window.cardano, walletNamespace)) {
        console.warn(
          "Warn: " + _label + "window.cardano." + walletNamespace + " already present, skipping initialApi creation."
        );
        return null;
      }
      _bridge.source = source;
      _bridge.origin = origin;
      _walletNamespace = walletNamespace;
      const initialApiObj = {
        isBridge: true,
        // https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030
        isEnabled: function() {
          return createRequest("isEnabled");
        },
        enable: function() {
          return createRequest("enable");
        },
        apiVersion: initialApi.apiVersion,
        name: initialApi.name,
        icon: initialApi.icon ? initialApi.icon : null,
        // extension: https://github.com/cardano-foundation/CIPs/pull/183
        experimental: {}
      };
      window.cardano[walletNamespace] = initialApiObj;
      if (initialApi.experimental) {
        initialApiObj.experimental = {
          ...generateApiObject(initialApi.experimental)
        };
      }
      return window.cardano[walletNamespace];
    }
    function isValidBridge(payload) {
      if (!_initialApiObject) {
        if (payload.data.method !== _methodMap.connect) {
          console.error("Error: " + _label + "send 'connect' first.");
          return false;
        }
        const initialApi = payload.data.initialApi;
        if (!initialApi || !initialApi.isBridge || !initialApi.apiVersion || !initialApi.name) {
          console.error("Error: " + _label + "'connect' is missing correct initialApi.", initialApi);
          return false;
        }
        if (!payload.data.walletNamespace) {
          console.error(
            "Error: " + _label + "'connect' is missing walletNamespace.",
            payload.data.walletNamespace
          );
          return false;
        }
        _initialApiObject = initBridge(
          payload.source,
          payload.origin,
          payload.data.walletNamespace,
          initialApi
        );
      }
      if (!(_initialApiObject && hasOwnProperty(window, "cardano") && window.cardano[payload.data.walletNamespace] === _initialApiObject)) {
        console.warn(
          "Warn: " + _label + "bridge not set up correctly:",
          _bridge,
          _initialApiObject,
          _walletNamespace
        );
        return false;
      }
      return true;
    }
    function isValidMessage(payload) {
      if (!payload.data || !payload.origin || !payload.source) return false;
      if (payload.data.type !== _bridge.type) return false;
      if (!hasOwnProperty(_methodMap, payload.data.method)) return false;
      if (_walletNamespace && payload.data.walletNamespace !== _walletNamespace) return false;
      return true;
    }
    async function onMessage(payload) {
      if (!isValidMessage(payload) || !isValidBridge(payload)) return;
      if (payload.data.method === _methodMap.connect) {
        const success = await createRequest("handshake");
        if (success && _initialApiObject) {
          if (onBridgeCreated) onBridgeCreated(_initialApiObject);
        }
        return;
      }
      if (!payload.data.uid) return;
      const request = _requestMap[payload.data.uid];
      if (!request) return;
      let response = payload.data.response;
      const error = payload.data.error;
      if (error) {
        request.reject(error);
        delete _requestMap[payload.data.uid];
        return;
      }
      if (payload.data.method === _methodMap.enable) {
        _fullApiObject = null;
        if (typeof response === "object") {
          _fullApiObject = {
            ...generateApiObject(response)
          };
          response = _fullApiObject;
        }
      }
      request.resolve(response);
      delete _requestMap[payload.data.uid];
    }
    window.addEventListener("message", onMessage, false);
  }
  function initializeDAppConnectorBridgeAsync() {
    const { promise, resolve, reject } = deferredPromise();
    const timeout = setTimeout(() => reject("Request took too long"), 1e4);
    initializeDAppConnectorBridge((api) => {
      clearTimeout(timeout);
      resolve(api);
    });
    return promise;
  }
  const eternl = createCustomWallet({
    initialize: runOnce(async () => {
      try {
        if (typeof window === "undefined") {
          return false;
        }
        const walletApi = await initializeDAppConnectorBridgeAsync();
        if (walletApi.name === "eternl") {
          window.cardano.eternl = walletApi;
          return true;
        }
        return false;
      } catch {
        return false;
      }
    })
  });
  var dist$2 = {};
  var dist$1 = {};
  var injectConnectors$1 = {};
  var logging = {};
  Object.defineProperty(logging, "__esModule", { value: true });
  logging.logger = logging.setLogLevel = void 0;
  let _logLevel = "none";
  const setLogLevel = (level) => {
    _logLevel = level;
  };
  logging.setLogLevel = setLogLevel;
  logging.logger = {
    debug: (...data) => {
      if (_logLevel === "debug") {
        console.log("NuFi-debug:SDK", { calledAt: (/* @__PURE__ */ new Date()).toString() }, ...data);
      }
    }
  };
  var sendRequestProxy$1 = {};
  Object.defineProperty(sendRequestProxy$1, "__esModule", { value: true });
  sendRequestProxy$1.sendRequestProxy = void 0;
  const sendRequestProxy = (sendRequest, obj = {}) => (
    // This simply proxies all `api.foo(...args)` calls into `sendRequest('foo', args)`
    new Proxy(obj, {
      get(target, prop, receiver) {
        const method = prop.toString();
        if (!Reflect.has(target, prop)) {
          return (...args) => sendRequest(method, args);
        }
        return Reflect.get(target, prop, receiver);
      }
    })
  );
  sendRequestProxy$1.sendRequestProxy = sendRequestProxy;
  var setupClientChannel$1 = {};
  var publicUtils = {};
  var utils$1 = {};
  var __awaiter$2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(utils$1, "__esModule", { value: true });
  utils$1.getRandomUUID = utils$1.hardenUnreliableRequest = utils$1.isNufiMessage = utils$1.isNufiWidgetManagementMessage = void 0;
  const widgetManagementMethods = [
    "closeWidget",
    "collapseWidget",
    "openWidget",
    "hideWidget",
    "refreshPage",
    "getParentWindowDimensionsRequest",
    "getParentWindowDimensionsResponse",
    "signOut"
  ];
  const isNufiWidgetManagementMessage = (e) => {
    var _a;
    if (e.data == null)
      return false;
    const _e = e;
    const method = _e.data.method;
    return ((_a = _e === null || _e === void 0 ? void 0 : _e.data) === null || _a === void 0 ? void 0 : _a.appId) === "nufi" && widgetManagementMethods.includes(method);
  };
  utils$1.isNufiWidgetManagementMessage = isNufiWidgetManagementMessage;
  const isNufiMessage = (e, expectedConnectorPlatform) => {
    var _a, _b;
    const _e = e;
    return Boolean(((_a = _e === null || _e === void 0 ? void 0 : _e.data) === null || _a === void 0 ? void 0 : _a.appId) === "nufi" && ((_b = _e === null || _e === void 0 ? void 0 : _e.data) === null || _b === void 0 ? void 0 : _b.connectorPlatform) === expectedConnectorPlatform);
  };
  utils$1.isNufiMessage = isNufiMessage;
  const hardenUnreliableRequest = (req, fallbackResponse) => Promise.any([
    req(),
    new Promise((resolve) => setTimeout(() => __awaiter$2(void 0, void 0, void 0, function* () {
      return resolve(yield req());
    }), 10)),
    new Promise((resolve) => setTimeout(() => __awaiter$2(void 0, void 0, void 0, function* () {
      return resolve(yield req());
    }), 100)),
    new Promise((resolve) => setTimeout(() => __awaiter$2(void 0, void 0, void 0, function* () {
      return resolve(yield req());
    }), 500)),
    new Promise((resolve) => setTimeout(() => resolve(fallbackResponse), 1e3))
  ]);
  utils$1.hardenUnreliableRequest = hardenUnreliableRequest;
  const getRandomUUID = () => {
    try {
      return self.crypto.randomUUID();
    } catch (e) {
    }
    let d = (/* @__PURE__ */ new Date()).getTime();
    let d2 = typeof performance !== "undefined" && performance.now && performance.now() * 1e3 || 0;
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      let r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === "x" ? r : r & 3 | 8).toString(16);
    });
  };
  utils$1.getRandomUUID = getRandomUUID;
  var hasRequiredPublicUtils;
  function requirePublicUtils() {
    if (hasRequiredPublicUtils) return publicUtils;
    hasRequiredPublicUtils = 1;
    (function(exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getRandomUUID = exports.safeReplyToEvent = exports.objKeyByConnectorPlatform = exports.ensureChannelIsReady = exports.messageDirectionMatches = exports.set = exports.setIfDoesNotExist = exports.isNufiWidgetManagementMessage = exports.isNufiMessage = void 0;
      const logging_12 = logging;
      const publicUtils_12 = requirePublicUtils();
      var utils_12 = utils$1;
      Object.defineProperty(exports, "isNufiMessage", { enumerable: true, get: function() {
        return utils_12.isNufiMessage;
      } });
      Object.defineProperty(exports, "isNufiWidgetManagementMessage", { enumerable: true, get: function() {
        return utils_12.isNufiWidgetManagementMessage;
      } });
      const setIfDoesNotExist = (into, path, what) => {
        for (const [i, segment] of path.entries()) {
          if (!Object.hasOwn(into, segment)) {
            into[segment] = i < path.length - 1 ? {} : what;
          }
          into = into[segment];
        }
      };
      exports.setIfDoesNotExist = setIfDoesNotExist;
      const set = (into, path, what) => {
        for (const [i, segment] of path.entries()) {
          if (i === path.length - 1) {
            into[segment] = what;
          } else if (!Object.hasOwn(into, segment)) {
            into[segment] = {};
          }
          into = into[segment];
        }
      };
      exports.set = set;
      const messageDirectionMatches = (msg, senderContext, targetContext) => msg.targetContext === targetContext && msg.senderContext === senderContext;
      exports.messageDirectionMatches = messageDirectionMatches;
      let channelReadyGlobals = null;
      const ensureChannelIsReady = (appId, connectorPlatform, connectorKind, sendPostMessage) => {
        const channelPingMessage = {
          connectorPlatform,
          appId,
          method: "channelPing",
          data: {
            connectorKind,
            connectorPlatform
          }
        };
        return new Promise((resolve) => {
          const channelReadyHandler = (e) => {
            if (!(0, publicUtils_12.isNufiMessage)(e, connectorPlatform))
              return;
            const _e = e;
            if (_e.data.method === "channelPing") {
              logging_12.logger.debug('"ensureChannelIsReady": received ping response');
              if (channelReadyGlobals != null) {
                clearInterval(channelReadyGlobals.interval);
                window.removeEventListener("message", channelReadyGlobals.handler);
                channelReadyGlobals = null;
              }
              resolve(true);
            }
          };
          if (channelReadyGlobals != null) {
            clearInterval(channelReadyGlobals.interval);
            window.removeEventListener("message", channelReadyGlobals.handler);
          }
          channelReadyGlobals = {
            // Ping until we can safely establish port connection. Note that it must be registered into
            // global immediately after creation to avoid "stale" timeouts.
            interval: setInterval(() => {
              logging_12.logger.debug('"ensureChannelIsReady": sending ping request');
              sendPostMessage(channelPingMessage);
            }, 500),
            handler: channelReadyHandler
          };
          window.addEventListener("message", channelReadyGlobals.handler);
        });
      };
      exports.ensureChannelIsReady = ensureChannelIsReady;
      exports.objKeyByConnectorPlatform = {
        extension: "nufi",
        snap: "nufiSnap",
        sso: "nufiSSO"
      };
      const safeReplyToEvent = (e, message) => {
        var _a;
        (_a = e.source) === null || _a === void 0 ? void 0 : _a.postMessage(message, { targetOrigin: e.origin });
      };
      exports.safeReplyToEvent = safeReplyToEvent;
      var utils_2 = utils$1;
      Object.defineProperty(exports, "getRandomUUID", { enumerable: true, get: function() {
        return utils_2.getRandomUUID;
      } });
    })(publicUtils);
    return publicUtils;
  }
  var assertion = {};
  Object.defineProperty(assertion, "__esModule", { value: true });
  assertion.safeAssertUnreachable = void 0;
  const safeAssertUnreachable = (x) => {
    throw new Error(`Unreachable switch case:${x}`);
  };
  assertion.safeAssertUnreachable = safeAssertUnreachable;
  var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(setupClientChannel$1, "__esModule", { value: true });
  setupClientChannel$1.setupClientChannel = void 0;
  const publicUtils_1 = requirePublicUtils();
  const assertion_1 = assertion;
  const logging_1$1 = logging;
  const utils_1$2 = utils$1;
  const cachedGetPort = (getPort) => {
    let port = null;
    const invalidatePort = () => {
      port = null;
    };
    return () => {
      if (port === null)
        port = getPort(invalidatePort);
      return port;
    };
  };
  const setupClientChannel = ({ appId, connectorPlatform, currentContext, targetContext, eventHandler, onConnectorWindowClosed, sendPortPostMessage, onBeforeFirstSend, onBeforeRequest, initChannelData }) => {
    logging_1$1.logger.debug('"setupClientChannel"');
    const {
      // to be called by the listener waiting for the channel to respond
      setChannelReady,
      channelReady
    } = (() => {
      let _setChannelReady;
      const channelReady2 = new Promise((resolve) => {
        _setChannelReady = resolve;
      });
      return {
        channelReady: channelReady2,
        setChannelReady: () => {
          logging_1$1.logger.debug('"setupClientChannel" setting channel ready');
          _setChannelReady(true);
        }
      };
    })();
    if (onBeforeFirstSend != null) {
      logging_1$1.logger.debug('"setupClientChannel" calling onBeforeFirstSend');
      onBeforeFirstSend().then(() => {
        logging_1$1.logger.debug('"onBeforeFirstSend" finished');
        setChannelReady();
      });
    } else {
      setChannelReady();
    }
    const activeRequests = /* @__PURE__ */ new Map();
    const getPort = cachedGetPort(() => {
      logging_1$1.logger.debug('"setupClientChannel" calling cachedGetPort');
      const channel = new MessageChannel();
      const initChannelMessage = {
        appId,
        connectorPlatform,
        method: "initChannel",
        data: initChannelData
      };
      sendPortPostMessage(initChannelMessage, [channel.port2]);
      channel.port1.onmessage = (e) => {
        const msg = e.data;
        if (!(0, publicUtils_1.messageDirectionMatches)(msg, targetContext, currentContext))
          return;
        logging_1$1.logger.debug('"setupClientChannel" received port message', msg);
        switch (msg.type) {
          case "response": {
            const { id, result } = msg;
            const msgPromiseCallbacks = activeRequests.get(id);
            if (msgPromiseCallbacks) {
              activeRequests.delete(id);
              if (result.kind === "success")
                msgPromiseCallbacks.resolve(result.value);
              else
                msgPromiseCallbacks.reject(result.value);
            }
            break;
          }
          case "event":
            if (msg.targetOrigin !== window.location.origin)
              return;
            if (msg.method === "connectorWindowClosed") {
              const errorResponse = (() => {
                if (onConnectorWindowClosed != null) {
                  return onConnectorWindowClosed(msg);
                }
                return "Connector window was closed";
              })();
              activeRequests.forEach(({ reject }) => reject(errorResponse));
              activeRequests.clear();
            }
            eventHandler(msg.connectorKind, msg.method, msg.args);
            break;
          default:
            (0, assertion_1.safeAssertUnreachable)(msg);
        }
      };
      return channel.port1;
    });
    return (connectorKind, method, args) => __awaiter$1(void 0, void 0, void 0, function* () {
      const priorityTimestamp = (/* @__PURE__ */ new Date()).toISOString();
      logging_1$1.logger.debug('"setupClientChannel" calling API', {
        connectorKind,
        method,
        args
      });
      const id = (0, utils_1$2.getRandomUUID)();
      const request = {
        senderContext: currentContext,
        targetContext,
        id,
        connectorKind,
        method,
        args,
        priorityTimestamp
      };
      onBeforeRequest === null || onBeforeRequest === void 0 ? void 0 : onBeforeRequest({ connectorKind, method, args });
      yield channelReady;
      logging_1$1.logger.debug('"setupClientChannel" posting port message', request);
      getPort().postMessage(request);
      return new Promise((resolve, reject) => activeRequests.set(id, { resolve, reject }));
    });
  };
  setupClientChannel$1.setupClientChannel = setupClientChannel;
  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  Object.defineProperty(injectConnectors$1, "__esModule", { value: true });
  injectConnectors$1.injectConnectors = injectConnectors;
  const logging_1 = logging;
  const sendRequestProxy_1 = sendRequestProxy$1;
  const setupClientChannel_1 = setupClientChannel$1;
  const utils_1$1 = utils$1;
  function createConnectors({ connectorsToInject, config, currentContext, targetContext, sendPortPostMessage, onBeforeFirstSend, onBeforeRequest, overridableWallets, initChannelData }) {
    logging_1.logger.debug('"createConnectors"');
    const connectors = [];
    const eventHandlers = /* @__PURE__ */ new Map();
    const multiplexedHandler = (0, setupClientChannel_1.setupClientChannel)({
      connectorPlatform: config.connectorPlatform,
      appId: config.appId,
      onBeforeRequest,
      onBeforeFirstSend,
      currentContext,
      targetContext,
      eventHandler: (connectorKind, method, args) => __awaiter(this, void 0, void 0, function* () {
        const eventHandler = eventHandlers.get(connectorKind);
        if (eventHandler) {
          yield eventHandler(method, args);
        }
      }),
      sendPortPostMessage,
      initChannelData
    });
    const getWalletOverridesRequest = () => __awaiter(this, void 0, void 0, function* () {
      return yield multiplexedHandler(null, "getWalletOverrides", []);
    });
    const getWalletOverrides = overridableWallets.length > 0 ? () => (0, utils_1$1.hardenUnreliableRequest)(getWalletOverridesRequest, Object.fromEntries(overridableWallets.map((w) => [w, false]))) : null;
    for (const connectorKind of Object.keys(config.connectors)) {
      try {
        const sendRequest = multiplexedHandler.bind(void 0, connectorKind);
        const proxy = (0, sendRequestProxy_1.sendRequestProxy)(sendRequest);
        let connectorWindowOpen = false;
        const client = {
          sendRequest,
          proxy,
          openConnectorWindow: (meta) => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('"createConnectors": openConnectorWindow called');
            yield proxy.openConnectorWindow(meta);
            connectorWindowOpen = true;
            logging_1.logger.debug('"createConnectors": openConnectorWindow finished');
          }),
          closeConnectorWindow: () => __awaiter(this, void 0, void 0, function* () {
            logging_1.logger.debug('"createConnectors": closeConnectorWindow called');
            yield proxy.closeConnectorWindow();
            connectorWindowOpen = false;
            logging_1.logger.debug('"createConnectors": closeConnectorWindow finished');
          }),
          // Original method used by connectors that have to be closed after Dapp refresh.
          // Consider migrating other connectors to `isConnectorWindowOpenAsync`.
          isConnectorWindowOpen: () => {
            logging_1.logger.debug(`"createConnectors": isConnectorWindowOpen ${connectorWindowOpen}`);
            return connectorWindowOpen;
          },
          isConnectorWindowOpenAsync: () => __awaiter(this, void 0, void 0, function* () {
            try {
              logging_1.logger.debug(`"createConnectors": isConnectorWindowOpenAsync called`);
              const res = yield proxy.isConnectorWindowOpen();
              logging_1.logger.debug(`"createConnectors": isConnectorWindowOpenAsync result ${res}`);
              return res;
            } catch (err) {
              logging_1.logger.debug('"createConnectors": isConnectorWindowOpenAsync error');
              return false;
            }
          })
        };
        const connector2 = connectorsToInject[connectorKind](client, config);
        if (connector2) {
          const eventHandler = (method, args) => __awaiter(this, void 0, void 0, function* () {
            if (method === "connectorWindowClosed") {
              connectorWindowOpen = false;
            }
            yield connector2.eventHandler(method, args);
          });
          eventHandlers.set(connectorKind, eventHandler);
          connectors.push(connector2);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [connectors, getWalletOverrides];
  }
  const initializeConnectors = (_connectors, getWalletOverrides) => __awaiter(void 0, void 0, void 0, function* () {
    const simpleConnectorsToInit = _connectors.filter((c) => c.type === "simple");
    for (const connector2 of simpleConnectorsToInit) {
      try {
        logging_1.logger.debug(`"createConnectors": ${connector2.connectorKind} initialization start`);
        connector2.inject(window);
        logging_1.logger.debug(`"createConnectors": ${connector2.connectorKind} initialization finished`);
      } catch (e) {
        console.error(e);
      }
    }
    const connectorsWithOverridesToInit = _connectors.filter((c) => c.type === "withOverrides");
    const walletOverrides = getWalletOverrides ? yield getWalletOverrides() : null;
    for (const connector2 of connectorsWithOverridesToInit) {
      try {
        connector2.inject(window, walletOverrides);
      } catch (e) {
        console.error(e);
      }
    }
  });
  function injectConnectors(params) {
    return __awaiter(this, void 0, void 0, function* () {
      const [connectorsToInitialize, getWalletOverrides] = createConnectors(params);
      yield initializeConnectors(connectorsToInitialize, getWalletOverrides);
    });
  }
  var sdkInfo$1 = {};
  const name$1 = "@nufi/dapp-client-core";
  const version$1 = "0.3.5";
  const license$1 = "MIT";
  const homepage$1 = "https://github.com/nufi-official/dapp-client/tree/master/core";
  const repository$1 = {
    type: "git",
    url: "git://github.com/nufi-official/dapp-client.git"
  };
  const main$1 = "dist/index.js";
  const types$3 = "dist/index";
  const files$1 = [
    "dist"
  ];
  const scripts$1 = {
    build: "rm -rf dist && tsc",
    "test:tsc": "tsc --noEmit",
    "test:unit": "NODE_ENV=jest run -T jest -c jest/jest.unit.config.js --forceExit",
    test: "yarn test:tsc && yarn test:unit",
    watch: "tsc --watch",
    prepublishOnly: "rm -rf dist && yarn test && yarn build"
  };
  const devDependencies$1 = {
    "@metamask/providers": "^17.1.2",
    "@types/jest": "^29.5.12",
    jest: "^29.7.0",
    "ts-jest": "^29.1.2",
    typescript: "^5.5.3"
  };
  const packageManager$1 = "yarn@4.1.0";
  const require$$0 = {
    name: name$1,
    version: version$1,
    license: license$1,
    homepage: homepage$1,
    repository: repository$1,
    main: main$1,
    types: types$3,
    files: files$1,
    scripts: scripts$1,
    devDependencies: devDependencies$1,
    packageManager: packageManager$1
  };
  Object.defineProperty(sdkInfo$1, "__esModule", { value: true });
  sdkInfo$1.getCoreSdkInfo = sdkInfo$1.getSdkInfoReporter = void 0;
  const getSdkInfoReporter = () => {
    let didReportAttempt = false;
    return {
      tryReportingOnce: (sendSimplePostMessage, items) => {
        if (!didReportAttempt) {
          const message = {
            appId: "nufi",
            method: "reportSdkInfo",
            items
          };
          sendSimplePostMessage(message);
          didReportAttempt = true;
        }
      }
    };
  };
  sdkInfo$1.getSdkInfoReporter = getSdkInfoReporter;
  const getCoreSdkInfo = () => {
    let version2 = "";
    try {
      version2 = require$$0.version;
    } catch (err) {
    }
    return { sdkType: "core", version: version2 };
  };
  sdkInfo$1.getCoreSdkInfo = getCoreSdkInfo;
  var widget = {};
  var domEventsListeners = {};
  var createDomEventsManager$1 = {};
  var createOnClickOutsideWidgetHandlers$1 = {};
  Object.defineProperty(createOnClickOutsideWidgetHandlers$1, "__esModule", { value: true });
  createOnClickOutsideWidgetHandlers$1.createOnClickOutsideWidgetHandlers = void 0;
  const createClickAwayHandlers = ({ elementQuerySelector, handleClickAway }) => {
    const _handleClickAway = (event) => {
      const element = document.querySelector(elementQuerySelector);
      if (element && !element.contains(event.target)) {
        handleClickAway();
      }
    };
    return {
      addListener: () => document.addEventListener("click", _handleClickAway, true),
      removeListener: () => document.removeEventListener("click", _handleClickAway, true)
    };
  };
  const createOnClickOutsideWidgetHandlers = (params) => {
    let isClickOutsideWidgetSet = false;
    const clickAwayHandlers = createClickAwayHandlers(params);
    const addClickOutsideWidgetListener = () => {
      if (!isClickOutsideWidgetSet) {
        clickAwayHandlers.addListener();
        isClickOutsideWidgetSet = true;
      }
    };
    const removeClickOutsideWidgetListener = () => {
      if (isClickOutsideWidgetSet) {
        clickAwayHandlers.removeListener();
        isClickOutsideWidgetSet = false;
      }
    };
    return { addClickOutsideWidgetListener, removeClickOutsideWidgetListener };
  };
  createOnClickOutsideWidgetHandlers$1.createOnClickOutsideWidgetHandlers = createOnClickOutsideWidgetHandlers;
  Object.defineProperty(createDomEventsManager$1, "__esModule", { value: true });
  createDomEventsManager$1.createDomEventsManager = void 0;
  const utils_1 = utils$1;
  const createOnClickOutsideWidgetHandlers_1 = createOnClickOutsideWidgetHandlers$1;
  const createDomEventsManager = () => {
    let clickOutsideWidgetHandlers;
    const createOnClickOutsideWidgetHandlers2 = ({ clickOutsideElementSelector, handleClickAway }) => {
      clickOutsideWidgetHandlers = (0, createOnClickOutsideWidgetHandlers_1.createOnClickOutsideWidgetHandlers)({
        elementQuerySelector: clickOutsideElementSelector,
        handleClickAway
      });
    };
    const registerNufiWidgetManagementListener = (onNufiWidgetManagementMessage) => {
      window.addEventListener("message", (e) => {
        if (!(0, utils_1.isNufiWidgetManagementMessage)(e))
          return;
        onNufiWidgetManagementMessage(e);
      });
    };
    const getClickOutsideWidgetHandlers = () => {
      if (clickOutsideWidgetHandlers == null) {
        throw Error("On Click Outside Widget Handlers were not created.");
      }
      return clickOutsideWidgetHandlers;
    };
    return {
      registerNufiWidgetManagementListener,
      createOnClickOutsideWidgetHandlers: createOnClickOutsideWidgetHandlers2,
      getClickOutsideWidgetHandlers
    };
  };
  createDomEventsManager$1.createDomEventsManager = createDomEventsManager;
  (function(exports) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(createDomEventsManager$1, exports);
  })(domEventsListeners);
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CORE_SDK_NOT_INITIALIZED = void 0;
    exports.ensureWidgetEmbeddedInIframe = ensureWidgetEmbeddedInIframe;
    const logging_12 = logging;
    const publicUtils_12 = requirePublicUtils();
    const domEventsListeners_1 = domEventsListeners;
    const NUFI_WIDGET_ID = "nufi-widget";
    const NUFI_WIDGET_QUERY_SELECTOR = `iframe#${NUFI_WIDGET_ID}`;
    exports.CORE_SDK_NOT_INITIALIZED = '"initNufiDappSdk" was not called';
    const HIDDEN_WIDGET_SIZE = "1px";
    const createIframe = (url, options) => {
      var _a;
      logging_12.logger.debug('"createIframe"', { url, options });
      const iframe = document.createElement("iframe");
      iframe.id = NUFI_WIDGET_ID;
      iframe.src = url;
      iframe.style.width = HIDDEN_WIDGET_SIZE;
      iframe.style.height = HIDDEN_WIDGET_SIZE;
      iframe.style.position = "fixed";
      iframe.style.bottom = "10px";
      iframe.style.zIndex = `${(_a = options === null || options === void 0 ? void 0 : options.zIndex) !== null && _a !== void 0 ? _a : 0}`;
      iframe.style.colorScheme = "none";
      iframe.frameBorder = 0;
      document.body.appendChild(iframe);
      return iframe;
    };
    let previousIframeUrl = null;
    const getOrCreateIframe = (url, iframeOptions) => {
      const existingIframe = document.querySelector(NUFI_WIDGET_QUERY_SELECTOR);
      let iframeDidRefresh = false;
      if (existingIframe && url !== previousIframeUrl) {
        existingIframe.src = url;
        iframeDidRefresh = true;
      }
      previousIframeUrl = url;
      return existingIframe ? { iframe: existingIframe, isNewIframeCreated: false, iframeDidRefresh } : {
        iframe: createIframe(url, iframeOptions),
        isNewIframeCreated: true,
        iframeDidRefresh: true
      };
    };
    const domEventsManager = (0, domEventsListeners_1.createDomEventsManager)();
    function ensureWidgetEmbeddedInIframe(params) {
      const url = (() => {
        if (previousIframeUrl == null) {
          if (params.type === "prefetch") {
            return params.baseUrl;
          }
          throw new Error(exports.CORE_SDK_NOT_INITIALIZED);
        } else {
          if (params.type === "prefetch") {
            return previousIframeUrl;
          }
          const _url = new URL(previousIframeUrl);
          return `${_url.origin}${_url.pathname}${params.query}`;
        }
      })();
      const iframeOptions = (() => {
        if (params.type === "prefetch") {
          return params.iframeOptions;
        }
        return void 0;
      })();
      const { iframe, isNewIframeCreated, iframeDidRefresh } = getOrCreateIframe(url, iframeOptions);
      const iframeWindow = iframe.contentWindow;
      const sendPortPostMessage = (message, transfer) => {
        iframeWindow.postMessage(message, new URL(url).origin, transfer);
      };
      const sendSimplePostMessage = (message) => {
        iframeWindow.postMessage(message, new URL(url).origin);
      };
      const resizeIframe = (type) => {
        logging_12.logger.debug('"resizeIframe"', type);
        const width = {
          closed: "200px",
          opened: "400px",
          hidden: HIDDEN_WIDGET_SIZE
        };
        const height = {
          closed: "80px",
          opened: "700px",
          hidden: HIDDEN_WIDGET_SIZE
        };
        iframe.style.width = width[type];
        iframe.style.height = height[type];
      };
      const sendCollapseWidgetMessage = () => {
        const priorityTimestamp = (/* @__PURE__ */ new Date()).toISOString();
        logging_12.logger.debug('"sendCollapseWidgetMessage"');
        const message = {
          appId: "nufi",
          method: "collapseWidget",
          priorityTimestamp
        };
        sendSimplePostMessage(message);
      };
      const hideWidget = () => {
        logging_12.logger.debug('"hideWidget"');
        sendCollapseWidgetMessage();
        setTimeout(() => {
          resizeIframe("hidden");
        }, 200);
      };
      if (isNewIframeCreated) {
        domEventsManager.registerNufiWidgetManagementListener((_e) => {
          logging_12.logger.debug('"registerNufiWidgetManagementListener"', {
            method: _e.data.method
          });
          switch (_e.data.method) {
            case "hideWidget": {
              hideWidget();
              break;
            }
            case "closeWidget": {
              resizeIframe("closed");
              break;
            }
            case "openWidget": {
              resizeIframe("opened");
              break;
            }
            case "refreshPage": {
              location.reload();
              break;
            }
            case "getParentWindowDimensionsRequest": {
              const iframe2 = document.querySelector(NUFI_WIDGET_QUERY_SELECTOR);
              if (!iframe2) {
                return;
              }
              const iframeRect = iframe2.getBoundingClientRect();
              const response = {
                appId: "nufi",
                method: "getParentWindowDimensionsResponse",
                dimensions: {
                  width: window.innerWidth,
                  height: window.innerHeight,
                  top: window.screenTop,
                  left: window.screenLeft
                },
                iframeRect: {
                  top: iframeRect.top,
                  right: iframeRect.right,
                  bottom: iframeRect.bottom,
                  left: iframeRect.left,
                  width: iframeRect.width,
                  height: iframeRect.height,
                  x: iframeRect.x,
                  y: iframeRect.y
                }
              };
              (0, publicUtils_12.safeReplyToEvent)(_e, response);
              break;
            }
            default: {
              return;
            }
          }
        });
      }
      const showWidget = () => {
        logging_12.logger.debug('"showWidget"');
        resizeIframe("closed");
      };
      const isWidgetHidden = () => {
        const res = iframe.style.width === HIDDEN_WIDGET_SIZE;
        logging_12.logger.debug('"isWidgetHidden"', res);
        return res;
      };
      return {
        iframeDidRefresh,
        sendPortPostMessage,
        sendSimplePostMessage,
        showWidget,
        hideWidget,
        isWidgetHidden
      };
    }
  })(widget);
  var apiEvents = {};
  var socialLoginInfo = {};
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onSocialLoginInfoChanged = exports.exposeSocialLoginInfo = exports.handleSocialLoginEvents = void 0;
    const listeners = {};
    let socialLoginInfo2 = null;
    const handleSocialLoginEvents = (e) => {
      var _a;
      const event = e.data;
      if (event.method === "socialLoginInfoChanged") {
        socialLoginInfo2 = event.data;
        (_a = listeners[event.method]) === null || _a === void 0 ? void 0 : _a.call(listeners, event.data);
      }
    };
    exports.handleSocialLoginEvents = handleSocialLoginEvents;
    const exposeSocialLoginInfo = () => socialLoginInfo2 ? Object.assign({}, socialLoginInfo2) : null;
    exports.exposeSocialLoginInfo = exposeSocialLoginInfo;
    const onSocialLoginInfoChanged = (cb) => {
      listeners["socialLoginInfoChanged"] = cb;
      return (0, exports.exposeSocialLoginInfo)();
    };
    exports.onSocialLoginInfoChanged = onSocialLoginInfoChanged;
  })(socialLoginInfo);
  Object.defineProperty(apiEvents, "__esModule", { value: true });
  apiEvents.registerWidgetApiEvents = void 0;
  const socialLoginInfo_1 = socialLoginInfo;
  let previousEventListener = null;
  const registerWidgetApiEvents = (widgetOrigin) => {
    if (previousEventListener != null) {
      window.removeEventListener("message", previousEventListener);
      previousEventListener = null;
    }
    const fn = (e) => {
      if (e.origin !== widgetOrigin)
        return;
      (0, socialLoginInfo_1.handleSocialLoginEvents)(e);
    };
    previousEventListener = fn;
    window.addEventListener("message", fn);
  };
  apiEvents.registerWidgetApiEvents = registerWidgetApiEvents;
  var types$2 = {};
  Object.defineProperty(types$2, "__esModule", { value: true });
  var types$1 = {};
  Object.defineProperty(types$1, "__esModule", { value: true });
  var web3AuthProviders = {};
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSupportedWeb3AuthProvider = exports.WEB3_AUTH_LOGIN_PROVIDERS = void 0;
    exports.WEB3_AUTH_LOGIN_PROVIDERS = [
      "google",
      "facebook",
      "discord"
    ];
    const isSupportedWeb3AuthProvider = (provider) => exports.WEB3_AUTH_LOGIN_PROVIDERS.includes(provider);
    exports.isSupportedWeb3AuthProvider = isSupportedWeb3AuthProvider;
  })(web3AuthProviders);
  (function(exports) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CORE_SDK_NOT_INITIALIZED = exports.ensureWidgetEmbeddedInIframe = exports.injectConnectors = exports.getSdkInfoReporter = void 0;
    const injectConnectors_1 = injectConnectors$1;
    const logging_12 = logging;
    const publicUtils_12 = requirePublicUtils();
    const sdkInfo_1 = sdkInfo$1;
    const widget_1 = widget;
    const apiEvents_1 = apiEvents;
    const socialLoginInfo_12 = socialLoginInfo;
    var sdkInfo_2 = sdkInfo$1;
    Object.defineProperty(exports, "getSdkInfoReporter", { enumerable: true, get: function() {
      return sdkInfo_2.getSdkInfoReporter;
    } });
    var injectConnectors_2 = injectConnectors$1;
    Object.defineProperty(exports, "injectConnectors", { enumerable: true, get: function() {
      return injectConnectors_2.injectConnectors;
    } });
    var widget_2 = widget;
    Object.defineProperty(exports, "ensureWidgetEmbeddedInIframe", { enumerable: true, get: function() {
      return widget_2.ensureWidgetEmbeddedInIframe;
    } });
    Object.defineProperty(exports, "CORE_SDK_NOT_INITIALIZED", { enumerable: true, get: function() {
      return widget_2.CORE_SDK_NOT_INITIALIZED;
    } });
    __exportStar(types$2, exports);
    __exportStar(requirePublicUtils(), exports);
    __exportStar(types$1, exports);
    __exportStar(web3AuthProviders, exports);
    let initResult = null;
    const init = (origin = "https://wallet.nu.fi", iframeOptions) => {
      const { hideWidget, sendSimplePostMessage } = (0, widget_1.ensureWidgetEmbeddedInIframe)({
        type: "prefetch",
        baseUrl: `${origin}/widget`,
        iframeOptions
      });
      (0, apiEvents_1.registerWidgetApiEvents)(origin);
      return {
        hideWidget,
        sendSimplePostMessage
      };
    };
    const signOutMessage = {
      appId: "nufi",
      method: "signOut"
    };
    const getApi = () => {
      if (initResult == null) {
        throw new Error(widget_1.CORE_SDK_NOT_INITIALIZED);
      }
      const { hideWidget, sendSimplePostMessage } = initResult;
      return {
        getSocialLoginInfo: socialLoginInfo_12.exposeSocialLoginInfo,
        hideWidget,
        onSocialLoginInfoChanged: socialLoginInfo_12.onSocialLoginInfoChanged,
        signOut: () => sendSimplePostMessage(signOutMessage),
        isMetamaskInstalled
      };
    };
    const getContext = () => {
      if (initResult == null) {
        throw new Error(widget_1.CORE_SDK_NOT_INITIALIZED);
      }
      return {
        ensureWidgetEmbeddedInIframe: widget_1.ensureWidgetEmbeddedInIframe,
        ensureChannelIsReady: publicUtils_12.ensureChannelIsReady,
        injectConnectors: injectConnectors_1.injectConnectors
      };
    };
    const isMetamaskInstalled = () => __awaiter2(void 0, void 0, void 0, function* () {
      try {
        const provider = yield new Promise((resolve) => {
          const onProviderAnnounced = (event) => {
            const providerDetail = event.detail;
            if (providerDetail.info.rdns === "io.metamask") {
              window.removeEventListener("eip6963:announceProvider", onProviderAnnounced);
              resolve(providerDetail.provider);
            }
          };
          window.addEventListener("eip6963:announceProvider", (event) => {
            onProviderAnnounced(event);
          });
          window.dispatchEvent(new Event("eip6963:requestProvider"));
          setTimeout(() => {
            resolve(null);
          }, 3e3);
        });
        if (provider === null)
          return false;
        return true;
      } catch (err) {
        return false;
      }
    });
    const publicNufiCoreSdk = {
      __getContext: getContext,
      __setLogLevel: logging_12.setLogLevel,
      __logger: logging_12.logger,
      __getSdkInfo: sdkInfo_1.getCoreSdkInfo,
      getApi,
      init: (origin, iframeOptions) => {
        initResult = init(origin, iframeOptions);
      }
    };
    exports.default = publicNufiCoreSdk;
  })(dist$1);
  const nufiCoreSdk = /* @__PURE__ */ getDefaultExportFromCjs(dist$1);
  var connector = {};
  var emulatedWalletIcons = {};
  Object.defineProperty(emulatedWalletIcons, "__esModule", { value: true });
  emulatedWalletIcons.emulatedWalletIcons = void 0;
  emulatedWalletIcons.emulatedWalletIcons = {
    eternl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmVkYTJiM2ZhYywgMjAyMS8xMS8xNy0xNzoyMzoxOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4ZmU4ODM0My1iMjExLTQ2YWEtYmE3MS0xZWFiZmZkNWZjMzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NURCQTYwMDhBMTI1MTFFQzhBMjdGRTQzMjI4NjJBRDIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NURCQTYwMDdBMTI1MTFFQzhBMjdGRTQzMjI4NjJBRDIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjEgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1YzY1MGU0NC04MzE3LTQxMjMtOGFlNy03ZWQyZTVlYmVhMTciIHN0UmVmOmRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0N2NhMTg2Yy04YThlLThkNDYtYWE3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",
    flint: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkwIiBoZWlnaHQ9IjE5MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBmaWxsPSJub25lIj4KIDxnPgogIDx0aXRsZT5MYXllciAxPC90aXRsZT4KICA8cGF0aCBkPSJtNTYuMDExLDU5LjM4NWw0My40NjIyLC00NC4wODMzYzIuOTcwOCwtMy4yNTM0IDQuMDMxOCwtMi45MzY1IDUuMDQ0OCwwLjc4NzJsMC4zODgsMzEuNDg4MWMtMC4xMDgsNC45MTM2IC0wLjQ2NSw3LjAzMjYgLTEuOTQsOS4wNTI4bC0yNi4zODgxLDI3LjE1ODVjLTMuNDUwNCw0LjI2NjcgLTIuOTc2OSw1Ljk2OTggLTMuMTA0NCw3Ljg3MmMtMC4xMjc2LDEuOTAyMiAzLjM1NzQsNy40NDg0IDkuMzEzMyw3Ljg3MjFjMCwwIDE2LjE1MDUsMC4wMDMzIDE3Ljg1MDIsMGMxLjcsLTAuMDAzNCAyLjg5MSwyLjczNDYgMCw1LjUxMDZsLTM2LjQ3NjksMzYuNjA1Yy00LjUxNDMsNC4yNTIgLTcuMDY4LDQuMjQgLTExLjY0MTYsMi43NTVjLTcuMDE5NiwtMy45MzUgLTcuMTQ1LC03LjU2NyAtNy4zNjM4LC0xMy45MDFsLTAuMDA5MywtMC4yNjlsMCwtNDAuMTQ3MWMtMC4yNDMxLC0xMi43OTgzIDEuNTg2NiwtMTkuNjE4MSAxMC44NjU2LC0zMC43MDA5eiIgZmlsbD0iI0ZGNjEwMCIgaWQ9InN2Z18xIi8+CiAgPHBhdGggZD0ibTEzNC43MSwxMzEuNTlsLTQ0Ljc3ODgsNDQuMDgzYy0zLjA2MTEsMy4yNTQgLTQuMTU0LDIuOTM3IC01LjE5NzYsLTAuNzg3bC0wLjM5OTgsLTMxLjQ4OGMwLjExMDcsLTQuOTEzIC0wLjA3NTMsLTIuOTk4NTcgNi4zNTAyNiwtMTAuOTI0MjRsMjIuODM1OTQsLTI1LjI4Njc2YzMuNTU1LC00LjI2NyAzLjA2NywtNS45NyAzLjE5OSwtNy44NzIyYzAuMTMxLC0xLjkwMjIgLTMuNDU5LC03LjQ0ODQgLTkuNTk2LC03Ljg3MjFjMCwwIC0xNi42Mzk3LC0wLjAwMzMgLTE4LjM5MTMsMGMtMS43NTE1LDAuMDAzNCAtMi45Nzg3LC0yLjczNSAwLC01LjUxMDRsMzcuNTgyMywtMzYuNjA1YzQuNjUxLC00LjI1MjMgNy4yODMsLTQuMjQwNSAxMS45OTUsLTIuNzU1MmM3LjIzMiwzLjkzNSA3LjM2MSw3LjU2NzQgNy41ODcsMTMuOTAxM2wwLjAwOSwwLjI2ODRsMCw0MC4xNDcyYzAuMjUxLDEyLjc5OSAtMS42MzQsMTkuNjE4IC0xMS4xOTUsMzAuNzAxeiIgZmlsbD0iI0ZGNjEwMCIgaWQ9InN2Z18yIi8+CiA8L2c+Cgo8L3N2Zz4="
  };
  var utils = {};
  (function(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.supportedVotingPurposes = exports.ApiError = exports.ApiErrorCode = void 0;
    exports.ensureCatalystVotingPurpose = ensureCatalystVotingPurpose;
    var ApiErrorCode;
    (function(ApiErrorCode2) {
      ApiErrorCode2[ApiErrorCode2["InvalidRequest"] = -1] = "InvalidRequest";
      ApiErrorCode2[ApiErrorCode2["InternalError"] = -2] = "InternalError";
      ApiErrorCode2[ApiErrorCode2["Refused"] = -3] = "Refused";
      ApiErrorCode2[ApiErrorCode2["UnsupportedVotingPurpose"] = -100] = "UnsupportedVotingPurpose";
      ApiErrorCode2[ApiErrorCode2["InvalidArgumentError"] = -101] = "InvalidArgumentError";
      ApiErrorCode2[ApiErrorCode2["UnknownChoiceError"] = -102] = "UnknownChoiceError";
      ApiErrorCode2[ApiErrorCode2["InvalidBlockDateError"] = -103] = "InvalidBlockDateError";
      ApiErrorCode2[ApiErrorCode2["InvalidVotePlanError"] = -104] = "InvalidVotePlanError";
      ApiErrorCode2[ApiErrorCode2["InvalidVoteOptionError"] = -105] = "InvalidVoteOptionError";
    })(ApiErrorCode || (exports.ApiErrorCode = ApiErrorCode = {}));
    class ApiError {
      constructor(code, info, additionalFields) {
        this.code = code;
        this.info = info;
        if (additionalFields === null || additionalFields === void 0 ? void 0 : additionalFields.rejectedVotes) {
          this.rejectedVotes = additionalFields === null || additionalFields === void 0 ? void 0 : additionalFields.rejectedVotes;
        }
        if (additionalFields === null || additionalFields === void 0 ? void 0 : additionalFields.votingPurpose) {
          this.votingPurpose = additionalFields === null || additionalFields === void 0 ? void 0 : additionalFields.votingPurpose;
        }
      }
    }
    exports.ApiError = ApiError;
    var VotingPurpose;
    (function(VotingPurpose2) {
      VotingPurpose2[VotingPurpose2["CATALYST"] = 0] = "CATALYST";
      VotingPurpose2[VotingPurpose2["OTHER"] = 1] = "OTHER";
    })(VotingPurpose || (VotingPurpose = {}));
    exports.supportedVotingPurposes = [VotingPurpose.CATALYST];
    function ensureCatalystVotingPurpose(purposes) {
      if (!Array.isArray(purposes) || purposes.length === 0) {
        throw new ApiError(ApiErrorCode.InvalidArgumentError, `Invalid Voting Purpose ${JSON.stringify(purposes)}`);
      }
      const unsupportedPurposes = purposes.filter((p) => !exports.supportedVotingPurposes.includes(p));
      if (unsupportedPurposes.length > 0) {
        throw new ApiError(ApiErrorCode.UnsupportedVotingPurpose, `Unsupported Voting Purpose ${unsupportedPurposes.join(" & ")}`, {
          votingPurpose: unsupportedPurposes
        });
      }
    }
  })(utils);
  (function(exports) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createInjectedConnectorFactory = exports.API_VERSION = void 0;
    const dapp_client_core_12 = dist$1;
    const emulatedWalletIcons_1 = emulatedWalletIcons;
    const utils_12 = utils;
    __exportStar(utils, exports);
    const connectorKind = "cardano";
    exports.API_VERSION = "1.1.0";
    const createInjectedConnectorFactory = (options) => (client, config) => {
      const createProxyMethods = (methods) => Object.fromEntries(methods.map((method) => [method, client.proxy[method]]));
      const cip30ApiObject = Object.assign(Object.assign({}, createProxyMethods([
        "getExtensions",
        "getNetworkId",
        "getUtxos",
        "getBalance",
        "getUsedAddresses",
        "getUnusedAddresses",
        "getChangeAddress",
        "getRewardAddresses",
        "signTx",
        "signData",
        "submitTx",
        "getCollateral"
      ])), { experimental: {
        getCollateral: client.proxy.getCollateral
      } });
      const cip62ApiObject = Object.assign(Object.assign(Object.assign({}, cip30ApiObject), createProxyMethods([
        "signVotes",
        "getVotingCredentials",
        "submitDelegation"
      ])), { getVotingPurposes: () => __awaiter2(void 0, void 0, void 0, function* () {
        return utils_12.supportedVotingPurposes;
      }) });
      const cip95ApiObject = Object.assign({}, createProxyMethods([
        "getPubDRepKey",
        "getRegisteredPubStakeKeys",
        "getUnregisteredPubStakeKeys"
      ]));
      const isCip62Enabled = config.connectors.cardano.isCip62Enabled;
      const isCip95Enabled = config.connectors.cardano.isCip95Enabled;
      const connectorObject = Object.assign(Object.assign({ enable: () => __awaiter2(void 0, void 0, void 0, function* () {
        if (!client.isConnectorWindowOpen()) {
          yield client.openConnectorWindow();
        }
        yield client.proxy.enable();
        return Object.assign(Object.assign({}, cip30ApiObject), isCip95Enabled ? { cip95: cip95ApiObject } : {});
      }), isEnabled: options.getIsEnabled(client) }, isCip62Enabled ? {
        catalyst: {
          apiVersion: "0.1.0",
          enable: (purposes) => __awaiter2(void 0, void 0, void 0, function* () {
            (0, utils_12.ensureCatalystVotingPurpose)(purposes);
            if (!client.isConnectorWindowOpen())
              yield client.openConnectorWindow();
            yield client.proxy.enable();
            return cip62ApiObject;
          })
        }
      } : {}), { apiVersion: exports.API_VERSION, name: config.name, icon: config.icons.default, supportedExtensions: [
        ...isCip62Enabled ? [{ cip: 62 }] : [],
        ...isCip95Enabled ? [{ cip: 95 }] : []
      ] });
      return {
        connectorKind,
        type: "withOverrides",
        inject: (window2, walletOverrides) => {
          (0, dapp_client_core_12.set)(window2, [connectorKind, dapp_client_core_12.objKeyByConnectorPlatform[config.connectorPlatform]], connectorObject);
          if (walletOverrides === null || walletOverrides === void 0 ? void 0 : walletOverrides.flint) {
            (0, dapp_client_core_12.setIfDoesNotExist)(window2, [connectorKind, "flint"], Object.assign(Object.assign({}, connectorObject), { name: "Flint Wallet", icon: emulatedWalletIcons_1.emulatedWalletIcons.flint }));
          }
          if (walletOverrides === null || walletOverrides === void 0 ? void 0 : walletOverrides.eternl) {
            const eternlConnector = Object.assign(Object.assign({}, connectorObject), { name: "eternl", icon: emulatedWalletIcons_1.emulatedWalletIcons.eternl, experimental: {
              // without this, e.g. jpg.store fails to recognize eternl wallet
              appVersion: { major: 1, minor: 9, patch: 5 },
              enableLogs: () => {
              }
            } });
            (0, dapp_client_core_12.setIfDoesNotExist)(window2, [connectorKind, "eternl"], eternlConnector);
          }
        },
        eventHandler(method) {
          return __awaiter2(this, void 0, void 0, function* () {
          });
        }
      };
    };
    exports.createInjectedConnectorFactory = createInjectedConnectorFactory;
  })(connector);
  var icons = {};
  Object.defineProperty(icons, "__esModule", { value: true });
  icons.nufiMetamaskIcon = icons.nufiIcon = void 0;
  icons.nufiIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMTZDMCA3LjE2MzQ0IDcuMTYzNDQgMCAxNiAwQzI0LjgzNjYgMCAzMiA3LjE2MzQ0IDMyIDE2QzMyIDI0LjgzNjYgMjQuODM2NiAzMiAxNiAzMkM3LjE2MzQ0IDMyIDAgMjQuODM2NiAwIDE2WiIgZmlsbD0iIzIxMjEyMSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDMwLjVDMjIuNzcgMzAuNSAyOC40NTAyIDI1LjgwNzQgMzAgMTkuNDhIMjUuMTc2MUMyMy43Nzc0IDIzLjIwODMgMjAuMTk2NiAyNS44NiAxNiAyNS44NkMxMS44MDM0IDI1Ljg2IDguMjIyNiAyMy4yMDgzIDYuODIzOTIgMTkuNDhIMkMzLjU0OTg0IDI1LjgwNzQgOS4yMzAwMSAzMC41IDE2IDMwLjVaTTE2IDEuNUMyMi43NyAxLjUgMjguNDUwMiA2LjE5MjYxIDMwIDEyLjUySDI1LjE3NjFDMjMuNzc3NCA4Ljc5MTczIDIwLjE5NjYgNi4xNCAxNiA2LjE0QzExLjgwMzQgNi4xNCA4LjIyMjYgOC43OTE3MyA2LjgyMzkyIDEyLjUySDJDMy41NDk4NCA2LjE5MjYxIDkuMjMwMDEgMS41IDE2IDEuNVpNMTMuNDYyNCAxMi41MkMxMi45NTI4IDEyLjUyIDEyLjUzOTcgMTIuOTM1NSAxMi41Mzk3IDEzLjQ0OFYxOC41NTJDMTIuNTM5NyAxOS4wNjQ1IDEyLjk1MjggMTkuNDggMTMuNDYyNCAxOS40OEgxOC41Mzc2QzE5LjA0NzIgMTkuNDggMTkuNDYwMyAxOS4wNjQ1IDE5LjQ2MDMgMTguNTUyVjEzLjQ0OEMxOS40NjAzIDEyLjkzNTUgMTkuMDQ3MiAxMi41MiAxOC41Mzc2IDEyLjUySDEzLjQ2MjRaIiBmaWxsPSIjQzZGRjAwIi8+Cjwvc3ZnPgo=";
  icons.nufiMetamaskIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI4LjMuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAzMTguNiAzMTguNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMzE4LjYgMzE4LjY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRTI3NjFCO3N0cm9rZTojRTI3NjFCO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDt9Cgkuc3Qxe2ZpbGw6I0U0NzYxQjtzdHJva2U6I0U0NzYxQjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7fQoJLnN0MntmaWxsOiNEN0MxQjM7c3Ryb2tlOiNEN0MxQjM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30KCS5zdDN7ZmlsbDojMjMzNDQ3O3N0cm9rZTojMjMzNDQ3O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDt9Cgkuc3Q0e2ZpbGw6I0NENjExNjtzdHJva2U6I0NENjExNjtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7fQoJLnN0NXtmaWxsOiNFNDc1MUY7c3Ryb2tlOiNFNDc1MUY7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30KCS5zdDZ7ZmlsbDojRjY4NTFCO3N0cm9rZTojRjY4NTFCO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDt9Cgkuc3Q3e2ZpbGw6I0MwQUQ5RTtzdHJva2U6I0MwQUQ5RTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7fQoJLnN0OHtmaWxsOiMxNjE2MTY7c3Ryb2tlOiMxNjE2MTY7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30KCS5zdDl7ZmlsbDojNzYzRDE2O3N0cm9rZTojNzYzRDE2O3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDt9Cgkuc3QxMHtmaWxsOiMyMTIxMjE7fQoJLnN0MTF7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojQzZGRjAwO30KCS5zdDEye2ZpbGw6IzBEMUUzMDt9Cgkuc3QxM3tmaWxsOiNGRkZGRkY7fQo8L3N0eWxlPgo8ZyBpZD0iTGF5ZXJfMV8wMDAwMDA5MjQ0OTYwMTMwNjUyMjkxNzI0MDAwMDAwNzE3NTg0ODQ4MTM1NTIzODUzNV8iPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTI4My4zLDMxLjZsLTEwNy41LDc5LjhsMTkuOS00Ny4xTDI4My4zLDMxLjZ6Ii8+Cgk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzUuMiwzMS42bDEwNi42LDgwLjZsLTE4LjktNDcuOUwzNS4yLDMxLjZ6IE0yNDQuNiwyMTYuN0wyMTYsMjYwLjVsNjEuMywxNi45bDE3LjYtNTkuN0wyNDQuNiwyMTYuN3oKCQkgTTIzLjgsMjE3LjZsMTcuNSw1OS43bDYxLjMtMTYuOUw3NCwyMTYuN0wyMy44LDIxNy42eiIvPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTk5LjEsMTQyLjZMODIsMTY4LjRsNjAuOCwyLjdsLTIuMi02NS40TDk5LjEsMTQyLjZ6IE0yMTkuNCwxNDIuNkwxNzcuMiwxMDVsLTEuNCw2Ni4xbDYwLjctMi43TDIxOS40LDE0Mi42egoJCSBNMTAyLjYsMjYwLjVsMzYuNS0xNy44bC0zMS41LTI0LjZMMTAyLjYsMjYwLjV6IE0xNzkuNCwyNDIuN2wzNi42LDE3LjhsLTUuMS00Mi41TDE3OS40LDI0Mi43eiIvPgoJPHBhdGggY2xhc3M9InN0MiIgZD0iTTIxNiwyNjAuNWwtMzYuNi0xNy44bDIuOSwyMy45bC0wLjMsMTBMMjE2LDI2MC41eiBNMTAyLjYsMjYwLjVsMzQsMTYuMWwtMC4yLTEwbDIuNy0yMy45TDEwMi42LDI2MC41eiIvPgoJPHBhdGggY2xhc3M9InN0MyIgZD0iTTEzNy4yLDIwMi4zbC0zMC41LTlsMjEuNS05LjhMMTM3LjIsMjAyLjN6IE0xODEuMywyMDIuM2w5LTE4LjhsMjEuNiw5LjhMMTgxLjMsMjAyLjN6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q0IiBkPSJNMTAyLjYsMjYwLjVsNS4yLTQzLjlsLTMzLjgsMUwxMDIuNiwyNjAuNXogTTIxMC44LDIxNi43bDUuMiw0My45bDI4LjYtNDIuOUwyMTAuOCwyMTYuN3ogTTIzNi41LDE2OC40CgkJbC02MC43LDIuN2w1LjYsMzEuMmw5LTE4LjhsMjEuNiw5LjhMMjM2LjUsMTY4LjR6IE0xMDYuNywxOTMuM2wyMS42LTkuOGw4LjksMTguOGw1LjctMzEuMmwtNjAuOC0yLjdMMTA2LjcsMTkzLjN6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q1IiBkPSJNODIuMSwxNjguNGwyNS41LDQ5LjdsLTAuOS0yNC43TDgyLjEsMTY4LjR6IE0yMTIsMTkzLjNsLTEuMSwyNC43bDI1LjYtNDkuN0wyMTIsMTkzLjN6IE0xNDIuOSwxNzEuMQoJCWwtNS43LDMxLjJsNy4xLDM2LjhsMS42LTQ4LjVMMTQyLjksMTcxLjF6IE0xNzUuOCwxNzEuMWwtMi45LDE5LjRsMS4zLDQ4LjZsNy4yLTM2LjhMMTc1LjgsMTcxLjF6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMTgxLjQsMjAyLjNsLTcuMiwzNi44bDUuMiwzLjZsMzEuNS0yNC42bDEuMS0yNC43TDE4MS40LDIwMi4zeiBNMTA2LjcsMTkzLjNsMC45LDI0LjdsMzEuNSwyNC42bDUuMi0zLjYKCQlsLTcuMS0zNi44TDEwNi43LDE5My4zeiIvPgoJPHBhdGggY2xhc3M9InN0NyIgZD0iTTE4MiwyNzYuNmwwLjMtMTBsLTIuNy0yLjRoLTQwLjdsLTIuNSwyLjRsMC4yLDEwbC0zNC0xNi4xbDExLjksOS43bDI0LjEsMTYuN0gxODBsMjQuMi0xNi43bDExLjktOS43CgkJTDE4MiwyNzYuNnoiLz4KCTxwYXRoIGNsYXNzPSJzdDgiIGQ9Ik0xNzkuNCwyNDIuN2wtNS4yLTMuNmgtMjkuOWwtNS4yLDMuNmwtMi43LDIzLjlsMi41LTIuNGg0MC43bDIuNywyLjRMMTc5LjQsMjQyLjd6Ii8+Cgk8cGF0aCBjbGFzcz0ic3Q5IiBkPSJNMjg3LjksMTE2LjZsOS4yLTQ0LjFsLTEzLjctNDAuOWwtMTAzLjksNzcuMWw0MCwzMy44TDI3NiwxNTlsMTIuNS0xNC42bC01LjQtMy45bDguNi03LjlsLTYuNy01LjJsOC42LTYuNgoJCUwyODcuOSwxMTYuNnogTTIxLjYsNzIuNWw5LjIsNDQuMWwtNS44LDQuM2w4LjYsNi42bC02LjYsNS4ybDguNiw3LjlsLTUuNCwzLjlsMTIuNCwxNC42bDU2LjUtMTYuNWw0MC0zMy44TDM1LjIsMzEuNkwyMS42LDcyLjV6IgoJCS8+Cgk8cGF0aCBjbGFzcz0ic3Q2IiBkPSJNMjc1LjksMTU5LjFsLTU2LjUtMTYuNWwxNy4yLDI1LjhMMjExLDIxOC4xbDMzLjctMC40aDUwLjJMMjc1LjksMTU5LjF6IE05OS4xLDE0Mi42bC01Ni41LDE2LjVsLTE4LjgsNTguNgoJCUg3NGwzMy42LDAuNGwtMjUuNS00OS43TDk5LjEsMTQyLjZ6IE0xNzUuOCwxNzEuMWwzLjYtNjIuM2wxNi40LTQ0LjRoLTcyLjlsMTYuMiw0NC40bDMuOCw2Mi4zbDEuMywxOS43bDAuMSw0OC40aDI5LjlsMC4yLTQ4LjQKCQlMMTc1LjgsMTcxLjF6Ii8+CjwvZz4KPGcgaWQ9IkxheWVyXzJfMDAwMDAwMTg5NDI2NDc1ODI1NTk2Mjk3OTAwMDAwMDQ3MDk1NDU4NDI3Nzk1ODU5MzVfIj4KCTxwYXRoIGNsYXNzPSJzdDEwIiBkPSJNMTgzLjIsMjUwLjNjMC0zNS41LDI4LjgtNjQuMiw2NC4yLTY0LjJjMzUuNSwwLDY0LjMsMjguOCw2NC4zLDY0LjJjMCwzNS41LTI4LjgsNjQuMi02NC4zLDY0LjIKCQlTMTgzLjIsMjg1LjcsMTgzLjIsMjUwLjN6Ii8+Cgk8cGF0aCBjbGFzcz0ic3QxMSIgZD0iTTI0Ny40LDMwOC41YzI3LjIsMCw1MC0xOC44LDU2LjItNDQuM2gtMTkuNGMtNS42LDE1LTIwLDI1LjYtMzYuOCwyNS42cy0zMS4yLTEwLjYtMzYuOC0yNS42aC0xOS40CgkJQzE5Ny40LDI4OS42LDIyMC4yLDMwOC41LDI0Ny40LDMwOC41eiBNMjQ3LjQsMTkyYzI3LjIsMCw1MCwxOC44LDU2LjIsNDQuM2gtMTkuNGMtNS42LTE1LTIwLTI1LjYtMzYuOC0yNS42cy0zMS4yLDEwLjYtMzYuOCwyNS42CgkJaC0xOS40QzE5Ny40LDIxMC45LDIyMC4yLDE5MiwyNDcuNCwxOTJ6IE0yMzcuMiwyMzYuM2MtMiwwLTMuNywxLjctMy43LDMuN3YyMC41YzAsMi4xLDEuNywzLjcsMy43LDMuN2gyMC40YzIsMCwzLjctMS43LDMuNy0zLjcKCQlWMjQwYzAtMi4xLTEuNy0zLjctMy43LTMuN0gyMzcuMnoiLz4KPC9nPgo8cGF0aCBjbGFzcz0ic3QxMiIgZD0iTTI0Ny41LDMxNC41YzM1LjUsMCw2NC4zLTI4LjgsNjQuMy02NC4zYzAtMzUuNS0yOC44LTY0LjMtNjQuMy02NC4zYy0zNS41LDAtNjQuMywyOC44LTY0LjMsNjQuMwoJQzE4My4yLDI4NS43LDIxMiwzMTQuNSwyNDcuNSwzMTQuNXoiLz4KPGc+Cgk8cGF0aCBkPSJNMjQ2LjMsMjEwLjNjMS45LTEsNC4zLDEuMywzLjMsMy4yYy0wLjYsMS41LTIuOSwyLTQsMC44QzI0NC40LDIxMy4yLDI0NC44LDIxMC45LDI0Ni4zLDIxMC4zTDI0Ni4zLDIxMC4zeiBNMjI1LjYsMjEyLjUKCQljMS4yLTAuNSwyLjcsMC42LDIuNSwxLjhjMC4xLDEuNC0xLjYsMi40LTIuOCwxLjdDMjIzLjgsMjE1LjUsMjI0LDIxMi45LDIyNS42LDIxMi41eiBNMjY4LjEsMjE2LjFjLTEuOC0wLjItMi4xLTMtMC40LTMuNgoJCWMxLjQtMC43LDIuNiwwLjYsMi44LDEuOEMyNzAuMiwyMTUuNCwyNjkuMywyMTYuNCwyNjguMSwyMTYuMXogTTIzMC4zLDIyMS4yYzItMS4yLDQuNywwLjYsNC40LDIuOGMtMC4xLDIuMy0zLjEsMy42LTQuOSwyCgkJQzIyOC4zLDIyNC45LDIyOC41LDIyMi4xLDIzMC4zLDIyMS4yeiBNMjYwLjIsMjIyLjVjMC45LTIuMiw0LjQtMi4zLDUuNC0wLjFjMSwxLjctMC4yLDMuOC0yLDQuMwoJCUMyNjEuMywyMjcuMSwyNTkuMSwyMjQuNiwyNjAuMiwyMjIuNXogTTI0My45LDIyNi41YzAtMS45LDEuNy0zLjMsMy42LTMuNWMxLjIsMC4yLDIuNSwwLjgsMy4xLDJjMSwxLjcsMC4xLDQtMS42LDQuNwoJCWMtMC44LDAuNC0xLjgsMC4zLTIuNiwwLjJDMjQ0LjksMjI5LjQsMjQzLjcsMjI4LjEsMjQzLjksMjI2LjV6IE0yMTMuMSwyMjkuM2MxLjgtMS4xLDQuMiwwLjksMy41LDIuOGMtMC40LDEuNy0yLjYsMi4zLTMuOSwxLjMKCQlDMjExLjMsMjMyLjQsMjExLjUsMjMwLDIxMy4xLDIyOS4zTDIxMy4xLDIyOS4zeiBNMjc5LjIsMjI5LjNjMS41LTEuMiw0LDAuMiwzLjgsMi4xYzAuMSwxLjctMi4xLDMtMy42LDIuMQoJCUMyNzcuOCwyMzIuOCwyNzcuNiwyMzAuMiwyNzkuMiwyMjkuM0wyNzkuMiwyMjkuM3ogTTI1Mi41LDIzMi43YzIuNS0wLjksNS41LDAuMiw2LjksMi40YzEuOSwyLjcsMC45LDYuOC0yLDguMwoJCWMtMywxLjgtNy40LDAuMy04LjYtM0MyNDcuNSwyMzcuNCwyNDkuNCwyMzMuNywyNTIuNSwyMzIuN0wyNTIuNSwyMzIuN3ogTTIzNy44LDIzM2MyLjgtMS4zLDYuNS0wLjIsNy44LDIuNgoJCWMxLjYsMi43LDAuNCw2LjUtMi41LDcuOWMtMi44LDEuNi02LjgsMC40LTguMi0yLjVDMjMzLjUsMjM4LjEsMjM0LjksMjM0LjMsMjM3LjgsMjMzeiBNMjIzLjEsMjM4YzAuMi0xLjgsMS45LTIuOSwzLjYtMwoJCWMwLjksMC4xLDEuNywwLjUsMi4zLDEuMWMwLjYsMC42LDEsMS40LDEuMSwyLjNjLTAuMSwxLjgtMS41LDMuNi0zLjUsMy42QzIyNC42LDI0Mi4xLDIyMi43LDI0MCwyMjMuMSwyMzh6IE0yNjYuNSwyMzUuMwoJCWMyLjItMS4zLDUuMiwwLjYsNS4yLDMuMWMwLjEsMi42LTMuMiw0LjUtNS40LDIuOUMyNjQsMjQwLDI2NC4yLDIzNi40LDI2Ni41LDIzNS4zeiBNMjMxLjksMjQ0LjZjMi42LTAuNyw1LjUsMC41LDYuOCwyLjgKCQljMS40LDIuMywwLjgsNS42LTEuMyw3LjNjLTIuOCwyLjUtNy44LDEuNS05LjMtMS45QzIyNi4zLDI0OS42LDIyOC40LDI0NS40LDIzMS45LDI0NC42TDIzMS45LDI0NC42eiBNMjU5LjcsMjQ0LjYKCQljMi41LTAuNyw1LjQsMC4yLDYuOCwyLjVjMS44LDIuNiwwLjksNi40LTEuNyw4Yy0yLjgsMS45LTcuMSwwLjktOC42LTIuMUMyNTQuMywyNDkuOSwyNTYuMiwyNDUuNSwyNTkuNywyNDQuNnogTTIxNS4zLDI0Ny41CgkJYzIuMi0wLjgsNC43LDEuNiwzLjgsMy43Yy0wLjUsMi0zLjQsMi43LTQuOCwxLjJDMjEyLjYsMjUxLjEsMjEzLjIsMjQ4LjEsMjE1LjMsMjQ3LjV6IE0yNzUuNSwyNTAuNmMwLTAuOSwwLjMtMS43LDAuOS0yLjQKCQljMC42LTAuNywxLjQtMS4xLDIuMy0xLjFjMS41LDAuMiwzLDEuNCwyLjksMy4xYzAuMSwyLjEtMi41LDMuNi00LjQsMi42QzI3Ni4zLDI1Mi40LDI3NS45LDI1MS41LDI3NS41LDI1MC42eiBNMjA0LjQsMjQ4LjYKCQljMS4zLTAuNiwzLDAuNiwyLjcsMmMtMC4xLDEuNy0yLjYsMi4zLTMuNSwwLjlDMjAyLjksMjUwLjUsMjAzLjMsMjQ5LjEsMjA0LjQsMjQ4LjZMMjA0LjQsMjQ4LjZ6IE0yODguNiwyNDguNQoJCWMwLjktMC43LDIuNS0wLjIsMi44LDAuOWMwLjYsMS4yLTAuNSwyLjgtMS45LDIuNkMyODcuNiwyNTIuMiwyODcsMjQ5LjQsMjg4LjYsMjQ4LjV6IE0yMzkuMSwyNTYuNWMzLjUtMC45LDcuMywyLDcuMyw1LjUKCQljMC4yLDMuNi0zLjUsNi44LTcuMSw2Yy0yLjgtMC40LTUtMy4xLTQuOS01LjhDMjM0LjUsMjU5LjUsMjM2LjUsMjU3LDIzOS4xLDI1Ni41eiBNMjUzLDI1Ni40YzMuNi0xLDcuNSwyLDcuNCw1LjYKCQljMC4yLDMuNS0zLjQsNi42LTYuOSw1LjljLTMuMy0wLjQtNS44LTQtNC44LTcuMkMyNDkuMSwyNTguNywyNTAuOSwyNTcsMjUzLDI1Ni40TDI1MywyNTYuNHogTTIyNi4yLDI1OC42CgkJYzIuNS0wLjQsNC44LDIuMywzLjgsNC42Yy0wLjcsMi41LTQuNCwzLjEtNiwxLjFDMjIyLjEsMjYyLjQsMjIzLjUsMjU4LjksMjI2LjIsMjU4LjZ6IE0yNjcsMjU4LjdjMi4yLTAuOSw0LjksMSw0LjcsMy4zCgkJYzAuMSwyLjYtMy4yLDQuNC01LjQsMi45QzI2My45LDI2My42LDI2NC4zLDI1OS42LDI2NywyNTguN3ogTTI3OC40LDI3MGMtMC45LTEuNiwwLjctMy43LDIuNS0zLjRjMC45LDAsMS41LDAuNywyLjEsMS4yCgkJYzAuMSwwLjksMC4zLDIuMS0wLjUsMi44QzI4MS40LDI3MiwyNzksMjcxLjYsMjc4LjQsMjcweiBNMjEzLDI2Ny4xYzEuNy0xLjEsNC4xLDAuNSwzLjcsMi41Yy0wLjIsMS43LTIuNCwyLjctMy44LDEuNwoJCUMyMTEuNCwyNzAuMywyMTEuNSwyNjcuOCwyMTMsMjY3LjF6IE0yNDYsMjcwLjZjMi4yLTAuOSw1LDAuOSw0LjgsMy4zYzAuMiwyLjYtMy4zLDQuNC01LjQsMi45QzI0Mi45LDI3NS40LDI0My4zLDI3MS40LDI0NiwyNzAuNgoJCXogTTIzMC43LDI3NC4xYzEuOS0xLDQuMywwLjcsNC4yLDIuN2MwLjEsMS43LTEuNiwzLjEtMy4zLDIuOWMtMS40LDAtMi4zLTEuMy0yLjgtMi40QzIyOC45LDI3NiwyMjkuNCwyNzQuNiwyMzAuNywyNzQuMQoJCUwyMzAuNywyNzQuMXogTTI2MS42LDI3NC4xYzEuOS0xLjIsNC42LDAuNSw0LjQsMi43YzAsMi4zLTMsMy44LTQuOCwyLjJDMjU5LjUsMjc3LjksMjU5LjcsMjc1LjEsMjYxLjYsMjc0LjF6IE0yNjcsMjg3LjIKCQljLTAuOS0xLjMsMC4xLTIuOCwxLjUtMy4xYzEuMSwwLjIsMi4zLDEsMi4xLDIuM0MyNzAuNCwyODguMSwyNjcuOCwyODguNywyNjcsMjg3LjJMMjY3LDI4Ny4yeiBNMjI0LjMsMjg2LjFjMC4zLTEsMS4yLTIsMi40LTEuNwoJCWMxLjcsMC4xLDIuMywyLjcsMC43LDMuNUMyMjYuMSwyODguOCwyMjQuNSwyODcuNSwyMjQuMywyODYuMXogTTI0NC45LDI4Ny4yYzAuMy0xLjUsMi4zLTIuMiwzLjYtMS40YzAuOSwwLjQsMS4xLDEuMywxLjMsMi4xCgkJYy0wLjEsMC40LTAuMiwwLjgtMC4zLDEuMmMtMC41LDAuNi0xLjIsMS4yLTIuMSwxLjJDMjQ1LjgsMjkwLjYsMjQ0LjMsMjg4LjcsMjQ0LjksMjg3LjJMMjQ0LjksMjg3LjJ6Ii8+CjwvZz4KPHBhdGggY2xhc3M9InN0MTMiIGQ9Ik0yNDYuMywyMTAuM2MxLjktMSw0LjMsMS4zLDMuMywzLjJjLTAuNiwxLjUtMi45LDItNCwwLjhDMjQ0LjQsMjEzLjIsMjQ0LjgsMjEwLjksMjQ2LjMsMjEwLjNMMjQ2LjMsMjEwLjN6CgkgTTIyNS42LDIxMi41YzEuMi0wLjUsMi43LDAuNiwyLjUsMS44YzAuMSwxLjQtMS42LDIuNC0yLjgsMS43QzIyMy44LDIxNS41LDIyNCwyMTIuOSwyMjUuNiwyMTIuNXogTTI2OC4xLDIxNi4xCgljLTEuOC0wLjItMi4xLTMtMC40LTMuNmMxLjQtMC43LDIuNiwwLjYsMi44LDEuOEMyNzAuMiwyMTUuNCwyNjkuMywyMTYuNCwyNjguMSwyMTYuMXogTTIzMC4zLDIyMS4yYzItMS4yLDQuNywwLjYsNC40LDIuOAoJYy0wLjEsMi4zLTMuMSwzLjYtNC45LDJDMjI4LjMsMjI0LjksMjI4LjUsMjIyLjEsMjMwLjMsMjIxLjJ6IE0yNjAuMiwyMjIuNWMwLjktMi4yLDQuNC0yLjMsNS40LTAuMWMxLDEuNy0wLjIsMy44LTIsNC4zCglDMjYxLjMsMjI3LjEsMjU5LjEsMjI0LjYsMjYwLjIsMjIyLjV6IE0yNDMuOSwyMjYuNWMwLTEuOSwxLjctMy4zLDMuNi0zLjVjMS4yLDAuMiwyLjUsMC44LDMuMSwyYzEsMS43LDAuMSw0LTEuNiw0LjcKCWMtMC44LDAuNC0xLjgsMC4zLTIuNiwwLjJDMjQ0LjksMjI5LjQsMjQzLjcsMjI4LjEsMjQzLjksMjI2LjV6IE0yMTMuMSwyMjkuM2MxLjgtMS4xLDQuMiwwLjksMy41LDIuOGMtMC40LDEuNy0yLjYsMi4zLTMuOSwxLjMKCUMyMTEuMywyMzIuNCwyMTEuNSwyMzAsMjEzLjEsMjI5LjNMMjEzLjEsMjI5LjN6IE0yNzkuMiwyMjkuM2MxLjUtMS4yLDQsMC4yLDMuOCwyLjFjMC4xLDEuNy0yLjEsMy0zLjYsMi4xCglDMjc3LjgsMjMyLjgsMjc3LjYsMjMwLjIsMjc5LjIsMjI5LjNMMjc5LjIsMjI5LjN6IE0yNTIuNSwyMzIuN2MyLjUtMC45LDUuNSwwLjIsNi45LDIuNGMxLjksMi43LDAuOSw2LjgtMiw4LjMKCWMtMywxLjgtNy40LDAuMy04LjYtM0MyNDcuNSwyMzcuNCwyNDkuNCwyMzMuNywyNTIuNSwyMzIuN0wyNTIuNSwyMzIuN3ogTTIzNy44LDIzM2MyLjgtMS4zLDYuNS0wLjIsNy44LDIuNgoJYzEuNiwyLjcsMC40LDYuNS0yLjUsNy45Yy0yLjgsMS42LTYuOCwwLjQtOC4yLTIuNUMyMzMuNSwyMzguMSwyMzQuOSwyMzQuMywyMzcuOCwyMzN6IE0yMjMuMSwyMzhjMC4yLTEuOCwxLjktMi45LDMuNi0zCgljMC45LDAuMSwxLjcsMC41LDIuMywxLjFjMC42LDAuNiwxLDEuNCwxLjEsMi4zYy0wLjEsMS44LTEuNSwzLjYtMy41LDMuNkMyMjQuNiwyNDIuMSwyMjIuNywyNDAsMjIzLjEsMjM4eiBNMjY2LjUsMjM1LjMKCWMyLjItMS4zLDUuMiwwLjYsNS4yLDMuMWMwLjEsMi42LTMuMiw0LjUtNS40LDIuOUMyNjQsMjQwLDI2NC4yLDIzNi40LDI2Ni41LDIzNS4zeiBNMjMxLjksMjQ0LjZjMi42LTAuNyw1LjUsMC41LDYuOCwyLjgKCWMxLjQsMi4zLDAuOCw1LjYtMS4zLDcuM2MtMi44LDIuNS03LjgsMS41LTkuMy0xLjlDMjI2LjMsMjQ5LjYsMjI4LjQsMjQ1LjQsMjMxLjksMjQ0LjZMMjMxLjksMjQ0LjZ6IE0yNTkuNywyNDQuNgoJYzIuNS0wLjcsNS40LDAuMiw2LjgsMi41YzEuOCwyLjYsMC45LDYuNC0xLjcsOGMtMi44LDEuOS03LjEsMC45LTguNi0yLjFDMjU0LjMsMjQ5LjksMjU2LjIsMjQ1LjUsMjU5LjcsMjQ0LjZ6IE0yMTUuMywyNDcuNQoJYzIuMi0wLjgsNC43LDEuNiwzLjgsMy43Yy0wLjUsMi0zLjQsMi43LTQuOCwxLjJDMjEyLjYsMjUxLjEsMjEzLjIsMjQ4LjEsMjE1LjMsMjQ3LjV6IE0yNzUuNSwyNTAuNmMwLTAuOSwwLjMtMS43LDAuOS0yLjQKCWMwLjYtMC43LDEuNC0xLjEsMi4zLTEuMWMxLjUsMC4yLDMsMS40LDIuOSwzLjFjMC4xLDIuMS0yLjUsMy42LTQuNCwyLjZDMjc2LjMsMjUyLjQsMjc1LjksMjUxLjUsMjc1LjUsMjUwLjZ6IE0yMDQuNCwyNDguNgoJYzEuMy0wLjYsMywwLjYsMi43LDJjLTAuMSwxLjctMi42LDIuMy0zLjUsMC45QzIwMi45LDI1MC41LDIwMy4zLDI0OS4xLDIwNC40LDI0OC42TDIwNC40LDI0OC42eiBNMjg4LjYsMjQ4LjUKCWMwLjktMC43LDIuNS0wLjIsMi44LDAuOWMwLjYsMS4yLTAuNSwyLjgtMS45LDIuNkMyODcuNiwyNTIuMiwyODcsMjQ5LjQsMjg4LjYsMjQ4LjV6IE0yMzkuMSwyNTYuNWMzLjUtMC45LDcuMywyLDcuMyw1LjUKCWMwLjIsMy42LTMuNSw2LjgtNy4xLDZjLTIuOC0wLjQtNS0zLjEtNC45LTUuOEMyMzQuNSwyNTkuNSwyMzYuNSwyNTcsMjM5LjEsMjU2LjV6IE0yNTMsMjU2LjRjMy42LTEsNy41LDIsNy40LDUuNgoJYzAuMiwzLjUtMy40LDYuNi02LjksNS45Yy0zLjMtMC40LTUuOC00LTQuOC03LjJDMjQ5LjEsMjU4LjcsMjUwLjksMjU3LDI1MywyNTYuNEwyNTMsMjU2LjR6IE0yMjYuMiwyNTguNmMyLjUtMC40LDQuOCwyLjMsMy44LDQuNgoJYy0wLjcsMi41LTQuNCwzLjEtNiwxLjFDMjIyLjEsMjYyLjQsMjIzLjUsMjU4LjksMjI2LjIsMjU4LjZ6IE0yNjcsMjU4LjdjMi4yLTAuOSw0LjksMSw0LjcsMy4zYzAuMSwyLjYtMy4yLDQuNC01LjQsMi45CglDMjYzLjksMjYzLjYsMjY0LjMsMjU5LjYsMjY3LDI1OC43eiBNMjc4LjQsMjcwYy0wLjktMS42LDAuNy0zLjcsMi41LTMuNGMwLjksMCwxLjUsMC43LDIuMSwxLjJjMC4xLDAuOSwwLjMsMi4xLTAuNSwyLjgKCUMyODEuNCwyNzIsMjc5LDI3MS42LDI3OC40LDI3MHogTTIxMywyNjcuMWMxLjctMS4xLDQuMSwwLjUsMy43LDIuNWMtMC4yLDEuNy0yLjQsMi43LTMuOCwxLjdDMjExLjQsMjcwLjMsMjExLjUsMjY3LjgsMjEzLDI2Ny4xegoJIE0yNDYsMjcwLjZjMi4yLTAuOSw1LDAuOSw0LjgsMy4zYzAuMiwyLjYtMy4zLDQuNC01LjQsMi45QzI0Mi45LDI3NS40LDI0My4zLDI3MS40LDI0NiwyNzAuNnogTTIzMC43LDI3NC4xYzEuOS0xLDQuMywwLjcsNC4yLDIuNwoJYzAuMSwxLjctMS42LDMuMS0zLjMsMi45Yy0xLjQsMC0yLjMtMS4zLTIuOC0yLjRDMjI4LjksMjc2LDIyOS40LDI3NC42LDIzMC43LDI3NC4xTDIzMC43LDI3NC4xeiBNMjYxLjYsMjc0LjEKCWMxLjktMS4yLDQuNiwwLjUsNC40LDIuN2MwLDIuMy0zLDMuOC00LjgsMi4yQzI1OS41LDI3Ny45LDI1OS43LDI3NS4xLDI2MS42LDI3NC4xeiBNMjY3LDI4Ny4yYy0wLjktMS4zLDAuMS0yLjgsMS41LTMuMQoJYzEuMSwwLjIsMi4zLDEsMi4xLDIuM0MyNzAuNCwyODguMSwyNjcuOCwyODguNywyNjcsMjg3LjJMMjY3LDI4Ny4yeiBNMjI0LjMsMjg2LjFjMC4zLTEsMS4yLTIsMi40LTEuN2MxLjcsMC4xLDIuMywyLjcsMC43LDMuNQoJQzIyNi4xLDI4OC44LDIyNC41LDI4Ny41LDIyNC4zLDI4Ni4xeiBNMjQ0LjksMjg3LjJjMC4zLTEuNSwyLjMtMi4yLDMuNi0xLjRjMC45LDAuNCwxLjEsMS4zLDEuMywyLjFjLTAuMSwwLjQtMC4yLDAuOC0wLjMsMS4yCgljLTAuNSwwLjYtMS4yLDEuMi0yLjEsMS4yQzI0NS44LDI5MC42LDI0NC4zLDI4OC43LDI0NC45LDI4Ny4yTDI0NC45LDI4Ny4yeiIvPgo8L3N2Zz4K";
  var sdkInfo = {};
  const name = "@nufi/dapp-client-cardano";
  const version = "0.3.5";
  const license = "MIT";
  const homepage = "https://github.com/nufi-official/dapp-client/tree/master/cardano";
  const repository = {
    type: "git",
    url: "git://github.com/nufi-official/dapp-client.git"
  };
  const main = "dist/index.js";
  const types = "dist/index";
  const files = [
    "dist"
  ];
  const scripts = {
    build: "rm -rf dist && tsc",
    "test:tsc": "tsc --noEmit",
    test: "yarn test:tsc",
    watch: "tsc --watch",
    prepublishOnly: "rm -rf dist && yarn test && yarn build"
  };
  const dependencies = {
    "@nufi/dapp-client-core": "0.3.5"
  };
  const devDependencies = {
    typescript: "^5.5.3"
  };
  const packageManager = "yarn@4.1.0";
  const require$$1 = {
    name,
    version,
    license,
    homepage,
    repository,
    main,
    types,
    files,
    scripts,
    dependencies,
    devDependencies,
    packageManager
  };
  Object.defineProperty(sdkInfo, "__esModule", { value: true });
  sdkInfo.sdkInfoReporter = sdkInfo.getCardanoSdkInfo = void 0;
  const dapp_client_core_1 = dist$1;
  const getCardanoSdkInfo = () => {
    let version2 = "";
    try {
      version2 = require$$1.version;
    } catch (err) {
    }
    return { sdkType: "cardano", version: version2 };
  };
  sdkInfo.getCardanoSdkInfo = getCardanoSdkInfo;
  sdkInfo.sdkInfoReporter = (0, dapp_client_core_1.getSdkInfoReporter)();
  (function(exports) {
    var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    var __awaiter2 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initNufiDappCardanoSdk = void 0;
    const dapp_client_core_12 = dist$1;
    const connector_1 = connector;
    const icons_1 = icons;
    const sdkInfo_1 = sdkInfo;
    __exportStar(connector, exports);
    const loginTypeProps = {
      metamask: {
        icon: icons_1.nufiMetamaskIcon,
        connectorPlatform: "snap",
        name: "Cardano Wallet"
      },
      web3Auth: {
        icon: icons_1.nufiIcon,
        connectorPlatform: "sso",
        name: "NuFiConnect"
      }
    };
    const getDappConnectorsConfig = ({ loginType }) => {
      const { icon, connectorPlatform, name: name2 } = loginTypeProps[loginType];
      return {
        appId: "nufi",
        connectorPlatform,
        icons: {
          default: icon
        },
        name: name2,
        connectors: {
          cardano: {
            isCip62Enabled: false,
            isCip95Enabled: true
          }
        }
      };
    };
    const initNufiDappCardanoSdk = (sdk, type, options) => {
      sdk.__logger.debug('"initNufiDappCardanoSdk');
      const { ensureWidgetEmbeddedInIframe, ensureChannelIsReady, injectConnectors: injectConnectors2 } = sdk.__getContext();
      const loginType = {
        sso: "web3Auth",
        snap: "metamask"
      }[type];
      if ((options === null || options === void 0 ? void 0 : options.provider) != null && !(0, dapp_client_core_12.isSupportedWeb3AuthProvider)(options === null || options === void 0 ? void 0 : options.provider)) {
        throw new Error("Unsupported web3Auth provider.");
      }
      const loginInfo = Object.assign({ loginType }, type === "sso" && (options === null || options === void 0 ? void 0 : options.provider) ? { provider: options.provider } : {});
      const queryString = new URLSearchParams(Object.assign({ blockchain: "cardano" }, loginInfo)).toString();
      const { sendPortPostMessage, sendSimplePostMessage, showWidget, isWidgetHidden, iframeDidRefresh } = ensureWidgetEmbeddedInIframe({
        type: "updateQueryString",
        query: `?${queryString}`
      });
      const config = getDappConnectorsConfig({
        loginType
      });
      if (iframeDidRefresh) {
        const initChannelData = {
          type: "widget",
          data: {
            connectorKind: "cardano",
            connectorPlatform: config.connectorPlatform
          }
        };
        injectConnectors2({
          connectorsToInject: {
            cardano: (0, connector_1.createInjectedConnectorFactory)({
              // Note that we are not checking whether the connector window is open,
              // as we want the request to be redirected to widget in all cases.
              // That is so that the we can return `true` after user refreshes the page.
              getIsEnabled: (client) => () => __awaiter2(void 0, void 0, void 0, function* () {
                return yield client.proxy.isEnabled();
              })
            })
          },
          config,
          currentContext: "sdk",
          targetContext: "widget",
          sendPortPostMessage,
          onBeforeFirstSend: () => __awaiter2(void 0, void 0, void 0, function* () {
            sdk.__logger.debug('"initNufiDappCardanoSdk: onBeforeRequest" onBeforeFirstSend');
            yield ensureChannelIsReady(config.appId, config.connectorPlatform, "cardano", sendSimplePostMessage);
            sdkInfo_1.sdkInfoReporter.tryReportingOnce(sendSimplePostMessage, [
              sdk.__getSdkInfo(),
              (0, sdkInfo_1.getCardanoSdkInfo)()
            ]);
          }),
          // As dapp developers have to be aware of integrating NuFi, wallet
          // overrides do not make much sense
          overridableWallets: [],
          onBeforeRequest: ({ connectorKind, method }) => {
            sdk.__logger.debug('"initNufiDappCardanoSdk: onBeforeRequest"', {
              connectorKind,
              method
            });
            if (connectorKind !== "cardano")
              return;
            if (isWidgetHidden() && method === "openConnectorWindow") {
              sdk.__logger.debug('"initNufiDappCardanoSdk: onBeforeRequest" showWidget');
              showWidget();
            }
          },
          initChannelData
        });
      }
    };
    exports.initNufiDappCardanoSdk = initNufiDappCardanoSdk;
  })(dist$2);
  class NufiSnapHandler extends DefaultWalletHandler {
    async disconnect() {
      super.disconnect();
      nufiCoreSdk.getApi().hideWidget();
    }
  }
  const nufiSnap = createCustomWallet({
    initialize: runOnce(async () => {
      nufiCoreSdk.init("https://wallet.nu.fi");
      dist$2.initNufiDappCardanoSdk(nufiCoreSdk, "snap");
      return true;
    }),
    connector: getDefaultWalletConnector(NufiSnapHandler)
  });
  const customWallets = {
    eternl,
    nufiSnap
  };
  function hasCustomImplementation(key) {
    return !!customWallets[key];
  }
  function isBrowser() {
    return typeof window !== "undefined";
  }
  const UNSAFE_LIB_USAGE_ERROR = "Anvil Weld relies on DOM APIs and may produce unpredictable results if used outside of a browser environment.";
  async function connect(key) {
    if (!isBrowser() && !weld.config.getState().ignoreUnsafeUsageError) {
      console.error(UNSAFE_LIB_USAGE_ERROR);
    }
    if (hasCustomImplementation(key)) {
      return customWallets[key].connector(key);
    }
    return getDefaultWalletConnector()(key);
  }
  function newInstalledExtensions() {
    return {
      supportedMap: /* @__PURE__ */ new Map(),
      unsupportedMap: /* @__PURE__ */ new Map(),
      allMap: /* @__PURE__ */ new Map(),
      supportedArr: [],
      unsupportedArr: [],
      allArr: []
    };
  }
  const cache = /* @__PURE__ */ new Map();
  async function getInstalledExtensions({
    caching = true
  } = {}) {
    const walletExtensions = await getWalletExtensions();
    const res = newInstalledExtensions();
    for (const extension of walletExtensions) {
      const info = getWalletInfo(extension);
      let api;
      if (!caching) {
        api = { info, defaultApi: extension.defaultApi };
      } else {
        api = cache.get(extension.defaultApi) ?? { info, defaultApi: extension.defaultApi };
      }
      cache.set(extension.defaultApi, api);
      res.allMap.set(info.key, api);
      res.allArr.push(api);
      if (info.supported) {
        res.supportedMap.set(info.key, api);
        res.supportedArr.push(api);
      } else {
        res.unsupportedMap.set(info.key, api);
        res.unsupportedArr.push(api);
      }
    }
    return res;
  }
  const defaultStorage = {
    get(key) {
      var _a;
      try {
        const arr = ((_a = document == null ? void 0 : document.cookie) == null ? void 0 : _a.split("; ")) ?? [];
        for (const str of arr) {
          const [k, v] = str.split("=");
          if (k === key) {
            return v;
          }
        }
        return void 0;
      } catch {
        return void 0;
      }
    },
    set(key, value) {
      const exp = new Date(Date.now() + 400 * 24 * 60 * 60 * 1e3);
      document.cookie = `${key}=${value}; expires=${exp.toUTCString()}; path=/;`;
    },
    remove(key) {
      document.cookie = `${key}=; expires=${(/* @__PURE__ */ new Date(0)).toUTCString()}; path=/;`;
    }
  };
  class SubscriptionManager {
    constructor() {
      __publicField(this, "_subscriptions", /* @__PURE__ */ new Set());
    }
    add(unsubscribe) {
      this._subscriptions.add(unsubscribe);
      return () => {
        unsubscribe();
        this._subscriptions.delete(unsubscribe);
      };
    }
    clearAll() {
      for (const unsubscribe of this._subscriptions) {
        unsubscribe();
      }
      this._subscriptions.clear();
    }
  }
  class InFlightManager {
    constructor() {
      __publicField(this, "_inFlight", /* @__PURE__ */ new Set());
    }
    add() {
      const signal = { aborted: false };
      this._inFlight.add(signal);
      return signal;
    }
    remove(signal) {
      this._inFlight.delete(signal);
    }
    abortAll() {
      for (const inFlight of this._inFlight) {
        inFlight.aborted = true;
      }
      this._inFlight.clear();
    }
  }
  class LifeCycleManager {
    constructor() {
      __publicField(this, "subscriptions", new SubscriptionManager());
      __publicField(this, "inFlight", new InFlightManager());
    }
    cleanup() {
      this.subscriptions.clearAll();
      this.inFlight.abortAll();
    }
  }
  function compare(objA, objB) {
    if (Object.is(objA, objB)) {
      return true;
    }
    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
      return false;
    }
    if (objA instanceof Map && objB instanceof Map) {
      if (objA.size !== objB.size) return false;
      for (const [key, value] of objA) {
        if (!Object.is(value, objB.get(key))) {
          return false;
        }
      }
      return true;
    }
    if (objA instanceof Set && objB instanceof Set) {
      if (objA.size !== objB.size) return false;
      for (const value of objA) {
        if (!objB.has(value)) {
          return false;
        }
      }
      return true;
    }
    if (Array.isArray(objA) && Array.isArray(objB)) {
      if (objA.length !== objB.length) return false;
      for (let i = 0; i < objA.length; i++) {
        if (!Object.is(objA[i], objB[i])) {
          return false;
        }
      }
      return true;
    }
    const keysA = Object.keys(objA);
    if (keysA.length !== Object.keys(objB).length) {
      return false;
    }
    for (const keyA of keysA) {
      if (!Object.prototype.hasOwnProperty.call(objB, keyA)) {
        return false;
      }
      const valueA = objA[keyA];
      const valueB = objB[keyA];
      if (!Object.is(valueA, valueB)) {
        return false;
      }
    }
    return true;
  }
  function hasProperty(obj, property) {
    return typeof obj === "object" && obj !== null && property in obj;
  }
  function getFailureReason(error) {
    if (!error) return void 0;
    if (error instanceof Error || hasProperty(error, "message")) {
      return error.message;
    }
    if (hasProperty(error, "info")) {
      return error.info;
    }
    if (typeof error === "string") {
      return error;
    }
    return void 0;
  }
  async function initCustomWallets() {
    await Promise.all(
      Object.entries(customWallets).map(async ([key, wallet]) => {
        var _a;
        try {
          await ((_a = wallet.initialize) == null ? void 0 : _a.call(wallet));
        } catch (error) {
          console.warn("[WELD] Initialization of", key, "wallet failed:", getFailureReason(error));
        }
      })
    );
  }
  function createStore(createState) {
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial) => {
      const partialNext = typeof partial === "function" ? partial(state) : partial;
      const next = typeof partialNext !== "object" || partialNext === null ? partialNext : Object.assign({}, state, partialNext);
      if (!compare(next, state)) {
        const prev = state;
        state = next;
        for (const listener of listeners) {
          listener(state, prev);
        }
      }
    };
    const getState = () => state;
    const getInitialState = () => initialState;
    const subscribe = (listener, opts) => {
      listeners.add(listener);
      if (opts == null ? void 0 : opts.fireImmediately) {
        listener(state, void 0);
      }
      return () => {
        listeners.delete(listener);
      };
    };
    const subscribeWithSelector = (selector, listener, opts) => {
      let currSlice = selector(state);
      const globalListener = (next) => {
        const nextSlice = selector(next);
        if (!compare(currSlice, nextSlice)) {
          const prevSlice = currSlice;
          currSlice = nextSlice;
          listener(currSlice, prevSlice);
        }
      };
      listeners.add(globalListener);
      if (opts == null ? void 0 : opts.fireImmediately) {
        listener(currSlice, void 0);
      }
      return () => {
        listeners.delete(globalListener);
      };
    };
    const persist = (data) => {
      var _a;
      const state2 = getState();
      (_a = state2 == null ? void 0 : state2.__persist) == null ? void 0 : _a.call(state2, data);
    };
    const init = () => {
      var _a;
      initCustomWallets();
      const state2 = getState();
      (_a = state2 == null ? void 0 : state2.__init) == null ? void 0 : _a.call(state2);
    };
    const cleanup = () => {
      var _a;
      const state2 = getState();
      (_a = state2 == null ? void 0 : state2.__cleanup) == null ? void 0 : _a.call(state2);
      listeners.clear();
    };
    const store = {
      setState,
      getState,
      getInitialState,
      subscribe,
      subscribeWithSelector,
      persist,
      init,
      cleanup
    };
    const initialState = createState(setState, getState);
    state = initialState;
    return store;
  }
  function createStoreFactory(storeHandler) {
    const factory = (...params) => {
      return createStore((s, g) => {
        return storeHandler(s, g, ...params);
      });
    };
    return factory;
  }
  function mergeConfigs(key, base, ...configs) {
    for (let i = configs.length - 1; i >= 0; i--) {
      const config = configs[i];
      const value = typeof config === "boolean" ? void 0 : config == null ? void 0 : config[key];
      if (typeof value !== "undefined") {
        return value;
      }
    }
    return base[key];
  }
  function setupAutoUpdate(fn, lifecycle, store, ...overrides) {
    let unsubInterval = void 0;
    let unsubWindowFocus = void 0;
    const stop = () => {
      if (unsubInterval) {
        unsubInterval();
        unsubInterval = void 0;
      }
      if (unsubWindowFocus) {
        unsubWindowFocus();
        unsubWindowFocus = void 0;
      }
    };
    const update = () => {
      if (!document.hidden) {
        fn(stop);
      }
    };
    lifecycle.subscriptions.add(
      weld.config.subscribeWithSelector(
        (config) => mergeConfigs("updateInterval", config, store && config[store], ...overrides),
        (updateInterval) => {
          if (unsubInterval) {
            unsubInterval();
            unsubInterval = void 0;
          }
          if (updateInterval) {
            const pollInterval = setInterval(update, updateInterval);
            unsubInterval = lifecycle.subscriptions.add(() => {
              clearInterval(pollInterval);
            });
          }
        },
        { fireImmediately: true }
      )
    );
    lifecycle.subscriptions.add(
      weld.config.subscribeWithSelector(
        (config) => mergeConfigs("updateOnWindowFocus", config, store && config[store], ...overrides),
        (updateOnWindowFocus) => {
          if (unsubWindowFocus) {
            unsubWindowFocus();
            unsubWindowFocus = void 0;
          }
          if (updateOnWindowFocus) {
            window.addEventListener("focus", update);
            window.addEventListener("visibilityChange", update);
            unsubWindowFocus = lifecycle.subscriptions.add(() => {
              window.removeEventListener("focus", update);
              window.removeEventListener("visibilityChange", update);
            });
          }
        },
        { fireImmediately: true }
      )
    );
  }
  const initialExtensionsState = {
    ...newInstalledExtensions(),
    isLoading: true,
    isFetching: false
  };
  const createExtensionsStore = createStoreFactory(
    (setState, getState) => {
      const lifecycle = new LifeCycleManager();
      const handleUpdateError = (error) => {
        var _a, _b, _c, _d;
        (_b = (_a = weld.config.getState()).onUpdateError) == null ? void 0 : _b.call(_a, "extensions", error);
        (_d = (_c = weld.config.getState().wallet).onUpdateError) == null ? void 0 : _d.call(_c, error);
      };
      const update = async (signal) => {
        var _a;
        if (weld.config.getState().debug) {
          console.log("[WELD] Extensions state update");
        }
        try {
          if (((_a = getState()) == null ? void 0 : _a.isFetching) || (signal == null ? void 0 : signal.aborted)) {
            return;
          }
          setState({ isFetching: true });
          const res = await getInstalledExtensions();
          if (signal == null ? void 0 : signal.aborted) {
            return;
          }
          setState({
            ...res,
            isLoading: false,
            isFetching: false
          });
        } catch (error) {
          handleUpdateError(error);
          setState({
            isLoading: false,
            isFetching: false
          });
        }
      };
      const __init = () => {
        if (typeof window !== "undefined") {
          lifecycle.subscriptions.clearAll();
          const signal = lifecycle.inFlight.add();
          update().then(() => {
            if (signal.aborted) {
              return;
            }
            setupAutoUpdate(update, lifecycle, "extensions");
          }).finally(() => {
            lifecycle.inFlight.remove(signal);
          });
        }
      };
      const __cleanup = () => {
        lifecycle.cleanup();
      };
      const initialState = {
        ...initialExtensionsState,
        update,
        __init,
        __cleanup
      };
      return initialState;
    }
  );
  function defaultIsAccountChangeError(error) {
    return getFailureReason(error) === "account changed";
  }
  function handleAccountChangeErrors(enabledApi, updateEnabledApi, isApiEnabled, { isAccountChangeError = defaultIsAccountChangeError } = {}) {
    const proxy = new Proxy(enabledApi, {
      get(target, p, receiver) {
        const value = target[p];
        if (typeof value !== "function") {
          return Reflect.get(target, p, receiver);
        }
        return async (...params) => {
          try {
            const res = await value.apply(target, params);
            return res;
          } catch (error) {
            if (isAccountChangeError(error)) {
              const updatedApi = await updateEnabledApi();
              const newValue = updatedApi[p];
              if (typeof newValue !== "function") {
                throw error;
              }
              const newRes = await newValue.apply(target, params);
              return newRes;
            }
            const isEnabled = await isApiEnabled();
            if (!isEnabled) {
              throw new WalletDisconnectAccountError();
            }
            throw error;
          }
        };
      }
    });
    return proxy;
  }
  const STORAGE_KEYS = {
    connectedWallet: "weld_connected-wallet"
  };
  const initialWalletState = {
    isConnected: false,
    isConnecting: false,
    isConnectingTo: void 0,
    handler: void 0,
    balanceLovelace: void 0,
    balanceAda: void 0,
    changeAddressHex: void 0,
    changeAddressBech32: void 0,
    stakeAddressHex: void 0,
    stakeAddressBech32: void 0,
    networkId: void 0,
    supported: void 0,
    key: void 0,
    icon: void 0,
    website: void 0,
    displayName: void 0,
    supportsTxChaining: void 0,
    isUpdatingUtxos: false,
    utxos: void 0
  };
  const createWalletStore = createStoreFactory(
    (setState, getState) => {
      const lifecycle = new LifeCycleManager();
      let inFlightUtxosUpdate = void 0;
      const ensureUtxos = async () => {
        return (inFlightUtxosUpdate == null ? void 0 : inFlightUtxosUpdate.promise) ?? getState().utxos ?? [];
      };
      const handleUpdateError = (error) => {
        var _a, _b, _c, _d;
        (_b = (_a = weld.config.getState()).onUpdateError) == null ? void 0 : _b.call(_a, "wallet", error);
        (_d = (_c = weld.config.getState().wallet).onUpdateError) == null ? void 0 : _d.call(_c, error);
      };
      const disconnect = () => {
        var _a;
        lifecycle.subscriptions.clearAll();
        lifecycle.inFlight.abortAll();
        if (inFlightUtxosUpdate) {
          inFlightUtxosUpdate.signal.aborted = true;
          inFlightUtxosUpdate.resolve([]);
        }
        (_a = getState().handler) == null ? void 0 : _a.disconnect();
        setState(initialWalletState);
        if (weld.config.getState().enablePersistence) {
          weld.config.getState().storage.remove(STORAGE_KEYS.connectedWallet);
        }
      };
      const connectAsync = async (key, configOverrides) => {
        var _a;
        disconnect();
        const signal = lifecycle.inFlight.add();
        try {
          lifecycle.subscriptions.clearAll();
          setState({ isConnectingTo: key, isConnecting: true });
          let abortTimeout = void 0;
          const connectTimeout = (configOverrides == null ? void 0 : configOverrides.connectTimeout) ?? ((_a = weld.config.getState().wallet) == null ? void 0 : _a.connectTimeout);
          if (connectTimeout) {
            abortTimeout = setTimeout(() => {
              signal.aborted = true;
              setState({ isConnectingTo: void 0, isConnecting: false });
            }, connectTimeout);
          }
          const handler = handleAccountChangeErrors(
            await connect(key),
            async () => {
              const isEnabled = await handler.reenable();
              if (!isEnabled) {
                throw new WalletDisconnectAccountError(
                  `Could not reenable ${handler.info.displayName} wallet after account change`
                );
              }
              safeUpdateState();
              return handler;
            },
            () => handler.defaultApi.isEnabled()
          );
          if (signal.aborted) {
            throw new WalletConnectionAbortedError();
          }
          const getNextUtxos = async ({ expectChange = false } = {}) => {
            const state = getState();
            const prevUtxos = state.utxos ? [...state.utxos] : void 0;
            let retryCount = 0;
            let nextUtxos = await handler.getUtxos();
            while (expectChange && typeof prevUtxos !== "undefined" && retryCount++ < 8 && compare(prevUtxos, nextUtxos)) {
              await new Promise((resolve) => setTimeout(resolve, 3e3));
              nextUtxos = await handler.getUtxos();
            }
            return nextUtxos;
          };
          const updateUtxos = ({ expectChange = false } = {}) => {
            const { promise, resolve } = deferredPromise();
            const signal2 = lifecycle.inFlight.add();
            if (inFlightUtxosUpdate) {
              inFlightUtxosUpdate.signal.aborted = true;
            }
            inFlightUtxosUpdate = { promise, signal: signal2, resolve };
            getNextUtxos({ expectChange }).then((res) => {
              const utxos = res ?? [];
              if (!signal2.aborted && !handler.isDisconnected) {
                setState({ isUpdatingUtxos: false, utxos });
              }
              if ((inFlightUtxosUpdate == null ? void 0 : inFlightUtxosUpdate.promise) && inFlightUtxosUpdate.promise !== promise) {
                inFlightUtxosUpdate.promise.then(resolve);
              } else {
                resolve(utxos);
              }
            }).catch((error) => {
              handleUpdateError(new WalletUtxosUpdateError(getFailureReason(error)));
              if (!signal2.aborted && !handler.isDisconnected) {
                setState({ isUpdatingUtxos: false, utxos: [] });
              }
              if ((inFlightUtxosUpdate == null ? void 0 : inFlightUtxosUpdate.promise) && inFlightUtxosUpdate.promise !== promise) {
                promise.then(resolve);
              } else {
                resolve([]);
              }
            }).finally(() => {
              if ((inFlightUtxosUpdate == null ? void 0 : inFlightUtxosUpdate.promise) && inFlightUtxosUpdate.promise === promise) {
                inFlightUtxosUpdate = void 0;
              }
            });
          };
          const updateState = async () => {
            const balanceLovelace = await handler.getBalanceLovelace();
            const prevState = getState();
            const hasBalanceChanged = balanceLovelace !== prevState.balanceLovelace;
            const newState2 = {
              isConnected: true,
              isConnecting: false,
              isConnectingTo: void 0,
              handler,
              balanceLovelace,
              balanceAda: lovelaceToAda(balanceLovelace),
              networkId: await handler.getNetworkId(),
              changeAddressHex: await handler.getChangeAddressHex(),
              changeAddressBech32: await handler.getChangeAddressBech32(),
              stakeAddressHex: await handler.getStakeAddressHex(),
              stakeAddressBech32: await handler.getStakeAddressBech32(),
              ...handler.info
            };
            if (signal.aborted) {
              return;
            }
            if (hasBalanceChanged) {
              updateUtxos({ expectChange: hasBalanceChanged });
              newState2.isUpdatingUtxos = true;
            }
            if (!handler.isDisconnected) {
              setState(newState2);
            }
          };
          const safeUpdateState = async (stopUpdates) => {
            if (signal.aborted) {
              stopUpdates == null ? void 0 : stopUpdates();
              return;
            }
            if (weld.config.getState().debug) {
              console.log("[WELD] Wallet state update", key);
            }
            try {
              return await updateState();
            } catch (error) {
              handleUpdateError(error);
              disconnect();
            }
          };
          await updateState();
          const newState = getState();
          if (!newState.isConnected) {
            throw new Error("Connection failed");
          }
          if (signal.aborted) {
            throw new WalletConnectionAbortedError();
          }
          setupAutoUpdate(safeUpdateState, lifecycle, "wallet", configOverrides);
          if (weld.config.getState().enablePersistence) {
            weld.config.getState().storage.set(STORAGE_KEYS.connectedWallet, newState.key);
          }
          if (abortTimeout) {
            clearTimeout(abortTimeout);
          }
          return newState;
        } catch (error) {
          if (error instanceof WalletDisconnectAccountError) {
            disconnect();
          }
          throw error;
        } finally {
          lifecycle.inFlight.remove(signal);
        }
      };
      const connect$1 = async (key, { onSuccess, onError, ...config } = {}) => {
        connectAsync(key, config).then((wallet) => {
          onSuccess == null ? void 0 : onSuccess(wallet);
        }).catch((error) => {
          onError == null ? void 0 : onError(error);
        });
      };
      const __init = () => {
        if (initialState.isConnectingTo) {
          connect$1(initialState.isConnectingTo);
        }
      };
      const __persist = (data) => {
        let isConnectingTo = data == null ? void 0 : data.tryToReconnectTo;
        if (!isConnectingTo && typeof window !== "undefined" && weld.config.getState().enablePersistence) {
          isConnectingTo = weld.config.getState().getPersistedValue("connectedWallet");
        }
        initialState.isConnectingTo = isConnectingTo;
        initialState.isConnecting = !!isConnectingTo;
      };
      const __cleanup = () => {
        lifecycle.cleanup();
      };
      const initialState = {
        ...initialWalletState,
        connect: connect$1,
        connectAsync,
        disconnect,
        ensureUtxos,
        __init,
        __cleanup,
        __persist
      };
      return initialState;
    }
  );
  const initialConfigState = {
    debug: false,
    updateInterval: 3e4,
    updateOnWindowFocus: true,
    ignoreUnsafeUsageError: false,
    enablePersistence: true,
    storage: defaultStorage,
    wallet: {},
    extensions: {}
  };
  const createConfigStore = createStoreFactory((setState, getState) => {
    const update = (values) => {
      setState({
        ...getState(),
        ...values,
        wallet: {
          ...getState().wallet,
          ...values.wallet
        },
        extensions: {
          ...getState().extensions,
          ...values.extensions
        }
      });
    };
    const getPersistedValue = (key) => {
      return getState().storage.get(STORAGE_KEYS[key]) ?? void 0;
    };
    return {
      ...initialConfigState,
      update,
      getPersistedValue
    };
  });
  let configStore;
  let walletStore;
  let extensionsStore;
  const weld = {
    get config() {
      if (!configStore) {
        configStore = createConfigStore();
      }
      return configStore;
    },
    get wallet() {
      if (!walletStore) {
        walletStore = createWalletStore();
      }
      return walletStore;
    },
    get extensions() {
      if (!extensionsStore) {
        extensionsStore = createExtensionsStore();
      }
      return extensionsStore;
    },
    persist(config) {
      var _a;
      this.config.persist();
      this.wallet.persist({ tryToReconnectTo: (_a = config == null ? void 0 : config.wallet) == null ? void 0 : _a.tryToReconnectTo });
      this.extensions.persist();
    },
    init({ persist = true } = {}) {
      initCustomWallets();
      if (typeof persist === "object") {
        this.persist(persist);
      } else if (persist) {
        this.persist();
      }
      this.config.init();
      this.wallet.init();
      this.extensions.init();
    },
    cleanup() {
      this.config.cleanup();
      this.wallet.cleanup();
      this.extensions.cleanup();
    }
  };
  class WalletConnectionError extends Error {
    constructor(message) {
      super(message);
      this.name = "Anvil Weld - WalletConnectionError";
    }
  }
  class WalletUtxosUpdateError extends Error {
    constructor(message) {
      super(message);
      this.name = "Anvil Weld - WalletUtxosUpdateError";
    }
  }
  class WalletConnectionAbortedError extends Error {
    constructor(message) {
      super(message);
      this.name = "Anvil Weld - WalletConnectionAbortedError";
    }
  }
  class WalletBalanceDecodeError extends Error {
    constructor(message) {
      super(message);
      this.name = "Anvil Weld - WalletBalanceDecodeError";
    }
  }
  class WalletDisconnectAccountError extends Error {
    constructor(message) {
      super(message);
      this.name = "Anvil Weld - WalletDisconnectAccountError";
    }
  }
  function startsWithAny(str, prefixes) {
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }
  const stakeAddressHexLength = 58;
  const stakeAddressHexPrefixes = ["e0", "e1"];
  function isStakeAddressHex(input) {
    return input.length === stakeAddressHexLength && startsWithAny(input, stakeAddressHexPrefixes);
  }
  function isDefaultWalletApi(obj) {
    return typeof obj === "object" && obj !== null && "apiVersion" in obj;
  }
  async function getWindowCardano({
    key,
    maxRetryCount = 5,
    retryIntervalMs = 1e3
  } = {}) {
    const { promise, resolve } = deferredPromise();
    let retryCount = 0;
    function evaluate() {
      let result = void 0;
      if (key && key in window.cardano) {
        const api = window.cardano[key];
        if (isDefaultWalletApi(api)) {
          result = api;
        }
      } else if (window.cardano) {
        result = window.cardano;
      }
      if (result) {
        resolve(result);
      } else if (++retryCount > maxRetryCount) {
        resolve(void 0);
      } else {
        setTimeout(evaluate, retryIntervalMs);
      }
    }
    evaluate();
    return promise;
  }
  const walletExtensionBlacklist = ["ccvault"];
  async function getWalletExtensions() {
    const windowCardano = await getWindowCardano();
    if (!windowCardano) return [];
    for (const walletKey of walletExtensionBlacklist) {
      if (walletKey in windowCardano) {
        delete windowCardano[walletKey];
      }
    }
    return Object.entries(windowCardano).flatMap(([key, defaultApi]) => {
      if (isDefaultWalletApi(defaultApi)) {
        return {
          key,
          defaultApi
        };
      }
      return [];
    }).sort((a, b) => {
      const keyA = a.key.toLowerCase();
      const keyB = b.key.toLowerCase();
      if (keyA < keyB) return -1;
      if (keyB < keyA) return 1;
      return 0;
    });
  }
  async function enableWallet(defaultApi, { maxRetryCount = 5, retryIntervalMs = 1e3 } = {}) {
    const { promise, resolve } = deferredPromise();
    let retryCount = 0;
    async function evaluate() {
      try {
        const resp = await defaultApi.enable();
        resolve(resp);
      } catch {
        let isEnabled = false;
        try {
          isEnabled = await defaultApi.isEnabled();
        } catch {
          isEnabled = false;
        } finally {
          if (!isEnabled || ++retryCount > maxRetryCount) {
            resolve(void 0);
          } else {
            setTimeout(() => {
              evaluate();
            }, retryIntervalMs);
          }
        }
      }
    }
    evaluate();
    return promise;
  }
  var dist = {};
  Object.defineProperty(dist, "__esModule", { value: true });
  dist.bech32m = bech32 = dist.bech32 = void 0;
  const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const ALPHABET_MAP = {};
  for (let z = 0; z < ALPHABET.length; z++) {
    const x = ALPHABET.charAt(z);
    ALPHABET_MAP[x] = z;
  }
  function polymodStep(pre) {
    const b = pre >> 25;
    return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
  }
  function prefixChk(prefix) {
    let chk = 1;
    for (let i = 0; i < prefix.length; ++i) {
      const c = prefix.charCodeAt(i);
      if (c < 33 || c > 126)
        return "Invalid prefix (" + prefix + ")";
      chk = polymodStep(chk) ^ c >> 5;
    }
    chk = polymodStep(chk);
    for (let i = 0; i < prefix.length; ++i) {
      const v = prefix.charCodeAt(i);
      chk = polymodStep(chk) ^ v & 31;
    }
    return chk;
  }
  function convert(data, inBits, outBits, pad) {
    let value = 0;
    let bits = 0;
    const maxV = (1 << outBits) - 1;
    const result = [];
    for (let i = 0; i < data.length; ++i) {
      value = value << inBits | data[i];
      bits += inBits;
      while (bits >= outBits) {
        bits -= outBits;
        result.push(value >> bits & maxV);
      }
    }
    if (pad) {
      if (bits > 0) {
        result.push(value << outBits - bits & maxV);
      }
    } else {
      if (bits >= inBits)
        return "Excess padding";
      if (value << outBits - bits & maxV)
        return "Non-zero padding";
    }
    return result;
  }
  function toWords(bytes) {
    return convert(bytes, 8, 5, true);
  }
  function fromWordsUnsafe(words) {
    const res = convert(words, 5, 8, false);
    if (Array.isArray(res))
      return res;
  }
  function fromWords(words) {
    const res = convert(words, 5, 8, false);
    if (Array.isArray(res))
      return res;
    throw new Error(res);
  }
  function getLibraryFromEncoding(encoding) {
    let ENCODING_CONST;
    if (encoding === "bech32") {
      ENCODING_CONST = 1;
    } else {
      ENCODING_CONST = 734539939;
    }
    function encode(prefix, words, LIMIT) {
      LIMIT = LIMIT || 90;
      if (prefix.length + 7 + words.length > LIMIT)
        throw new TypeError("Exceeds length limit");
      prefix = prefix.toLowerCase();
      let chk = prefixChk(prefix);
      if (typeof chk === "string")
        throw new Error(chk);
      let result = prefix + "1";
      for (let i = 0; i < words.length; ++i) {
        const x = words[i];
        if (x >> 5 !== 0)
          throw new Error("Non 5-bit word");
        chk = polymodStep(chk) ^ x;
        result += ALPHABET.charAt(x);
      }
      for (let i = 0; i < 6; ++i) {
        chk = polymodStep(chk);
      }
      chk ^= ENCODING_CONST;
      for (let i = 0; i < 6; ++i) {
        const v = chk >> (5 - i) * 5 & 31;
        result += ALPHABET.charAt(v);
      }
      return result;
    }
    function __decode(str, LIMIT) {
      LIMIT = LIMIT || 90;
      if (str.length < 8)
        return str + " too short";
      if (str.length > LIMIT)
        return "Exceeds length limit";
      const lowered = str.toLowerCase();
      const uppered = str.toUpperCase();
      if (str !== lowered && str !== uppered)
        return "Mixed-case string " + str;
      str = lowered;
      const split = str.lastIndexOf("1");
      if (split === -1)
        return "No separator character for " + str;
      if (split === 0)
        return "Missing prefix for " + str;
      const prefix = str.slice(0, split);
      const wordChars = str.slice(split + 1);
      if (wordChars.length < 6)
        return "Data too short";
      let chk = prefixChk(prefix);
      if (typeof chk === "string")
        return chk;
      const words = [];
      for (let i = 0; i < wordChars.length; ++i) {
        const c = wordChars.charAt(i);
        const v = ALPHABET_MAP[c];
        if (v === void 0)
          return "Unknown character " + c;
        chk = polymodStep(chk) ^ v;
        if (i + 6 >= wordChars.length)
          continue;
        words.push(v);
      }
      if (chk !== ENCODING_CONST)
        return "Invalid checksum for " + str;
      return { prefix, words };
    }
    function decodeUnsafe(str, LIMIT) {
      const res = __decode(str, LIMIT);
      if (typeof res === "object")
        return res;
    }
    function decode(str, LIMIT) {
      const res = __decode(str, LIMIT);
      if (typeof res === "object")
        return res;
      throw new Error(res);
    }
    return {
      decodeUnsafe,
      decode,
      encode,
      toWords,
      fromWordsUnsafe,
      fromWords
    };
  }
  var bech32 = dist.bech32 = getLibraryFromEncoding("bech32");
  dist.bech32m = getLibraryFromEncoding("bech32m");
  function hexToUint8Array(hex) {
    if (hex.length % 2 !== 0) throw new Error("Hex string must have an even length");
    const byteArray = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      byteArray[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16);
    }
    return byteArray;
  }
  function isBech32Address(input) {
    return input.startsWith("addr") || input.startsWith("stake");
  }
  function getBech32Prefix(input) {
    if (isStakeAddressHex(input)) {
      return input.startsWith("e0") ? "stake_test" : "stake";
    }
    return input.startsWith("00") ? "addr_test" : "addr";
  }
  function hexToBech32(input) {
    if (isBech32Address(input)) {
      return input;
    }
    const prefix = getBech32Prefix(input);
    const byteArray = hexToUint8Array(input);
    const words = bech32.toWords(byteArray);
    return bech32.encode(prefix, words, 1e3);
  }
  const lovelaceToAda = (lovelace) => lovelace / 1e6;
  const SUPPORTED_WALLETS = [
    {
      supported: true,
      key: "eternl",
      displayName: "Eternl",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/eternl.svg",
      website: "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka?hl=en-US",
      supportsTxChaining: true
    },
    {
      supported: true,
      key: "nami",
      displayName: "Nami",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/nami.svg",
      website: "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "tokeo",
      displayName: "Tokeo",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/tokeo.svg",
      website: "https://tokeopay.io",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "flint",
      displayName: "Flint",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/flint.svg",
      website: "https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "gerowallet",
      displayName: "Gero",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/gerowallet.svg",
      website: "https://chrome.google.com/webstore/detail/gerowallet/bgpipimickeadkjlklgciifhnalhdjhe/overview",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "typhoncip30",
      displayName: "Typhon",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/typhoncip30.svg",
      website: "https://chrome.google.com/webstore/detail/typhon-wallet/kfdniefadaanbjodldohaedphafoffoh",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "nufi",
      displayName: "NuFi",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/nufi.svg",
      website: "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "nufiSnap",
      displayName: "MetaMask",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/nufi-snap.svg",
      website: "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "lace",
      displayName: "Lace",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/lace.svg",
      website: "https://chrome.google.com/webstore/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "vespr",
      displayName: "VESPR",
      icon: "https://raw.githubusercontent.com/cardano-forge/weld/main/images/wallets/vespr.svg",
      website: "https://www.vespr.xyz/",
      supportsTxChaining: false
    }
  ];
  const supportedWalletsMap = new Map(
    SUPPORTED_WALLETS.map((config) => [config.key, config])
  );
  function getWalletInfo(extension) {
    const info = supportedWalletsMap.get(extension.key);
    if (info) {
      return info;
    }
    return {
      supported: false,
      key: extension.key,
      icon: extension.defaultApi.icon,
      displayName: extension.defaultApi.name,
      website: void 0,
      supportsTxChaining: false
    };
  }
  window.Weld = weld;
})();
