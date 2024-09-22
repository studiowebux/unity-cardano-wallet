<div align="center">

<h2>Unity Cardano Wallet</h2>

<p>Integration of Weld (Universal wallet connector) into Unity (The game engine) in Javascript.</p>

<p align="center">
  <a href="https://github.com/studiowebux/unity-cardano-wallet/issues">Report Bug</a>
  ·
  <a href="https://github.com/studiowebux/unity-cardano-wallet/issues">Request Feature</a>
</p>
</div>

---

## About

1. **Simple Wallet Connector**: You want to integrate Weld, a TypeScript and browser wallet connector, in JavaScript within Unity.
2. **Wallet Interaction**: The goal is to connect the user's wallet, sign transactions, and perform other wallet-related interactions.
3. **Events**: You're using JavaScript events to update your Unity WebGL application or game when necessary.
4. **Backend Requirement**: This Plugin only utilizes signature capabilities, you still have to use a backend for handling more complex operations.
- **Reusability**: I was able to reuse 80% of the code from my Deno, Hono and HTMX Project.

### TODO

- [ ] Fix issue when application load to get all installed wallets.
- [ ] Show Wallets NFTs/FTs only using the wallet state.
- [ ] Send UTXos to Backend from wallet state (Currently I send the change address and fetch utxos using blockfrost).
- [ ] Improve UI to create a reusable gameobject.
- [ ] Create a simple Interactive demo to play a "game".

---

## Installation and Usage

TODO, currently this is a POC.

**Useful links**

- Weld: https://github.com/Cardano-Forge/weld (The current code for weld has been compiled and sent manually, it works with HTMX and Unity, this is propably not the latest version.)
- https://docs.unity3d.com/ScriptReference/Networking.UnityWebRequest.Post.html
- https://stackoverflow.com/questions/66683347/parsing-json-from-api-url-in-unity-via-c-sharp
- https://docs.unity3d.com/ru/2021.1/Manual/webgl-interactingwithbrowserscripting.html
- https://docs.unity3d.com/Manual/web-interacting-browser-js.html
- https://docs.unity3d.com/Manual/web-interacting-browser-js-to-unity.html

My backend is built using the libs I made with CSL.

- https://github.com/studiowebux/cardano
- https://github.com/studiowebux/cardano-indexer
- https://github.com/studiowebux/cardano-private-node
- https://github.com/studiowebux/nami (Custom fork to work with Cardano private node)
- The Game I built to learn cardano related stuff is a private repository.

---

### Releases and Github Actions

```bash
git tag -a X.Y.Z -m "Version X.Y.Z"
git push origin tags/X.Y.Z
```

---

## Contributing

1. Fork the project
2. Create a Feature Branch
3. Commit your changes
4. Push your changes
5. Create a PR

<details>
<summary>Working with your local branch</summary>

**Branch Checkout:**

```bash
git checkout -b <feature|fix|release|chore|hotfix>/prefix-name
```

> Your branch name must starts with [feature|fix|release|chore|hotfix] and use a / before the name;
> Use hyphens as separator;
> The prefix correspond to your Kanban tool id (e.g. abc-123)

**Keep your branch synced:**

```bash
git fetch origin
git rebase origin/master
```

**Commit your changes:**

```bash
git add .
git commit -m "<feat|ci|test|docs|build|chore|style|refactor|perf|BREAKING CHANGE>: commit message"
```

> Follow this convention commitlint for your commit message structure

**Push your changes:**

```bash
git push origin <feature|fix|release|chore|hotfix>/prefix-name
```

**Examples:**

```bash
git checkout -b release/v1.15.5
git checkout -b feature/abc-123-something-awesome
git checkout -b hotfix/abc-432-something-bad-to-fix
```

```bash
git commit -m "docs: added awesome documentation"
git commit -m "feat: added new feature"
git commit -m "test: added tests"
```

</details>

## License

Distributed under the MIT License. See LICENSE for more information.

## Contact

- Tommy Gingras @ tommy@studiowebux.com | Studio Webux

<div>
<b> | </b>
<a href="https://www.buymeacoffee.com/studiowebux" target="_blank"
      ><img
        src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
        alt="Buy Me A Coffee"
        style="height: 30px !important; width: 105px !important"
        height="30"
        width="105"
/></a>
<b> | </b>
<a href="https://webuxlab.com" target="_blank"
      ><img
        src="https://webuxlab-static.s3.ca-central-1.amazonaws.com/logoAmpoule.svg"
        alt="Webux Logo"
        style="height: 30px !important"
        height="30"
/> Webux Lab</a>
<b> | </b>
</div>
