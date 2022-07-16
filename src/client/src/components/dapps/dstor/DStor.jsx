import React, { useState } from 'react';
import { ethers } from "ethers";
import Admin from "./Admin";
import Locating from "../../Locating";
import ShowButton from "./ShowButton";
import Upload from "./Upload";
import Downloads from "./Downloads";


function humanBytes(x) {
	const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(x, 10) || 0;
    while(n >= 1024 && ++l){n = n/1024;}
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}


function DStor(props) {
	const [contract, setContract] = useState();
	const [abi, setAbi] = useState(undefined);
	const [loading, setLoading] = useState(true);
	const messageBox = {
		contents: [],
		expDates: [],
		ids: []
	};
	const [outbox, setOutbox] = useState(messageBox);
	const [inbox, setInbox] = useState(messageBox);
	const adminDefault = {
		show: false,
		balance: 0,
		fsMin: 0,
		pinRate: 0,
		fission: ""
	}
	const [adminDetails, setAdminDetails] = useState(adminDefault);

	const initialize = async () => {
		if (!loading) { setLoading(true); }
		console.log(contract);
		console.log("Gathering Messages...");
		const [sent, sentExps, sentIds, received, receivedExps, receivedIds] = await contract.getAllData();
		var formattedSentIds = [];
		sentIds.forEach(id => { formattedSentIds.push(parseInt(id.toString())) });
		var formattedReceivedIds = [];
		receivedIds.forEach(id => { formattedReceivedIds.push(parseInt(id.toString())) });
		console.log("Messages received!");
		const ownerAddress = await contract.owner();
		console.log("owner:", ownerAddress);
		setOutbox({ contents: sent, expDates: sentExps, ids: formattedSentIds });
		setInbox({ contents: received, expDates: receivedExps, ids: formattedReceivedIds });
		if (ownerAddress.toLowerCase() === props.client.account) { 
			const balance = await (props.client.provider).getBalance(contract.address);
			const fsMin = await contract.minimumFileSize();
			const pinMin = await contract.minimumPin();
			const pinRate = await contract.pinningRate();
			const fission = await contract.fissionEngine();
			setAdminDetails({
				show: true,
				balance: balance,
				fsMin: fsMin,
				pinMin: pinMin,
				pinRate: pinRate,
				fission: fission
			});
		}
		await getRules();
		setLoading(false);
	};

	const uploadFile = async (file, msgValue) => {
		const val = ethers.utils.parseUnits(msgValue.toString(), "wei");
		// console.log(val);
		const tx = await contract.upload(file.hash, file.size, file.type, file.name, file.description, file.recipient, { value: val });
		const txdata = await tx.wait(1);
		console.log(txdata);
		return txdata;
	};

	const getQuotes = async (size) => {
		const [perDiem, bench] = await contract.quote(size);
		const [gasPerDiem, gasBench] = await contract.gasQuote(size);
		return [perDiem, bench, gasPerDiem, gasBench];
	}

	const defaultRules = {
		name: "",
		pinningRate: "",
		minimumPin: 0,
		minimumFileSize: 0,
	}
	const [rules, setRules] = useState(defaultRules);

	const getRules = async () => {
		const name = await contract.name();
		const pinningRate = (await contract.pinningRate()).toString();
		const monthly = `${pinningRate.slice(0, pinningRate.length - 2)}.${pinningRate.slice(-2)}`;
		const daily = (parseInt(monthly) / 30).toString();
		const pinQuote = ("Storage at $"+monthly+" per GB per Month and then $"+daily.slice(0, daily.indexOf(".")+9)+" per day after!");
		const minimumPin = await contract.minimumPin();
		const pin = minimumPin.toString();
		const minimumFileSize = await contract.minimumFileSize();
		const fsMin = minimumFileSize.toString();
		const ruleSet = {
			name: name,
			pinningRate: pinQuote,
			minimumPin: parseInt(pin),
			minimumFileSize: parseInt(fsMin)
		}
		setRules(ruleSet);
		return ruleSet;
	}
	

	const [showUpload, setShowUpload] = useState(false);
	const [showDownload, setShowDownload] = useState(false);

	return(<div className="DStor flex justify-center">
		{ loading ? (
			<Locating 
			name="DStor" 
			contract={contract}
			loading={loading}
			loadContract={props.loadContract}
			setContract={setContract}
			setAbi={setAbi}
			initialize={initialize}
			/>
		) : (<div>
			{ adminDetails.show && (<Admin contract={contract} details={adminDetails} />)}

			{ showUpload ? (
				<Upload 
				className="panel" 
				setShowUpload={setShowUpload}
				setLoading={setLoading}
				
				client={props.client}
				contract={contract}
				abi={abi}
				rules={rules}
				getQuotes={getQuotes}
				bytes={humanBytes} 
				uploadFile={uploadFile} 
				/> 
			) : (
				<ShowButton 
				show={showUpload}
				setShow={setShowUpload}
				message="Upload a File"
				/>
			)}

			<hr/>

			{ showDownload ? (
				<Downloads 
				className="panel" 
				abi={abi}
				contract={contract}
				client={props.client}
				getQuotes={getQuotes}
				setLoading={setLoading}
				bytes={humanBytes} 
				inbox={inbox} 
				outbox={outbox} 
				/>
			) : (
				<ShowButton 
				show={showDownload}
				setShow={setShowDownload}
				message="Show Available Downloads"
				/>
			)}</div>
		)}
	</div>);
}

export default DStor;
