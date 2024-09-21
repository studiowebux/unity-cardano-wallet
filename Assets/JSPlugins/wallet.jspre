async function signAndSubmit(tx, nonces, hash, type) {
  const signature = await Weld.wallet.getState().handler?.signTx(tx, true);

  const submitted = await fetch("http://localhost:8000/mint/submit", {
    method: "POST",
    body: JSON.stringify({
      signature,
      nonces: nonces,
      hash: hash,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await submitted.text();

  if (submitted.status !== 200) {
    myGameInstance.SendMessage(
      "Wallet",
      "MessageHandler",
      "TX Submission failed."
    );
    return;
  }

  console.log("TX Submitted with success", submitted, text);
  myGameInstance.SendMessage("Wallet", "MessageHandler", text);
}
