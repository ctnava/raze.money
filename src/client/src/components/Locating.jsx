import React, { useState } from "react";
import { Spinner } from "react-bootstrap";

function Locating(props) {
    const [located, setLocated] = useState(false);
    const [initializing, setInitializing] = useState(false);

    const locateContract = async () => {
        setLocated(true);
        if (props.loading) { 
            console.log(`Locating ${props.name}...`);
            const {foundContract, abi} = await props.loadContract("DStor")
                .then((result) => { return result }); 
            await props.setContract(foundContract);
            await props.setAbi(abi);
        }
    };

    if (!located) { 
        locateContract();
    } else { 
        if(props.contract && !initializing) { 
            setInitializing(true);
            props.initialize();
        } 
    }

    return(<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spinner animation="border" style={{ display: 'flex' }} />
        <p className='mx-3 my-0'>Locating the {props.name} contract...<br/>Please be patient.</p>
    </div>);
}

export default Locating;