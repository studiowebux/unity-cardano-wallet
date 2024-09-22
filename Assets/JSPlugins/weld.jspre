function initWeld() {
  console.log("WELD INIT");

  Weld.extensions.subscribeWithSelector(
    (s) => s.allArr,
    (extensions) => {
      console.log("extensions", extensions)
      if (!myGameInstance) {
        console.debug("Will retry in a sec.");
        // This is bad, i know ..
        setTimeout(()=> myGameInstance?.SendMessage(
          "Wallet",
          "SetWalletAvailable",
          extensions.map(a => a.info.key)?.join(",") || ""
        ),1000)
      } else {
        // TODO: We need to retry sending this message, there is a race condition, 
        //       and didn't find in unity documentation how to solve it.
        myGameInstance?.SendMessage(
          "Wallet",
          "SetWalletAvailable",
          extensions.map(a => a.info.key)?.join(",") || ""
        );
        // The dirty trick right now is the button that load the wallet into the view...
      }
    }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.balanceAda ?? "-",
    (update) => {
      console.log("update", update);
      try {
        if(!isNaN(update))
          myGameInstance?.SendMessage("Wallet", "UpdateBalance", update || 0);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: false }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.changeAddressHex ?? "-",
    (update) => {
      console.log("update", update);
      try {
        myGameInstance?.SendMessage("Wallet", "UpdateAddress", update);
      } catch (e) {
        console.error(e);
      }
    },
    { fireImmediately: false }
  );

  Weld.wallet.subscribeWithSelector(
    (s) => s.displayName ?? "-",
    (update) => {
      console.log("Update", update);
      try {
        myGameInstance?.SendMessage("Wallet", "UpdateWalletName", update);
      } catch (e) {
        console.error(e);
      }
    }
  );

  // Should be automatic, will fix in next version
  Weld.wallet.getState().__persist?.();

  Weld.setupStores(Weld.wallet, Weld.extensions);
}

initWeld();