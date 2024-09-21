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
      {
        handler = new DefaultWalletHandler(info, defaultApi, enabledApi, enable);
      }
      return handler;
    };
  }
  function createCustomWallet({ connector, initialize: initialize2 }) {
    return {
      connector: connector ?? getDefaultWalletConnector(),
      initialize: initialize2
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
  function initCardanoDAppConnectorBridge(onBridgeCreated) {
    var _label = "DAppConnectorBridge: ";
    var _walletNamespace = null;
    var _initialApiObject = null;
    var _fullApiObject = null;
    var _bridge = { type: "cardano-dapp-connector-bridge", source: null, origin: null };
    var _requestMap = {};
    var _methodMap = {
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
      var args = [...arguments];
      if (args.length > 0) args.shift();
      return new Promise((resolve, reject) => {
        var request = {
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
        _bridge.source.postMessage(request.payload, _bridge.origin);
      });
    }
    function generateApiFunction(method) {
      return function() {
        return createRequest(method, ...arguments);
      };
    }
    function generateApiObject(obj) {
      var apiObj = {};
      for (var key in obj) {
        var value = obj[key];
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
      if (!window.hasOwnProperty("cardano")) {
        window.cardano = {};
      }
      if (window.cardano.hasOwnProperty(walletNamespace)) {
        console.warn("Warn: " + _label + "window.cardano." + walletNamespace + " already present, skipping initialApi creation.");
        return null;
      }
      _bridge.source = source;
      _bridge.origin = origin;
      _walletNamespace = walletNamespace;
      var initialApiObj = {
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
        var initialApi = payload.data.initialApi;
        if (!initialApi || !initialApi.isBridge || !initialApi.apiVersion || !initialApi.name) {
          console.error("Error: " + _label + "'connect' is missing correct initialApi.", initialApi);
          return false;
        }
        if (!payload.data.walletNamespace) {
          console.error("Error: " + _label + "'connect' is missing walletNamespace.", payload.data.walletNamespace);
          return false;
        }
        _initialApiObject = initBridge(payload.source, payload.origin, payload.data.walletNamespace, initialApi);
      }
      if (!(_initialApiObject && window.hasOwnProperty("cardano") && window.cardano[payload.data.walletNamespace] === _initialApiObject)) {
        console.warn("Warn: " + _label + "bridge not set up correctly:", _bridge, _initialApiObject, _walletNamespace);
        return false;
      }
      return true;
    }
    function isValidMessage(payload) {
      if (!payload.data || !payload.origin || !payload.source) return false;
      if (payload.data.type !== _bridge.type) return false;
      if (!_methodMap.hasOwnProperty(payload.data.method)) return false;
      if (_walletNamespace && payload.data.walletNamespace !== _walletNamespace) return false;
      return true;
    }
    async function onMessage(payload) {
      if (!isValidMessage(payload) || !isValidBridge(payload)) return;
      if (payload.data.method === _methodMap.connect) {
        var success = await createRequest("handshake");
        if (success && _initialApiObject) {
          if (onBridgeCreated) onBridgeCreated(_initialApiObject);
        }
        return;
      }
      if (!payload.data.uid) return;
      var request = _requestMap[payload.data.uid];
      if (!request) return;
      var response = payload.data.response;
      var error = payload.data.error;
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
    const timeout = setTimeout(() => reject("Request took too long"), 5e3);
    initCardanoDAppConnectorBridge((api) => {
      clearTimeout(timeout);
      resolve(api);
    });
    return promise;
  }
  let state = { status: "idle" };
  async function initializeBridge() {
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
  }
  const eternl = createCustomWallet({
    async initialize() {
      if (state.status === "initialized") {
        return;
      }
      if (state.status === "loading") {
        return state.promise;
      }
      const { promise, resolve } = deferredPromise();
      state = { status: "loading", promise };
      const res = await initializeBridge();
      state = { status: res ? "initialized" : "idle" };
      resolve();
      return promise;
    }
  });
  const customWallets = {
    eternl
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
  async function initialize() {
    for (const customWallet of Object.values(customWallets)) {
      if (customWallet.initialize) {
        await customWallet.initialize();
      }
    }
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
  function createStore(createState) {
    let state2;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial) => {
      const partialNext = typeof partial === "function" ? partial(state2) : partial;
      const next = typeof partialNext !== "object" || partialNext === null ? partialNext : Object.assign({}, state2, partialNext);
      if (!compare(next, state2)) {
        const prev = state2;
        state2 = next;
        for (const listener of listeners) {
          listener(state2, prev);
        }
      }
    };
    const getState = () => state2;
    const getInitialState = () => initialState;
    const subscribe = (listener, opts) => {
      listeners.add(listener);
      if (opts == null ? void 0 : opts.fireImmediately) {
        listener(state2, void 0);
      }
      return () => {
        listeners.delete(listener);
      };
    };
    const subscribeWithSelector = (selector, listener, opts) => {
      let currSlice = selector(state2);
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
    const store = { setState, getState, getInitialState, subscribe, subscribeWithSelector };
    const initialState = createState(setState, getState);
    state2 = initialState;
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
  function hasLifeCycleMethods(store) {
    if (!store || typeof store !== "object" || store === null) return false;
    if ("init" in store && typeof store.init === "function") return true;
    if ("cleanup" in store && typeof store.cleanup === "function") return true;
    return false;
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
  function setupAutoUpdate(update, lifecycle, store, ...overrides) {
    let unsubInterval = void 0;
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
    let unsubWindowFocus = void 0;
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
            unsubWindowFocus = lifecycle.subscriptions.add(() => {
              window.removeEventListener("focus", update);
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
      const init = () => {
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
      const cleanup = () => {
        lifecycle.cleanup();
      };
      return {
        ...initialExtensionsState,
        update,
        init,
        cleanup
      };
    }
  );
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
  const createWalletStore = createStoreFactory((setState, getState) => {
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
      if (inFlightUtxosUpdate) {
        inFlightUtxosUpdate.signal.aborted = true;
        inFlightUtxosUpdate.resolve([]);
      }
      lifecycle.subscriptions.clearAll();
      setState(initialWalletState);
      if (weld.config.getState().enablePersistence) {
        weld.config.getState().storage.remove(STORAGE_KEYS.connectedWallet);
      }
    };
    const connectAsync = async (key, configOverrides) => {
      var _a;
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
        const updateUtxos = () => {
          const { promise, resolve } = deferredPromise();
          const signal2 = lifecycle.inFlight.add();
          if (inFlightUtxosUpdate) {
            inFlightUtxosUpdate.signal.aborted = true;
          }
          inFlightUtxosUpdate = { promise, signal: signal2, resolve };
          handler.getUtxos().then((res) => {
            const utxos = res ?? [];
            if (!signal2.aborted) {
              setState({ isUpdatingUtxos: false, utxos });
            }
            if ((inFlightUtxosUpdate == null ? void 0 : inFlightUtxosUpdate.promise) && inFlightUtxosUpdate.promise !== promise) {
              inFlightUtxosUpdate.promise.then(resolve);
            } else {
              resolve(utxos);
            }
          }).catch((error) => {
            handleUpdateError(new WalletUtxosUpdateError(getFailureReason(error)));
            if (!signal2.aborted) {
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
          if (hasBalanceChanged) {
            updateUtxos();
            newState2.isUpdatingUtxos = true;
          }
          setState(newState2);
        };
        const safeUpdateState = async () => {
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
    const init = () => {
      if (initialState.isConnectingTo) {
        connect$1(initialState.isConnectingTo);
      }
    };
    const __persist = (serverIsConnectingTo) => {
      let isConnectingTo = serverIsConnectingTo;
      if (!isConnectingTo && typeof window !== "undefined" && weld.config.getState().enablePersistence) {
        isConnectingTo = weld.config.getState().getPersistedValue("connectedWallet");
      }
      initialState.isConnectingTo = isConnectingTo;
      initialState.isConnecting = !!isConnectingTo;
    };
    const cleanup = () => {
      lifecycle.cleanup();
    };
    const initialState = {
      ...initialWalletState,
      connect: connect$1,
      connectAsync,
      disconnect,
      ensureUtxos,
      init,
      cleanup,
      __persist
    };
    return initialState;
  });
  const initialConfigState = {
    updateInterval: 2e3,
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
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/eternl.svg",
      website: "https://chrome.google.com/webstore/detail/eternl/kmhcihpebfmpgmihbkipmjlmmioameka?hl=en-US",
      supportsTxChaining: true
    },
    {
      supported: true,
      key: "nami",
      displayName: "Nami",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/nami.svg",
      website: "https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "tokeo",
      displayName: "Tokeo",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/tokeo.svg",
      website: "https://tokeopay.io",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "flint",
      displayName: "Flint",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/flint.svg",
      website: "https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "gerowallet",
      displayName: "Gero",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/gerowallet.svg",
      website: "https://chrome.google.com/webstore/detail/gerowallet/bgpipimickeadkjlklgciifhnalhdjhe/overview",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "typhoncip30",
      displayName: "Typhon",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/typhoncip30.svg",
      website: "https://chrome.google.com/webstore/detail/typhon-wallet/kfdniefadaanbjodldohaedphafoffoh",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "nufi",
      displayName: "NuFi",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/nufi.svg",
      website: "https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "lace",
      displayName: "Lace",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/lace.svg",
      website: "https://chrome.google.com/webstore/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk?hl=en-US",
      supportsTxChaining: false
    },
    {
      supported: true,
      key: "vespr",
      displayName: "VESPR",
      icon: "https://raw.githubusercontent.com/cardano-forge/universal-wallet-connector/main/images/wallets/vespr.svg",
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
  function setupStores(...stores) {
    for (const store of stores) {
      window.addEventListener("load", () => {
        var _a;
        initialize();
        const state2 = store.getState();
        if (hasLifeCycleMethods(state2)) {
          (_a = state2.init) == null ? void 0 : _a.call(state2);
        }
      });
      window.addEventListener("unload", () => {
        var _a;
        const state2 = store.getState();
        if (hasLifeCycleMethods(state2)) {
          (_a = state2.cleanup) == null ? void 0 : _a.call(state2);
        }
      });
    }
  }
  window.Weld = weld;
  Object.assign(window.Weld, { setupStores });
})();