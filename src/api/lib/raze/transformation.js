require('dotenv').config();
const fs = require('fs');
const { promises } = require('fs');
const { rmPin, addThenPin, createAndFetch } = require("../utils/ipfs.js");
const { encryptInputs, encryptFile, quickEncrypt, quickDecrypt, unlockZip } = require("./encryption.js");
const { saveNewPin, findPin, updatePinExp, deletePin } = require("./pins.js");
const messageKey = process.env.BC_KEY;

function decomposeFile(chunk, chunkIndex, totalChunks) {
    const chunkIdx = parseInt(chunkIndex);
    const chunkNum = (chunkIdx + 1);
    const chunkTotal = parseInt(totalChunks);
    const percentProgress = (chunkNum / chunkTotal) * 100; 
    const isFirstChunk = (chunkIdx === 0 && chunkNum === 1);
    const isLastChunk = (chunkIdx === (chunkTotal - 1)) && (chunkNum === chunkTotal);

    const chunkData = chunk.split(',')[1];
    const chunkBuffer = (Buffer.from(chunkData, 'base64'));

    const decomposed = {
        idx: chunkIdx,
        num: chunkNum,
        tot: chunkTotal,

        isFirst: isFirstChunk,
        isLast: isLastChunk,

        percent: percentProgress,

        contents: chunkBuffer
    };
    return decomposed;
}

async function uploadEncrypted(fileName, secret) {
    const pathToArchive = await encryptFile(fileName, secret);
    const buffer = await promises.readFile(pathToArchive);
    const pinnedCid = await addThenPin(buffer);
    return pinnedCid;
}

function saveAndValidate(entry, res) {
    const [plain, contract, inputs, secret] = entry;
    const encryptedInputs = encryptInputs(plain, inputs, secret);
    const rehashed = quickEncrypt(encryptedInputs.hash, messageKey);
    // console.log(encryptedInputs); // COMMENT ME BEFORE PROD
    // console.log("plain", plain); // COMMENT ME BEFORE PROD
    // console.log("cipher", encryptedInputs.hash); // COMMENT ME BEFORE PROD
    // console.log("rehashed", rehashed); // COMMENT ME BEFORE PROD
    
    const data = { 
        encryptedInputs: {
            hash: rehashed,
            size: encryptedInputs.size,
            type: encryptedInputs.type,
            name: encryptedInputs.name,
            description: encryptedInputs.description,
            recipient: encryptedInputs.recipient
        }, 
        hash: plain 
    };

    const newPin = { 
        plain: plain, 
        cipher: encryptedInputs.hash, 
        secret: secret,
        contract: contract,
        expDate: (Math.floor(Date.now() / 1000) + 60)
    };
    const pin = saveNewPin(newPin);

    if (pin === null || pin === undefined) res.json("err: failed to save pin/cid");
    else {
        // console.log("Saved!");
        res.json(data);
    }
}

async function unpin(hash, cipher) {
    const unhashed = quickDecrypt(cipher, messageKey);
    const result = await deletePin(unhashed);

    if (result.deletedCount !== 1) return false;
    else return await rmPin(hash);
}

async function updatePin(cipher, expDate) {
    const unhashed = quickDecrypt(cipher, messageKey);
    const result = await updatePinExp(unhashed, expDate);

    const success = (result.modifiedCount === 1);
    return success;
}

async function extractKey(cipher, res) {
    const unhashed = quickDecrypt(cipher, messageKey);
    const pin = await findPin(unhashed);
    if (pin !== null && pin !== undefined) {
        const secret = pin.secret;
        res.json(secret);
    }
    else res.json("err: Pin.findOne @ app.post('/deaddrop/decipher')");
}

async function extractKeys(ciphers, res) {
    var secrets = [];
    for await (const cipher of ciphers) {
        const unhashed = quickDecrypt(cipher, messageKey);
        const pin = await findPin(unhashed);
        if (pin !== null && pin !== undefined) {
            secrets.push(pin.secret);
        }
        else secrets.push("err");
    }
    // console.log(secrets); // COMMENT ME BEFORE PROD
    if (!secrets.includes("err")) res.json(secrets);
    else res.json("err: Pin.findOne @ app.post('/deaddrop/batchDecipher')");
}

async function getFile(cipher, fileName) {
    const unhashed = quickDecrypt(cipher, messageKey);

    const pin = await findPin(unhashed);
    if (pin === null || pin === undefined) return false;

    const cid = pin.plain;
    const secret = pin.secret;

    const pathToZip = `./temp/deaddrop/downloads/${cid}.zip`;
    const exportDir = `./temp/deaddrop/downloads/decrypted/${cid}`;

    const pathToFile = `${exportDir}/${fileName}`;
    if (fs.existsSync(pathToFile)) return cid;
    else if (!(fs.existsSync(pathToZip))) {
        await createAndFetch(cid, pathToZip);
    
        const success = unlockZip(pathToZip, secret, exportDir);
        if (success === true) {
            const files = fs.readdirSync(`${exportDir}`);
            fs.renameSync(`${exportDir}/${files[0]}`, pathToFile);
        }
        
        return cid;
    } else {
        let filePresent = fs.existsSync(pathToFile);
        while (filePresent === false) {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                filePresent = fs.existsSync(pathToFile);
                if (filePresent !== true) throw ("err");
            } catch (err) { console.log("scanning...") }
        }
        return cid;
    }
}


module.exports = { decomposeFile, uploadEncrypted, saveAndValidate, updatePin, unpin, extractKey, extractKeys, getFile };