import React from "react";
import { Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import Home from "./home/Home";
import DStor from "./dapps/dstor/DStor";


function Routing(props) {
    const client = props.client; 
    console.log(`Detected account (active): \n${client.account}`);
    console.log(`ChainId: ${client.chainId}`);

    const loadContract = async (byName) => {
        const signer = client.provider.getSigner();
        var metadata = { name: null, abi: null, address: null };
        await import(`../data/${client.chainId}/${byName}.json`)
            .then(async (contractInterface) => {
                await import(`../data/${client.chainId}/${byName}-address.json`)
                    .then((addressMap) => { metadata = { name: byName, abi: contractInterface.abi, address: addressMap.address }; })
                    .catch((err) => console.error(err));
            }).catch((err) => console.error(err));

        console.log(`Located ${byName} at ${metadata.address}`);
        const thisContract = new ethers.Contract(metadata.address, metadata.abi, signer);
        return { foundContract: thisContract, abi: metadata.abi};
    };

    return(
        <Routes>
            <Route path="/" element={<Home />} />

            { props.client.account && (
                <Route path="/DeadDrop" element={ <DStor loadContract={loadContract} client={props.client} /> } />
            )}

            {/* !props.client.account && (
                <Route path="/dapps" element={ <Dapps /> } />
            )*/}
            
        </Routes>
    );
}

export default Routing;