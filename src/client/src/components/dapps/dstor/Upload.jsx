import React, { useState, useEffect } from 'react'
import Dropzone from './uploads/Dropzone';
import { Row, Form, Button, InputGroup } from 'react-bootstrap'
import axios from "axios";
// const apiUrl = "http://localhost:4001/" + "deaddrop/";
const apiUrl = "https://deaddrop-api-alpha.herokuapp.com/" + "deaddrop/";

const readyMessage = "Pin to IPFS!";
const pinningMessage = "Pinning... Please Wait";
var timeLeft = "";
const defaultRequestsMade = {
	unpin: false,
	pin: false,
	transaction: false
};
function Upload(props) {
    const [busy, setBusy] = useState(false);
	const [fileData, setFileData] = useState(null);
    const [uploaded, setUploaded] = useState(null);
	const [pinning, setPinning] = useState(readyMessage);

	const defaultInput = { hash: "", size: 0, type: "", name: "", description: "", recipient: "" };
	const [contractInput, setContractInput] = useState(defaultInput);
	const [cipherInput, setCipherInput] = useState(defaultInput);

	function resetCipherInput() {
		setCipherInput(defaultInput);
	}

	function handleChange(event) {
		const { name, value } = event.target;
		setContractInput(prev => {
			return {...prev, [name]: value};
		});
	}

	const [pinTimer, setPinTimer] = useState(undefined);
	useEffect(() => {
		if (contractInput.hash.length !== 0 && pinTimer === undefined && !request.transaction && !request.unpin && !request.pin) setPinTimer(60);
	}, [contractInput, pinTimer]);

	useEffect(() => {
		if (pinTimer !== undefined) {
			if (pinTimer === 0) {
				setPinTimer(undefined);
				unpinFile();
			} else if (pinTimer !== 0 && fileData !== null) {
				const intervalId = setInterval(() => {setPinTimer(pinTimer-1)}, 1000);
				return () => clearInterval(intervalId);
			}
		}
	}, [pinTimer, fileData]);

	const [delTimer, setDelTimer] = useState(undefined);
	useEffect(() => {
		if (fileData !== null && delTimer === undefined && uploaded === true && !request.transaction && !request.unpin && !request.pin) setDelTimer(300);
	}, [fileData, delTimer, uploaded]);

	useEffect(() => {
		if (delTimer !== undefined) {
			if (delTimer === 0) {
				setDelTimer(undefined);
				deleteFile();
			} else if (delTimer !== 0 && pinning !== pinningMessage) {
				const intervalId = setInterval(() => {setDelTimer(delTimer-1)}, 1000);
				timeLeft = ` || Time Left(${delTimer}s)`;
				return () => clearInterval(intervalId);
			}
		}
	}, [delTimer, pinning]);

	const defaultQuote = { perDiem: 0, bench: 0, gasPerDiem: 0, gasBench: 0 };
	const [quote, setQuote] = useState(defaultQuote);
	const [quoteTimer, setQuoteTimer] = useState(undefined);
	useEffect(() => {
		if (quoteTimer !== undefined) {
			if (quoteTimer === 0) {
				// console.log(quoteTimer);
				setQuoteTimer(15);
				if (fileData !== null) getQuote(fileData.size);
			} else if (quoteTimer !== 0) {
				const intervalId = setInterval(() => {setQuoteTimer(quoteTimer-1)}, 1000);
				// console.log(quoteTimer);
				return () => clearInterval(intervalId);
			}
		} else if (quoteTimer === undefined && fileData !== null) setQuoteTimer(15);
	}, [quoteTimer, fileData]);

	function getQuote(numBytes) {
		props.getQuotes(numBytes).then((quotes) => {
			const [perDiem, bench, gasPerDiem, gasBench] = quotes;
			setQuote({ 
				perDiem: parseInt(perDiem.toString()),
				bench: parseInt(bench.toString()),
				gasPerDiem: parseInt(gasPerDiem.toString()),
				gasBench: parseInt(gasBench.toString())
			});
		});
	}
	
	const [additionalTime, setAdditionalTime] = useState(0);
	function handleTimeChange(event) { setAdditionalTime(event.target.value) }

	function getProjectedCost(type) {
		const bf = (type === "usd") ? (quote.bench / (10 ** 8)) : (quote.gasBench / (10 ** 18));
		const pd = (type === "usd") ? (quote.perDiem / (10 ** 8)) : (quote.gasPerDiem / (10 ** 18));
		const cost = (bf + (pd * additionalTime)).toString();
		return (cost.slice(0, cost.indexOf(".") + 9));
	}

	const [request, setRequest] = useState(defaultRequestsMade);
	function pinToServer(event) {
		timeLeft = "";
		setDelTimer(undefined);
		setPinTimer(undefined);
		setPinning(pinningMessage);

		const data = { 
			fileName: fileData.finalName, 
			contractMetadata: { 
				chainId: props.client.chainId, 
				address: props.contract.address
			}, 
			contractInput: contractInput 
		};
		// console.log(data);
		axios.post(apiUrl + "pin", data, {'Content-Type': 'application/json'})
			.then((res) => {
				setRequest(prev=> {return{...prev, pin: false}});
				if (res.data.hash && res.data.encryptedInputs) {
					setContractInput(prev => {return({...prev, hash: res.data.hash})});
					setPinning(readyMessage);
					console.log("File Uploaded to IPFS!");
					setCipherInput(res.data.encryptedInputs);
				} else {
					setPinning(readyMessage);
					console.log(res.data);
				}
			});
	}

	function deleteFile() {
        if (fileData !== null && uploaded === true) {
			timeLeft = "";
			setDelTimer(undefined);
            console.log("Requesting Deletion...");
			if (busy === false) setBusy(true);
            const data = { fileName: fileData.finalName };
            axios.delete(apiUrl + "upload", { data: data, 'Content-Type': 'application/json'})
            .then((res) => {
                if (res.data === 'success') {
					setBusy(false);
                    setFileData(null);
                    setUploaded(null);
                } else { console.log(res.data) }
            });
        } else { console.log("Something went wrong with deleteFile()") }
    }

	function unpinFile() {
		setDelTimer(undefined);
		setPinTimer(undefined);
		setRequest(prev=> {return{...prev, unpin: true}});
        console.log("Requesting Unpin...");
        setBusy(true);
        const data = { 
            hash: contractInput.hash,
            cipher: cipherInput.hash
        };
        axios.delete(apiUrl + 'pin', { data: data, 'Content-Type': 'application/json'})
        .then((res) => {
			setRequest(prev=> {return{...prev, unpin: false}});
            if (res.data === 'success') {
                deleteFile();
                setContractInput(prev => { return { ...prev, hash: "" } });
                resetCipherInput();
            } else { console.log(res.data) }
        });
    }

	// disable input before transaction
	function makeTransaction() {
		// console.log(contractInput);
		const input = cipherInput;
		// console.log(input);
		// getQuote(fileData.size);
		const messageValue = (quote.gasBench + (quote.gasPerDiem * additionalTime));
		props.uploadFile(input, messageValue).then((tx) => {
			const data = { 
				hash: contractInput.hash, 
				cipher: cipherInput.hash,
				contractMetadata: { 
					chainId: props.client.chainId, 
					address: props.contract.address
				}, 
				tx: tx.hash 
			};
			axios.post(apiUrl + "transaction", data, {'Content-Type': 'application/json'}).then(res => {
				setRequest(prev=> {return{...prev, transaction: false}});
				console.log(res);
				if (res.data === "success") {
					setFileData(null);
					setContractInput(defaultInput);
					setCipherInput(defaultInput);
					deleteFile();
					props.setShowUpload(false);
					props.setLoading(true);
				}
			});
		}).catch(()=>{
			setRequest(prev=> {return{...prev, transaction: false}});
			unpinFile();
		});
	}

	// console.log(contractInput);

	function handlePin(event) {
		event.preventDefault();
		if (!request.pin && !request.unpin) {
			console.log("pin acknowledged");
			setRequest(prev=> {return{...prev, pin: true}});
			pinToServer();
		}
	}

	function handleTx(event) {
		event.preventDefault();
		if (!request.transaction && !request.unpin) {
			setRequest(prev=> {return{...prev, transaction: true}});
			console.log("tx acknowledged");
			const data = { 
				hash: contractInput.hash, 
				cipher: cipherInput.hash,
				contractMetadata: { 
					chainId: props.client.chainId, 
					address: props.contract.address
				}
			};
			axios.patch(apiUrl + "pin", data, {'Content-Type': 'application/json'})
			.then(res => {
				if (res.data === "success") {
					setPinTimer(pinTimer + 900);
					makeTransaction();
				} else console.log(res.data);
			});
		}
	}

	return(<div>
	<div>{uploaded === null && (<p>{props.rules.pinningRate}</p>)}</div>
	<div className="g-4 py-2">
		<Dropzone 
		requestsActive={request}
		setRequestsActive={setRequest}
		bytes={props.bytes}
		min={props.rules.minimumFileSize}
		pinningRate={props.rules.pinningRate}
		hash={contractInput.hash}
		getProjectedCost={getProjectedCost}
		busy={busy}
		setBusy={setBusy}
		setDelTimer={setDelTimer}
		setPinTimer={setPinTimer}

		quote={quote}
		quoteTimer={quoteTimer}
		getQuote={getQuote}

		contractInput={contractInput}
		setContractInput={setContractInput}
		cipherInput={cipherInput}
		resetCipherInput={resetCipherInput}
		fileData={fileData}
		setFileData={setFileData}
		uploaded={uploaded}
		setUploaded={setUploaded}
		/>
	</div>
	<Row className="g-4 py-2">
		<Form>
		{fileData !== null && (<div>
			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>Receiver</InputGroup.Text>
						<Form.Control
						type="text"
						name="recipient"
						onChange={handleChange}
						placeholder="0x......."
						value={contractInput.recipient}
						autoComplete="off"
						disabled={contractInput.hash.length !== 0 ? "not":""}
						/>
					</InputGroup>
				</Form.Group>
			</Row>
			
			<Row>
				<Form.Group>
					<InputGroup>
						<InputGroup.Text>Secret<br/>Message</InputGroup.Text>
						<Form.Control 
						as="textarea" 
						rows={5}
						name="description" 
						onChange={handleChange} 
						disabled={contractInput.hash.length !== 0 ? "not":""}
						placeholder="The password is 'saltyH4ckerTears[2_1337_4U]' (single quotes not included)
						(This memo will only visible to you and the recipient through this DApp. )"
						value={contractInput.description}
						/>
					</InputGroup>
				</Form.Group>
			</Row>
			</div>)}
			<Row>
			<Form.Group>
				{fileData !== null && (<div>
				<InputGroup>
					<InputGroup.Text>Additional Storage Time</InputGroup.Text>
					<Form.Control 
					onChange={handleTimeChange}
					type="number" 
					min="0"
					placeholder="in days"
					/>
					<InputGroup.Text>Days</InputGroup.Text>
					
				</InputGroup>
				</div>)}
			</Form.Group>
			</Row>
		</Form>	
	</Row>

	{ uploaded === true && contractInput.name.length !== 0 && !contractInput.name.includes(".") && (<div>	
	<Row>
		<Button 
		onClick={contractInput.description.length !== 0 && contractInput.recipient.length === 42 && 
		contractInput.recipient.slice(0,2) === "0x" && busy === false && !request.unpin && !request.pin && !request.transaction ? 
		(contractInput.hash.length === 0 ? handlePin : handleTx):(console.log())} 
		variant={contractInput.hash.length === 0 ? "warning" : "danger"}
		>{request.unpin ? "Unpinning..." : (contractInput.hash.length === 0 ? (pinning + timeLeft)  : "Transact || Time Left(" + pinTimer+ "s)")}</Button>
	</Row>
	</div>) }

	<p className="g-4 py-2 text-muted">
		DISCLAIMER: This DApp will upload the specified file to IPFS; a free, secure, and decentralized file storage protocol. 
		It is your responsibility to encrypt the file itself for enhanced privacy protection. When a file is uploaded to IPFS,
		it is retrievable via a Content Identifier (CID) that is generated with respect to the file's contents and metadata. 
		Consequently, all content on IPFS is inherently anonymous (unlabeled and without file type extensions). Please label 
		and describe your file appropriately to ensure that your content makes it to the intended recipient in a recognizable 
		manner.
	</p>

</div>);
}

export default Upload;
