import { ethers } from "ethers";

const signMessage = async ({ message }) => {
    try {
        console.log(props.message);
        if (!window.ethereum) throw new Error("No wallet found");
        await window.ethereum.send("eth_requestedAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();
        return { signature, address };
    } catch (err) { console.log(err) }
}