import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import axios from "axios";
import './Dropzone.css';
// const baseUrl = "http://localhost:4001/"
const baseUrl = "https://deaddrop-api-alpha.herokuapp.com/";
const apiUrl = baseUrl + "deaddrop/";

const chunkSize = 10 * 1024;
function Dropzone(props) {
    const [chunkIndex, setChunkIndex] = useState(null);
    const [dzActive, setDzActive] = useState(false);

    useEffect(() => { 
        if(props.fileData !== null && chunkIndex === null && props.uploaded === false) { 
            console.log("Uploading Document...");
            setChunkIndex(0);
        } 

        if(chunkIndex !== null && props.uploaded === false) readAndUploadChunk();

        if(props.fileData === null) {
            setChunkIndex(null);
            props.setUploaded(null);
            if (props.contractInput.hash !== null) {
                props.setContractInput((prev) => {return (
                    {...prev, 
                        hash: "", 
                        size: 0, 
                        type: "", 
                        name: ""
                    })
                });
            }
        } else  {
            const inputs = props.contractInput;
            const size = props.fileData.size;
            const type = props.fileData.name.split('.')[1];
            const name = props.fileData.name.split('.')[0];
            if (inputs.size === 0 || inputs.type.length === 0 || inputs.name.length === 0
             || inputs.size !== size || inputs.type !== type || inputs.name !== name) {
                props.setContractInput((prev) => {
                    return { ...prev, size: size, type: type, name: name }
                });
                props.getQuote(size);
            }
        }
        
    }, [props.fileData, chunkIndex, props.uploaded]);

    function handleDrop(event) {
        setDzActive(false);
        const thisFile = event.dataTransfer.files[0];
        if (thisFile.size >= props.min) {
            if (chunkIndex === null) {
                // console.log("Triggering Upload...");
                props.setFileData(thisFile);
                props.setUploaded(false);
                // console.log("Upload Triggered!");
            }
        }
        event.preventDefault();
    }

    function getProgress() {
        const filePresent = (props.uploaded !== null);
        if (filePresent) {
            if (props.uploaded === false) {
                const chunks = Math.ceil(props.fileData.size / chunkSize);
                return Math.round(((chunkIndex + 1) / chunks) * 100);
            } else { return 100 }
        } else { return 0 }
    }

    function readAndUploadChunk() {
        if (props.fileData === null || props.uploaded !== false) { return }
        const reader = new FileReader();
        const from = chunkIndex * chunkSize;
        const to = from + chunkSize;
        const blob = props.fileData.slice(from, to);

        function uploadChunk(event) {
            const totalChunks = Math.ceil(props.fileData.size / chunkSize);
            const dataString = JSON.stringify({
                chunk: event.target.result,
                ext: props.fileData.name.split('.').pop(), 
                chunkIndex: chunkIndex,
                totalChunks: totalChunks
            });
            const data = Buffer.from(dataString);
            const headers = {'Content-Type': 'application/octet-stream'};

            // console.log(`Posting Chunk ${chunkIndex + 1} of ${totalChunks} || ${getProgress()}%`);
            axios.post(apiUrl + 'upload', data, {headers}).then(res => {
                const chunkNum = chunkIndex + 1;
                // console.log(`Posted!`);
                const lastChunk = (chunkNum === totalChunks);
                if (lastChunk) {
                    console.log("Document Sent!");
                    props.fileData.finalName = res.data.finalName;
                    props.setUploaded(true);
                    setChunkIndex(null);
                } else { 
                    if (props.fileData.tmpName !== null) { props.fileData.tmpName = res.data.tmpName }
                    setChunkIndex(chunkNum); 
                }
            });
        }
        reader.readAsDataURL(blob);
        reader.onload = (event) => uploadChunk(event);
    }

    function abortFile() {
        console.log("Aborting Upload...");
        if (props.fileData !== null && props.uploaded === false) {
            props.setUploaded(null);
            console.log("Requesting Deletion...");
            const data = { fileName: props.fileData.tmpName };
            axios.delete(apiUrl + 'upload', { data: data, 'Content-Type': 'application/json'})
            .then((res) => {
                if (res.data === 'success') {
                    props.setFileData(null);
                }
            });
        } else { console.log("Something went wrong with abortFile()") }
    }

    function deleteFile() {
        if (props.fileData !== null && props.uploaded === true) {
            props.setDelTimer(undefined);
            console.log("Requesting Deletion...");
            if (props.busy === false) props.setBusy(true);
            const data = { fileName: props.fileData.finalName };
            axios.delete(apiUrl + 'upload', { data: data, 'Content-Type': 'application/json'})
            .then((res) => {
                if (res.data === 'success') {
                    props.setBusy(false);
                    props.setFileData(null);
                    props.setUploaded(null);
                } else { console.log(res.data) }
            });
        } else { console.log("Something went wrong with deleteFile()") }
    }

    function unpinFile() {
        props.setDelTimer(undefined);
        props.setPinTimer(undefined);
		props.setRequestsActive(prev=> {return{...prev, unpin: true}});
        console.log("Requesting Unpin...");
        props.setBusy(true);
        const data = { 
            hash: props.contractInput.hash,
            cipher: props.cipherInput.hash
        };
        axios.delete(apiUrl + 'pin', { data: data, 'Content-Type': 'application/json'})
        .then((res) => {
			props.setRequestsActive(prev=> {return{...prev, unpin: false}});
            if (res.data === 'success') {
                deleteFile();
                props.setContractInput(prev => { return { ...prev, hash: "" } });
                props.resetCipherInput();
            } else { console.log(res.data) }
        });
    }

    return(<div>
        { props.uploaded === null && (<div 
            onDragOver={event => {setDzActive(true); event.preventDefault();}}
            onDragLeave={event => {setDzActive(false); event.preventDefault();}}
            onDrop={handleDrop}
            className={"dropzone" + (dzActive ? " active" : "")} 
            >
                Drop Your file Here! (Min. {props.bytes(props.min)})
        </div>)}
        { props.fileData && (<div className="files">
            <div className="file">
                <p>{props.pinningRate}</p>
                <hr/>
                <p>Prices refresh in {props.quoteTimer}s</p>
                <p>First Month (to start) || ${(props.quote.bench / (10 ** 8))} USD as ~{(props.quote.gasBench) / (10 ** 18)} Tokens</p>
                <p>Every Day After || ${(props.quote.perDiem / (10 ** 8))} USD as ~{(props.quote.gasPerDiem / (10 ** 18))} Tokens</p>
            </div>
            <div className="file">
                <p>Please verify that the file was uploaded correctly before proceeding.</p>
                <p>Projected Cost ({props.bytes(props.contractInput.size)}) || ${props.getProjectedCost("usd")} USD as ~{props.getProjectedCost("gas")} Tokens</p>
                {props.hash.length !== 0 && (<div>IPFS CID: {props.hash}</div>)}
                    
                <p>
                    <a className="name" target="_blank" href={getProgress() === 100 ? (baseUrl + 'temp/deaddrop/uploads/' + props.fileData.finalName) : ""}>{props.fileData.name}</a>
                    {!props.requestsActive.pin && !props.requestsActive.unpin && (<span> || </span>)}
                    
                    { props.contractInput.hash.length !== 0 ? (!props.requestsActive.unpin && (!props.busy ? (<span onClick={unpinFile}>[Unpin]</span>) : <span>Unpinning...</span>)) : 
                      getProgress() !== 100 ? (
                        <span>Progress: {getProgress()}% (please do not refresh the page) || <span onClick={abortFile}>[Abort]</span></span>
                        ) : 
                        (!props.requestsActive.pin && ((!props.busy) ? (<span onClick={deleteFile}>[Delete]</span>) : (<span>Deleting...</span>)))
                    }
                </p>
                <hr/>
                
                <div className={"progress" + (getProgress() === 100 && (' done'))} style={{ width: getProgress().toString() + '%' }}>.</div>
            </div>
        </div>)}
    </div>);
}

export default Dropzone;