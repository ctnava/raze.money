async function getName(contract) {
    const name = await contract.name();
    return name;
}

async function fission(contract) {
    const address = await contract.fissionEngine();
    return address;
}

async function minPin(contract) {
    const minimumPin = await contract.minimumPin();
    return parseInt(minimumPin.toString());
}

async function pinRate(contract) {
    const pinningRate = await contract.pinningRate();
    return parseInt(pinningRate.toString());
}

async function fileSizeMin(contract) {
    const minimumFileSize = await contract.minimumFileSize();
    return parseInt(minimumFileSize.toString());
}

async function numFiles(contract) {
    const fileCount = await contract.fileCount();
    return parseInt(fileCount.toString());
}

async function getBasicInfo(contract) {
    const [name, fisEng, minTime, rate, minSize, num] = await contract.basicInfo();
    const owner = await contract.owner();
    const info = {
        name: name,
        fission: fisEng,
        minPin: parseInt(minTime.toString()),
        pinRate: parseInt(rate.toString()),
        fileSizeMin: parseInt(minSize.toString()),
        numFiles: parseInt(num.toString()),
        owner: owner
    };
    return info;
}

async function fiatQuote(contract, numBytes) {
    const [perDiem, bench] = await contract.quote(numBytes);
    return {
        perDiem: parseInt(perDiem.toString()),
        bench: parseInt(bench.toString())
    }
}

async function gasQuote(contract, numBytes) {
    const [perDiem, bench] = await contract.gasQuote(numBytes);
    return {
        perDiem: parseInt(perDiem.toString()),
        bench: parseInt(bench.toString())
    }
}

async function getQuotes(contract, numBytes) {
    const [perDiem, bench, gasPerDiem, gasBench] = await contract.bothQuotes(numBytes);
    return {
        gas: {
            perDiem: parseInt(gasPerDiem.toString()),
            bench: parseInt(gasBench.toString())
        },
        fiat: {
            perDiem: parseInt(perDiem.toString()),
            bench: parseInt(bench.toString())
        }
    }
}

function normalizeFile(file) {
    return {
        hash: file.fileHash,
        name: file.fileName,
        type: file.fileType,
        memo: file.fileDescription,
        timestamp: parseInt(file.uploadTime.toString()),
        size: parseInt(file.fileSize.toString()),
        from: file.uploader,
        to: file.recipient
    }
}

async function getFile(contract, fileId) {
    const file = await contract.get(fileId);
    return normalizeFile(file);
}

async function getFileIds(contract, isSender) {
    const ids = await contract.getAccessibleFileIds(isSender);
    var normalized = [];
    ids.forEach(id => {normalized.push(parseInt(id.toString()))});
    return normalized;
}

async function getFiles(contract, isSender) {
    const files = await contract.getAccessibleFiles(isSender);
    var normalized = [];
    files.forEach(file => {normalized.push(normalizeFile(file))});
    return normalized;
}

async function getFileExps(contract, isSender) {
    const exps = await contract.getAccessibleExps(isSender);
    var normalized = [];
    exps.forEach(exp => {normalized.push(parseInt(exp.toString()))});
    return normalized;
}

async function getAllFileData(contract) {
    const [sent, sentExps, sentIds, received, receivedExps, receivedIds] = await contract.getAllData();
 
    var nSentFiles=[]; var nSentExps=[]; var nSentIds=[];
    sent.forEach(file => nSentFiles.push(normalizeFile(file)));
    sentExps.forEach(exp => nSentExps.push(parseInt(exp.toString())));
    sentIds.forEach(id => nSentIds.push(parseInt(id.toString())));
    const sentData = {files: nSentFiles, expDates: nSentExps, ids: nSentIds};

    var nRecFiles=[]; var nRecExps=[]; var nRecIds=[];
    received.forEach(file => nRecFiles.push(normalizeFile(file)));
    receivedExps.forEach(exp => nRecExps.push(parseInt(exp.toString())));
    receivedIds.forEach(id => nRecIds.push(parseInt(id.toString())));
    const receivedData = {files: nRecFiles, expDates: nRecExps, ids: nRecIds};

    return {
        sent: sentData,
        received: receivedData
    }
}

export { getBasicInfo, getQuotes, getAllFileData }

export {
    getName,
    fission,
    minPin,
    pinRate,
    fileSizeMin,
    numFiles,
    fiatQuote,
    gasQuote,
    normalizeFile,
    getFile,
    getFileIds,
    getFiles,
    getFileExps,
}