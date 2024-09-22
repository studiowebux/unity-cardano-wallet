using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using UnityEngine.Networking;
using TMPro;
using System;
using UnityEngine.UI;
using Unity.VisualScripting;


[System.Serializable]
public class TransactionInfo
{
    public string tx;
    public string[] nonces;
    public string hash;

    public static TransactionInfo CreateFromJSON(string jsonString)
    {
        return JsonUtility.FromJson<TransactionInfo>(jsonString);
    }
}

public class Wallet : MonoBehaviour
{
    public TMP_Text address;
    public TMP_Text walletName;
    public TMP_Text balance;
    public TMP_Text message;

    private string addressText;

    public GameObject availableWallets;
    public Button btnObj;


    [DllImport("__Internal")]
    private static extern void Connect(string walletId);
    [DllImport("__Internal")]
    private static extern void Init();
    [DllImport("__Internal")]
    private static extern string GetSupportedWallet();
    [DllImport("__Internal")]
    private static extern void SignTx(string tx, string nonces, string hash);

    void Start()
    {
        // TODO: Need to implement the wallet selection and save the state to autoreconnect (if it is required)
        Init();

        // Setup UI
        // Connect();
    }

    public void ReloadWallets()
    {
        var wallets = GetSupportedWallet();
        Debug.Log("Wallets from reload");
        Debug.Log(wallets);
        SetWalletAvailable(wallets);
    }

    public void MintCharacter()
    {
        StartCoroutine(PrepareTx());
    }


    IEnumerator PrepareTx()
    {
        Dictionary<string, string> form = new();
        form["address"] = this.addressText;
        form["quantity"] = "2";

        using (UnityWebRequest www = UnityWebRequest.Post("http://localhost:8000/mint/character/generalist", form))
        {
            yield return www.SendWebRequest();

            if (www.result != UnityWebRequest.Result.Success)
            {
                Debug.Log(www.error);
            }
            else
            {
                // Show results as text
                var json = www.downloadHandler.text;
                Debug.Log(json);

                TransactionInfo tx = TransactionInfo.CreateFromJSON(json);
                this.SignAndSubmitTx(tx.tx, String.Join(",", tx.nonces), tx.hash);
            }
        }
    }

    public void SignAndSubmitTx(string tx, string nonces, string hash)
    {
        SignTx(tx, nonces, hash);
    }

    public void UpdateBalance(float balance)
    {
        this.balance.text = balance.ToString();
    }

    public void UpdateWalletName(string walletName)
    {
        this.walletName.text = walletName;
    }

    public void UpdateAddress(string address)
    {
        this.address.text = address;
        this.addressText = address;
    }

    public void MessageHandler(string message)
    {
        this.message.text = message;
    }

    public void SetWalletAvailable(string walletAvailable)
    {
        Debug.Log("walletAvailable");
        Debug.Log(walletAvailable);

        string[] w = walletAvailable.Split(",");

        Debug.Log(w[0]);
        Debug.Log(w[w.Length - 1]);
        for (int i = 0; i < w.Length; i++)
        {
            CreateButton(w[i]);
        }

    }

    void CreateButton(string buttonText)
    {
        Debug.Log("Create btn");
        // Create a new Button using the UI's Instantiate method
        GameObject btn = Instantiate(this.btnObj.gameObject, availableWallets.transform);
        Button action = btn.GetComponent<Button>();
        TMP_Text btnText = action.GetComponentInChildren<TMP_Text>();

        if (btn != null && btnText != null && action != null)
        {
            Debug.Log("BTN IS NOT NULL");
            // Check if Text component already exists on the child object
            // Set the text of the newly created button
            btnText.text = buttonText;

            // // Add the new button to the canvas
            // btnObj.transform.SetParent(availableWallets.transform, false);

            action.onClick.AddListener(() => { Debug.Log("Button Clicked !"); Connect(buttonText); });

        }
        else
        {
            Debug.LogWarning("No Text component found on the child object. Cannot set button text.");
        }

    }

}
