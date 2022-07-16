import React, { useState } from 'react';
import { Dropdown, DropdownButton, Form, Button, InputGroup } from 'react-bootstrap'

function Admin(props) {
    const contract = props.contract;
    const details = props.details;
    function takeProfit() {
        contract.takeProfit()
            .then((result) => {
                console.log("transaction", result);
            });
    }
    
    const [contractMethod, setContractMethod] = useState("setPinningRate");
    function selectMethod(event) { setContractMethod(event.target.name) }

    const [value, setValue] = useState("");
    function handleChange(event) {
        setValue(event.target.value);
    }

    function submitChange() {
        switch(contractMethod) {
            case "setPinningRate":
                contract.setPinningRate(value)
                    .then((result) => {
                        console.log("transaction", result);
                    });
                break;
            case "setMinimumFileSize":
                contract.setMinFileSize(false, value)
                    .then((result) => {
                        console.log("transaction", result);
                    });
                break;
            case "setFission":
                contract.setFission(value)
                    .then((result) => {
                        console.log("transaction", result);
                    });
                break;
            default:
                break;
        }
    }

    return(<div>
    <h1>Hello Admin!</h1>
    <hr/>
    <Form>
        <Form.Group>
            <InputGroup>
                <DropdownButton variant="secondary" className="mb-3 my-3" title="Contract Methods">
                {contractMethod !== "setPinningRate" && (<Dropdown.Item name="setPinningRate" onClick={selectMethod}>setPinningRate</Dropdown.Item>)}
                {contractMethod !== "setMinimumFileSize" && (<Dropdown.Item name="setMinimumFileSize" onClick={selectMethod}>setMinimumFileSize</Dropdown.Item>)}
                {contractMethod !== "setFission" && (<Dropdown.Item name="setFission" onClick={selectMethod}>setFission</Dropdown.Item>)}
                </DropdownButton>
                <InputGroup.Text>Current Balance: {(details.balance).toString()} Tokens</InputGroup.Text>
                <Button onClick={takeProfit}>Take Profit?</Button>
            </InputGroup>
        </Form.Group>
    </Form>
    <Form>
        <Form.Group>
            <InputGroup>
                <InputGroup.Text>{contractMethod}</InputGroup.Text>
                <Form.Control 
                type="text" 
                onChange={handleChange} 
                value={value}
                autoComplete="off"
                />
                <InputGroup.Text>
                Current Value: {
                contractMethod === "setPinningRate" ? (details.pinRate).toString() : 
                contractMethod === "setMinimumFileSize" ? (details.fsMin).toString() :
                contractMethod === "setFission" ? details.fission : "null"
                }
                </InputGroup.Text>
                <Button onClick={submitChange}>Submit</Button>
            </InputGroup>
            {/*<InputGroup>
                <InputGroup.Text>POTENTIAL IMPACT: </InputGroup.Text>
            </InputGroup>*/}
        </Form.Group>
    </Form>
	<hr/>	
    </div>);
}

export default Admin;