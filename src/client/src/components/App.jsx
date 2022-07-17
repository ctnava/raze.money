import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ethers } from "ethers";
import Directory from "./Directory";
import WalletPrompt from "./WalletPrompt";
import Routing from "./Routing";

function App() {
  const [initialized, setInitialized] = useState(true);
  const [client, setClient] = useState({
    account: null,
    signer: null,
    chainId: null,
    provider: null,
  });
  const [hasWeb3, setHasWeb3] = useState(false);

  const web3Handler = async () => {
    // Get Active Account from Metamask
    var account;
    var chainId;

    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        account = accounts[0];
      });

    await window.ethereum.request({ method: "eth_chainId" }).then((res) => {
      chainId = res;
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = await provider.getSigner();
    setClient({
      account: account,
      signer: signer,
      chainId: parseInt(chainId, 16),
      provider: provider,
    });

    setInitialized(false);
  };

  if (window.ethereum) {
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
    if (!hasWeb3) {
      setHasWeb3(true);
    }
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Directory
          client={client}
          web3Handler={web3Handler}
          hasWeb3={hasWeb3}
        />
      </div>

      {!hasWeb3 ? (
        <Routing client={client} />
      ) : initialized ? (
        <WalletPrompt />
      ) : (
        <Routing client={client} />
      )}
    </BrowserRouter>
  );
}

export default App;
