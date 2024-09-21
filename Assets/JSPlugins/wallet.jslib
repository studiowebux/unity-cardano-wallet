mergeInto(LibraryManager.library, {
  Connect: function () {
    init();
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
