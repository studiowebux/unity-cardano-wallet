using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;
using TMPro;
using System;

public class Wallet : MonoBehaviour
{
    public TMP_Text address; 
    public TMP_Text walletName; 
    public TMP_Text balance; 
    public TMP_Text message; 

    [DllImport("__Internal")]
    private static extern void Connect();
    [DllImport("__Internal")]
    private static extern void SignTx(string tx, string nonces, string hash);

    void Start() {
        // TODO: Need to implement the wallet selection and save the state to autoreconnect (if it is required)
        Connect();
    }

    public void SignTx(){
        // TODO: call the backend to generated the TX (a mint)
        // then sign and submit using the code below.
        // TODO: do we need to implement the await stuff here ?
        // like blocking the game loop until the tx is submitted ? does it have to be waited 6 blocks as well ?
        SignTx("84a60081825820d486a3f98d9244372e2e337a95d16b0f1c5a385c1d6815eaca6be3eaadb3390d020183825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed9821a0012f0c0a1581cfae7fb2d73a5ab337f7b8230753e238ce0b769574f76c1a85bd70831a1581b64616f676f72615f67656e6572616c6973745f31663238353066620182581d609ae51f219a3fe119eb051e81af74546e998bbd3abeb88632945acf701a006acfc0825839000c588bbd1efe0732815c3ecee3e432e36b654a2eac1ea74c4d847f5882405717f6d8b7d7a8bdd275700161548db5c6ea38a5ae5964df6ed91a03fa0201021a000329f1031a0024502d075820c83e061494ccdf75e669005f1f7ae33f175d48473e45f07eb019d850760db89409a1581cfae7fb2d73a5ab337f7b8230753e238ce0b769574f76c1a85bd70831a1581b64616f676f72615f67656e6572616c6973745f316632383530666201a20081825820df64e7de2e5b9274dc982bf378e89d8d3d3fcfce781ff26572541070b27301375840337673c97b46111e350a4367af869175d42caf33409b6b6843cf87f064500ed004e6f6c53076dc47b32de5b75c70d73eaf834c7703c283ec2c5370ff821fbf0601818201818200581c139889b1085c15e79c580d8f22a935b5458e867b58a0b6c87c1ccdfcf5f6", 
        "1f2850fb", // comma separated nonces
        "1790dbc155c8216a58ef3bc0dad05683d6a0d2134d948191d514aa7191fff04d");
    }

    public void UpdateBalance(float balance){
        this.balance.text = balance.ToString();
    }

    public void UpdateWalletName(string walletName){
        this.walletName.text = walletName;
    }

    public void UpdateAddress(string address){
        this.address.text = address;
    }

    public void MessageHandler(string message){
        this.message.text = message;
    }
}
