function initWeld() {
  Weld.init();

  Weld.config.getState().update({
    debug: true,
    onUpdateError(context, error) {
      console.error("error", context, error);
    },
    wallet: {
      // updateInterval: 2000,
    },
    extensions: {
      // updateInterval: false,
    },
  });

  Weld.extensions.subscribeWithSelector(
    (s) => s.allArr,
    (extensions) => {
      myGameInstance?.SendMessage(
        "Wallet",
        "SetWalletAvailable",
        extensions.map((a) => a.info.key)?.join(",") || "",
      );
    },
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.balanceAda ?? "-",
    (update) => {
      try {
        if (!isNaN(update))
          myGameInstance?.SendMessage("Wallet", "UpdateBalance", update || 0);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: false },
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.changeAddressHex ?? "-",
    (update) => {
      try {
        myGameInstance?.SendMessage("Wallet", "UpdateAddress", update);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: false },
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.displayName ?? "-",
    (update) => {
      try {
        myGameInstance?.SendMessage("Wallet", "UpdateWalletName", update);
      } catch (e) {
        console.error(e);
      }
    },
  );
}

window.addEventListener("webglReady", () => {
  initWeld();
});

window.addEventListener("unload", () => {
  Weld.cleanup();
});
