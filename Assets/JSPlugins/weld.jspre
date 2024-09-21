function init() {
  console.log("WELD INIT");
  // TODO: Generate the list of client available wallets
  // Useful to build a Unity UI to connect a specific wallet.
  Weld.extensions.subscribeWithSelector(
    (s) => s.allArr,
    (extensions) => {
      myGameInstance.SendMessage(
        "Wallet",
        "SetWalletAvailable",
        JSON.stringify(extensions)
      );
    }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.balanceAda ?? "-",
    (update) => {
      console.log("update", update);
      try {
        myGameInstance.SendMessage("Wallet", "UpdateBalance", update || 0);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: true }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.changeAddressHex ?? "-",
    (update) => {
      console.log("update", update);
      try {
        myGameInstance.SendMessage("Wallet", "UpdateAddress", update);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: true }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.displayName ?? "-",
    (update) => {
      console.log("Update", update);
      try {
        myGameInstance.SendMessage("Wallet", "UpdateWalletName", update);
      } catch (e) {
        console.error(e);
      }
    }
  );

  Weld.wallet.getState().connect("nami");

  // Should be automatic, will fix in next version
  Weld.wallet.getState().__persist?.();

  Weld.setupStores(Weld.wallet, Weld.extensions);
}
