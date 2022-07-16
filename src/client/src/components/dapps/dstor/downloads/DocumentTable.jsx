import React, { useState } from 'react';
import Fields from './Fields';
import Query from './Query';
import { Table, Row, Col, Button } from 'react-bootstrap';
import ReactTooltip from 'react-tooltip';
import CryptoJS from "crypto-js";
import axios from "axios";
import TimeExtension from './TimeExtension';
import { formatMsgVal } from '../../utils/calling';
import Actions from './Actions';
// const baseUrl = "http://localhost:4001/";
const baseUrl = "https://deaddrop-api-alpha.herokuapp.com/";
const apiUrl = baseUrl + "deaddrop/";

const defaultRequest = {
    index: undefined,
    days: 1,
    cipher: undefined,
    quote: {
        gas: undefined,
        fiat: undefined
    }
};

function quickDecrypt(data, key) { 
    const decrypted = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
    return decrypted;
} 

// const cachedKeyTemplate = { id: undefined, key: undefined };
function DocumentTable(props) {
    const [request, setRequest] = useState(defaultRequest);

    function handleRequestChange(event) {
        const [name, value] = event.target;
        if (name === "index") {
            console.log();
            var size; var hash;
            docs.ids.forEach((fileId, idx) => {
                if (fileId === value) {
                    size = parseInt(docs.contents[idx].fileSize.toString());
                    hash = docs.contents[idx].fileHash
                }
            });
            props.getQuotes(size).then(quotes => {
                // console.log(size/1024);
                const pdQuotes = { 
                    gas: parseInt(quotes[2].toString()), 
                    fiat: parseInt(quotes[0].toString()) 
                };
                const newRequest = {
                    cipher: hash,
                    index: value,
                    days: 1,
                    quote: pdQuotes
                };
                setRequest(newRequest);
            });
        } else {
            setRequest(prev => {return{...prev, days: value}})
        }
    }

    function submitRequest(event) {
        event.preventDefault();
        async function addTime() {
            const val = formatMsgVal(request.quote.gas * request.days);
            const tx = await props.contract.addTime(request.index, { value: val });
            const txdata = await tx.wait(1);
            return txdata;
        }
        addTime().then(tx => {
            console.log(tx);
            const data = { 
                cipher: request.cipher, 
                contractMetadata: {
                    chainId: props.client.chainId,
                    address: props.contract.address
                } 
            }
            axios.post(apiUrl + "extension", data, {'Content-Type': 'application/json'})
                .then(res => {
                    console.log(res);
                    props.setLoading(true);
                });
        });
    }

    const [secrets, setSecrets] = useState([]);
    // console.log(secrets); // comment me before prod
    
    function matchSecret(id) {
        var idx;
        if (secrets.length !== 0) {
            secrets.forEach((secret, index) => { if (secret.id === id) idx = index })
        }
        return idx;
    }
    const show = props.show;
    const query = props.query;

    function filteredResults() {
        const collection = props.docs.contents;
		const expDates = props.docs.expDates;
        const ids = props.docs.ids;
		const qr = {contents: [], expDates: [], ids: []};
		collection.forEach((document, index) => { 
            const decryptedDoc = {
                fileHash: document.fileHash,
                fileName: autoDecrypt(ids[index], document.fileName),
                fileType: autoDecrypt(ids[index], document.fileType),
                fileDescription: autoDecrypt(ids[index], document.fileDescription),
                fileSize: document.fileSize,
                recipient: document.recipient,
                uploader: document.uploader,
                uploadTime: document.uploadTime
            };

			const normalized = { 
				hash: decryptedDoc.fileHash,
                name: decryptedDoc.fileName,
                type: decryptedDoc.fileType,
                memo: decryptedDoc.fileDescription,
				timestamp: document.timestamp,
				expiration: expDates[index],
				size: document.fileSize,
				from: document.uploader, 
				to: document.recipient 
			}

			const strFields = ["name", "type", "memo", "from", "to"];
			var matchedStrFields = [];
			strFields.forEach((field) => {matchedStrFields.push(
                query[field].length === 0 ? true : false
            )});
			strFields.forEach((field, fieldIndex) => {
				if (matchedStrFields[fieldIndex] === false) { 
					if (normalized[field].includes(query[field])) { 
						matchedStrFields[fieldIndex] = true; 
					} 
				}
			});
            
            var matchedNumFields = []; /*size*/
            matchedNumFields.push(
                (query.size.min === 0 && query.size.max === 1024 && query.size.units === "YB") ? true : false
            );
            const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            if (matchedNumFields[0] === false) {
                const multiplier = 1024 ** (units.indexOf(query.size.units));
                // console.log(multiplier);
                const size = parseInt(normalized.size.toString());
                // console.log("max", parseInt(query.size.max) * multiplier);
                // console.log(size);
                // console.log("min", parseInt(query.size.min) * multiplier);
                if (size <= (parseInt(query.size.max) * multiplier) && size >= (parseInt(query.size.min) * multiplier)) { 
                    matchedNumFields[0] = true 
                }
            }

            const dateFields = ["timestamp", "expiration"];
            var matchedDateFields = [];
            dateFields.forEach((field) => {matchedDateFields.push(
                ((query[field].start).toString() === (new Date("2020/03/13")).toString() && (query[field].end).toString() === props.defaultEnd.toString()) ? true : false
            )});
            dateFields.forEach((field, fieldIndex) => {
                if (matchedDateFields[fieldIndex] === false) {
                    /*if(normalized[field] something something)*/
                    console.log("tripped");
                    // console.log(query[field].end.toString());
                    // console.log(props.defaultEnd.toString()); 
                }
            });

			if (!matchedStrFields.includes(false) && !matchedNumFields.includes(false) && !matchedDateFields.includes(false)) { 
                qr.ids.push(ids[index]); 
                qr.expDates.push(expDates[index]); 
                qr.contents.push(decryptedDoc); 
            }
		});

        return qr; // qr
    }

    const docs = filteredResults();
    const messages = docs.contents;
    const expDates = docs.expDates;
    const ids = docs.ids;

    function autoDecrypt(id, data) {
        var idx;
        if (secrets.length !== 0) {
            secrets.forEach((secret, index) => { if (secret.id === id) idx = index });
            // console.log(secrets[idx].key);
            if (idx !== undefined && idx !== null) return quickDecrypt(data, secrets[idx].key);
            else return data;
        }
        else return data;
    }

    function handleDecryption(id, cipher) {
        props.client.signer.signMessage(cipher).then((signature) => {
            const data = {cipher: cipher, signature: signature};
            axios.post(apiUrl + "decipher", data, {'Content-Type': 'application/json'})
            .then((res) => {
                const errors = [
                    "err: Pin.findOne @ app.post('/deaddrop/decipher')",
                    "err: signature failure @ app.post('/deaddrop/decipher')",
                    "err: empty cipher @ app.post('/deaddrop/decipher')"
                ];
                if (!errors.includes(res.data)) setSecrets(prev => [...prev, {id:id, key:res.data}]);
                else console.log(res);
            });
        });
    }


    function decryptAll(event) {
        event.preventDefault();
        var toDecipher = [];
        var returnedSecrets = [];
        messages.forEach((message, index) => {
            const cipher = message.fileHash;
            const id = ids[index];
            var isDecrypted = false;
            if (secrets.length !== 0) {
                secrets.forEach((secret) => {
                    if (secret.id === id) isDecrypted = true;
                });
            }
            if (!isDecrypted) {
                toDecipher.push(cipher);
                returnedSecrets.push({ id:id, key:undefined });
            }
        });

        props.client.signer.signMessage(toDecipher.toString())
        .then((signature) => {
            const data = {ciphers: toDecipher, signature: signature};
            axios.post(apiUrl + "batchDecipher", data, {'Content-Type': 'application/json'})
            .then((res) => {
                if (typeof res.data !== typeof "string") {
                    returnedSecrets.forEach((entry, index) => {
                        entry.key = res.data[index];
                    });
                    setSecrets(prev => [...prev, ...returnedSecrets]);
                    props.setShow({ 
                        ...props.show, 
                        name:true, 
                        memo:true, 
                        type:true 
                    });
                }
                else console.log(res.data);
            });
        });
    }


    const [links, setLinks] = useState([]);
    function matchLink(id) {
        var idx;
        if (links.length !== 0) {
            links.forEach((link, index) => { if (link.id === id) idx = index })
        }
        return idx;
    }

    function getLink(idx) {
        const index = matchLink(idx);
        const linkObject = links[index];
        if (linkObject !== null && linkObject !== undefined) {
            const link = linkObject.link;
            if (link !== null && link !== undefined) return link;
        }
    }

    function bufferDownload(id, cipher, name, type) {
        props.client.signer.signMessage(cipher).then((signature) => {
            setLinks(prev => [...prev, {id:id, link:undefined}]);
            const fileName = `${name}.${type}`;
            const data = { cipher, signature, fileName };
            axios.post(apiUrl + "download", data, {'Content-Type': 'application/json'})
            .then((res) => {
                const errors = [
                    "err: Pin.findOne @ app.post('/deaddrop/download')",
                    "err: signature failure @ app.post('/deaddrop/download')",
                    "err: empty cipher @ app.post('/deaddrop/download')"
                ];
                if (!errors.includes(res.data)) {
                    setLinks(prev => [...prev, {id:id, link:`${baseUrl}temp/deaddrop/downloads/decrypted/${res.data}/${fileName}`}]);
                }
                else console.log(res);
            });
        });
    }

    function redownload(id, cipher, name, type) {
        const fileUrl = links[matchLink(id)].link;
        const pieces = fileUrl.split('/');
        const rawCid = pieces[pieces.length - 2];
        axios.delete(apiUrl + "download", {'data': { cid: rawCid }})
        .then(res => {
            if (res.data === "success") {
                const filtered = links.filter(link => link.id !== id);
                setLinks(filtered);
                bufferDownload(id, cipher, name, type);
            } else console.log(res.data);
        });
    }


    return(
    <Row>
        <Row>
            <Fields 
            show={props.show} 
            setShow={props.setShow} 
            />
            <Query 
            showQueryField={props.showQueryField}
		    setShowQueryField={props.setShowQueryField}
		    query={props.query}
            resetQuery={props.resetQuery}
		    handleQuery={props.handleQuery}
            handleSizeQuery={props.handleSizeQuery}
            handleDateQuery={props.handleDateQuery}
            />
        </Row>
        { request.index !== undefined && (<Row>
            <TimeExtension 
            request={request}
            handleChange={handleRequestChange}
            handleClick={submitRequest}
            />
        </Row>)}
        <Row><Col>
            <Button className="my-3" variant="secondary" onClick={decryptAll}>Decrypt All</Button>
        </Col></Row>
    <Table className="px-5 container" striped bordered hover variant="dark">
    <thead>
        <tr>
            <th>Index</th>
            {show.name && (<th>File</th>)}
            {show.type && (<th>Type</th>)}
            {show.memo && (<th>Memo</th>)}
            {show.size && (<th>Size</th>)}
            {show.timestamp && (<th>Timestamp</th>)}
            {show.expiration && (<th>Expires At</th>)}
            {show.from && (<th>Sender</th>)}
            {show.to && (<th>Receiver</th>)}
            <th>Actions</th>
        </tr>
    </thead>
    
    <tbody>
        { messages.map((message, index) => {
            const timestamp = new Date((message.uploadTime.toNumber()) * 1000);
            const expDate = new Date((expDates[index].toNumber()) * 1000);
            return(
        <tr key={ids[index]}>
            <td>{ids[index]}</td>
            {show.name && (<td>{message.fileName}</td>)}
            {show.type && (<td>{message.fileType}</td>)}
            {show.memo && (<td>{message.fileDescription}</td>)}
            {show.size && (<td>{props.bytes(message.fileSize.toNumber())}</td>)}
            {show.timestamp && (<td>{timestamp.toLocaleString()}</td>)}
            {show.expiration && (<td>
            <a data-tip data-for={`expiration${ids[index]}`} onClick={()=>{
                const event = { target: ["index", ids[index]] }
                handleRequestChange(event);
            }}>{expDate.toLocaleString()}</a>
            <ReactTooltip id={`expiration${ids[index]}`} type='warning' effect='solid'>
            Need more time?<br/>
            Click to extend!
            </ReactTooltip>
            </td>)}
            {show.from && (<td>{message.uploader}</td>)}
            {show.to && (<td>{message.recipient}</td>)}
            <td>
                <Actions 
                idx={ids[index]}
                matchSecret={matchSecret}
                matchLink={matchLink}
                getLink={getLink}
                bufferDownload={bufferDownload}
                handleDecryption={handleDecryption}
                redownload={redownload}
                fileHash={message.fileHash}
                fileName={message.fileName}
                fileType={message.fileType}
                />
            </td>
        </tr>);
        }) }
    </tbody>
    </Table>
    {messages.length === 0 && (<p>No messages found.</p>)}
    </Row>
    );
}

export default DocumentTable;