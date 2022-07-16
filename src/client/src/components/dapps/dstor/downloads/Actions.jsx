import React from 'react';


function Actions(props) {
    const secretIdx = props.matchSecret(props.idx);
    const secretExists = (secretIdx !== undefined && secretIdx !== null); 
    if (!secretExists) return(
        <div 
        onClick={(event) => {
            props.handleDecryption(props.idx, props.fileHash);
            event.preventDefault();
        }}
        >[decrypt]
        </div>);

    else {
        const linkIdx = props.matchLink(props.idx);
        const linkIdxExists = (linkIdx !== undefined && linkIdx !== null);
        if (!linkIdxExists) return(
            <div 
            onClick={
                (event) => {
                    event.preventDefault();
                    const linkIdx = props.matchLink(props.idx);
                    const notAlreadyCalled = (linkIdx === undefined || linkIdx === null);
                    if (notAlreadyCalled === true) {
                        props.bufferDownload(props.idx, props.fileHash, props.fileName, props.fileType);
                    } else console.log(linkIdx);
                }
            }
            >[download]
            </div>);
        else {
            const link = props.getLink(props.idx);
            const linkExists = (link !== undefined && link !== null);
            if (linkExists) return (<span>
            <a href={link}>[download]</a> / <div onClick={(event) => {
                event.preventDefault();
                props.redownload(props.idx, props.fileHash, props.fileName, props.fileType);
            }}>[redownload]</div>
            </span>);
            else return (<div>downloading...</div>);
        }
    }
} 
      

export default Actions;