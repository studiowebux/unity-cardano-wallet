mergeInto(LibraryManager.library, {

  Init: function () {
    // initWeld();
  },

  Connect: function (walletId) {
    console.log("Trying to connect to ", UTF8ToString(walletId));
    Weld.wallet.getState().connect(UTF8ToString(walletId));
  },

  GetSupportedWallet: function () {
    console.log(Weld.extensions.getState().supportedArr)
    console.log(Weld.extensions.getState().supportedArr.map(a => a.info.key)?.join(",") || "")
    
    var returnStr = Weld.extensions.getState().supportedArr.map(a => a.info.key)?.join(",") || "";
    var bufferSize = lengthBytesUTF8(returnStr) + 1;
    var buffer = _malloc(bufferSize);
    stringToUTF8(returnStr, buffer, bufferSize);

    return buffer;
  },

  SignTx: async function (tx, nonces, hash) {
    console.log("SignTx");

    await signAndSubmit(
      UTF8ToString(tx),
      UTF8ToString(nonces).split(","),
      UTF8ToString(hash)
    );
  },
  
});
