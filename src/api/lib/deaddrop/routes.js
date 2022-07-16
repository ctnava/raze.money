require('dotenv').config();
const fs = require('fs');
const { uploadPaths, uploadedPaths } = require("./dirs.js");
const { uploadLabels, uploadedLabels } = require("./labels.js");
const { verifyMessage, verifyMessages, getCachedContract } = require("./blockchain.js");

const { deleteFiles } = require("./cleanup.js");
const { garble, quickDecrypt } = require("../utils/encryption");
const { performSweep } = require("./cleanup.js");
const messageKey = process.env.BC_KEY;

const { 
  decomposeFile, 
  uploadEncrypted, 
  saveAndValidate, 
  updatePin, 
  unpin, 
  extractKey, 
  extractKeys,
  getFile 
} = require("./deadDrop.js");
const { findPin } = require("./pins.js");


function serviceRoutes(app) {
    app.route('/deaddrop/upload')
    .post((req, res) => {
        const { ext, chunk, chunkIndex, totalChunks } = JSON.parse(req.body.toString());
        // idx, num, tot, isFirst, isLast, percent, contents
        const dataChunk = decomposeFile(chunk, chunkIndex, totalChunks);
        // console.log(`Getting Chunk ${dataChunk.num} of ${dataChunk.total} || ${dataChunk.percent}%`);

        // tmp, prev, trash, zip
        const nameFor = uploadLabels(ext, req.ip, totalChunks); 
        const pathTo = uploadPaths(nameFor);
        
        const shouldDelete = (dataChunk.isFirst && fs.existsSync(pathTo.tmp));
        if (shouldDelete === true) fs.unlinkSync(pathTo.tmp);
        fs.appendFileSync(pathTo.tmp, dataChunk.contents);

        if (dataChunk.isLast) {
        fs.renameSync(pathTo.tmp, pathTo.prev);
        res.json({finalName: nameFor.prev});
        } else res.json({tmpName: nameFor.tmp});
    }).delete((req, res) => { deleteFiles(req.body.fileName, "upload", res) });


    app.route('/deaddrop/pin')
    .post((req, res) => {
        const { fileName, contractMetadata, contractInput } = req.body;
        const nameOf = uploadedLabels(fileName);
        const pathTo = uploadedPaths(nameOf);
        const secret = garble(127);
        // console.log("secret", secret); // COMMENT ME BEFORE PROD
        uploadEncrypted(fileName, secret).then(cid => {
        if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
        if (fs.existsSync(pathTo.file)) fs.unlinkSync(pathTo.file);
        const entry = [cid, JSON.stringify(contractMetadata), contractInput, secret];
        saveAndValidate(entry, res);
        });
    })
    .patch((req, res) => {
        const { contractMetadata, hash, cipher } = req.body;
        // console.log(contractMetadata);
        if (contractMetadata !== null && contractMetadata !== undefined &&
            hash !== null && hash !== undefined &&
            cipher !== null && cipher !== undefined) {
            getCachedContract(cipher)
            .then(contract => {
                if (contract === "unsupported/chainId") res.json("err: bad addr/chainId @ app.patch('/deaddrop/pin')");
                else {
                    contract.expirationDates(cipher)
                    .then(rawExpDate => {
                        if (parseInt(rawExpDate.toString()) === 0) {
                            findPin(quickDecrypt(cipher, messageKey))
                            .then(pin => {
                                const now = Math.floor(Date.now() / 1000);
                                const remainder = pin.expDate - now;
                                if (remainder < 60 && remainder > 0) {
                                    updatePin(cipher, (pin.expDate + 900))
                                    .then(success => {
                                        if (success === true) res.json("success");
                                        else res.json("err: updatePin @ app.patch('/deaddrop/pin')");
                                    });
                                } else res.json("err: already extended @ app.patch('/deaddrop/pin')");
                            });
                        } else res.json("err: cannot extend existing pin @ app.patch('/deaddrop/pin')");
                    });
                } 
            });
        } else res.json("err: empty cipher @ app.patch('/deaddrop/pin')");
    })
    .delete((req, res) => {
        const { hash, cipher } = req.body;
        // console.log(req.body);
        unpin(hash, cipher).then(success => {
        if (success === true) res.json("success");
        else res.json("err: unpin @ app.delete('/deaddrop/pin')");
        });
    });


    app.route('/deaddrop/transaction')
    .post((req, res) => {
        const { hash, cipher } = req.body;
        getCachedContract(cipher)
        .then(contract => {
            if (contract === "unsupported/chainId") res.json("err: bad addr/chainId @ app.post('/deaddrop/transaction')");
            else {
                contract.expirationDates(cipher).then(rawExpDate => {
                    const expDate = parseInt(rawExpDate.toString());
                    if (expDate === 0) { 
                    unpin(hash, cipher).then(success => {
                        if (success === true) res.json("err: failure to pay");
                        else res.json("err: unpin @ app.post('/deaddrop/transaction')");
                    });
                    } else {
                    updatePin(cipher, expDate).then(success => {
                        if (success === true) res.json("success");
                        else res.json("err: updatePin @ app.post('/deaddrop/transaction')");
                    });
                    }
                });
            }
        });
    })
    .patch((req, res) => {
        const { cipher } = req.body;
        getCachedContract(cipher)
        .then(contract => {
            if (contract === "unsupported/chainId") res.json("err: bad addr @ app.patch('/deaddrop/transaction')");
            else {
                contract.expirationDates(cipher)
                .then(rawExpDate => {
                    const expDate = parseInt(rawExpDate.toString());
                    if (expDate !== 0) {
                    // console.log(expDate);
                    updatePin(cipher, expDate).then(success => {
                        if (success === true) res.json("success");
                        else res.json("err: updatePin @ app.patch('/deaddrop/transaction')");
                    });
                    }
                });
            }
        });
    });


    app.post('/deaddrop/decipher', (req, res) => {
        const { cipher, signature } = req.body;
        // console.log(req.body);
        if (cipher !== undefined && cipher !== null
        && signature !== undefined && signature !== null) {
            verifyMessage(cipher, signature).then((verdict) => {
            if (verdict === true) {
                extractKey(cipher, res);
            } else res.json("err: signature failure @ app.post('/deaddrop/decipher')");
            });
        } else res.json("err: empty cipher @ app.post('/deaddrop/decipher')");
    });


    app.post('/deaddrop/batchDecipher', (req, res) => {
        const { ciphers, signature } = req.body;
        // console.log(req.body);
        if (ciphers !== undefined && ciphers !== null
        && signature !== undefined && signature !== null) {
            verifyMessages(ciphers, signature).then((verdict) => {
            if (verdict === true) {
                extractKeys(ciphers, res);
            } else res.json("err: signature failure @ app.post('/deaddrop/batchDecipher')");
            });
        } else res.json("err: empty cipher @ app.post('/deaddrop/batchDecipher')");
    });


    app.route('/deaddrop/download')
    .post((req, res) => {
        const { cipher, signature, fileName } = req.body;
        // console.log(req.body);
        const emptyInputs = (cipher === undefined || cipher === null) ||
        (signature === undefined || signature === null) ||
        (fileName === 'undefined.undefined' || fileName === undefined || fileName === null);
        if (emptyInputs) res.json("err: empty cipher @ app.post('/deaddrop/download')");
        else {
            verifyMessage(cipher, signature).then((verdict) => {
                if (verdict !== true) res.json("err: signature failure @ app.post('/deaddrop/download')");
                else {
                getFile(cipher, fileName).then(cid => {
                    if (cid !== false) res.status(200).json(`${cid}`);
                    else res.json("err: Pin.findOne @ app.post('/deaddrop/download')");
                });
                }
            });
        }
    })
    .delete((req, res) => {
        const { cid } = req.body;
        try {
            fs.rmSync(`./temp/deaddrop/downloads/decrypted/${cid}`, { recursive: true });
            res.json("success");
        } catch (err) { res.json(err) }
    });
}


function maintainenceRoutes(app) {
    var activeSweep = false; 
    app.post("/deaddrop/sweep", (req, res) => {
        if (activeSweep === true) res.json('err: already active');
        else {
            activeSweep = true;
            performSweep()
            .then((success) => {
                activeSweep = false;
                if (success === true) res.json("success");
                else res.json("err: searchDB @ app.post('/deaddrop/sweep')"); 
            });
        }
    });
}


function routeServices(app) {
    serviceRoutes(app);
    maintainenceRoutes(app);
}


module.exports = { routeServices }