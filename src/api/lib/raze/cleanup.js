const fs = require('fs');
const { uploadedPaths } = require("./dirs.js");
const { uploadedLabels, isTemp } = require("./labels.js");
const { getAllPinsExcept, rmPins } = require("../utils/ipfs.js");
const { findAllPins, deleteExpiredPins } = require('./pins.js');

function deleteFiles(fileName, route, res) {
  console.log("Deletion requested...");
  if (fileName === undefined) res.json(`err: fileName undefined @ app.delete('/deaddrop/${route}')`);
  // file, trash, zip
  const pathTo = uploadedPaths(uploadedLabels(fileName));

  if (fs.existsSync(pathTo.file)) fs.unlinkSync(pathTo.file);
  
  if (!isTemp(fileName)) {
    if (fs.existsSync(pathTo.trash)) fs.unlinkSync(pathTo.trash);
    if (fs.existsSync(pathTo.zip)) fs.unlinkSync(pathTo.zip);
  }

  const allDeleted = (
    !fs.existsSync(pathTo.file) && 
    !fs.existsSync(pathTo.trash) && 
    !fs.existsSync(pathTo.zip)
  );

  const response = !allDeleted ? "failed/deletion" : "success";
  res.json(response);
}


const pathToUploads = "./temp/deaddrop/uploads";
const pathToDownloads = "./temp/deaddrop/downloads";
function sweepFiles() {
    const withEnc = fs.readdirSync(pathToUploads);
    const uploads = withEnc.filter(e => {return (e != 'encrypted')});
    // console.log(uploads);
    uploads.forEach(file => {
        try {
            const pathToFile = `${pathToUploads}/${file}`;
            const stats = fs.statSync(pathToFile);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            const isExpired = (file.slice(0,4) === 'tmp_' && seconds > 5) || 
            (file.slice(file.indexOf("."), file.length - 1) === 'trash' && seconds > 60) || 
            (seconds > 300);
            if (isExpired) fs.unlinkSync(pathToFile);
        } catch(err) {console.log(err)}
    });

    const withActive = fs.readdirSync(`${pathToUploads}/encrypted`);
    const encrypted = withActive.filter(e => {return (e != 'active')});
    // console.log(encrypted);
    encrypted.forEach(file => {
        try {
            const pathToFile = `${pathToUploads}/encrypted/${file}`;
            const stats = fs.statSync(pathToFile);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            if (seconds > 60) fs.unlinkSync(pathToFile);
        } catch(err) {console.log(err)}
    });

    const withDec = fs.readdirSync(pathToDownloads);
    const downloads = withDec.filter(e => {return e != 'decrypted'});
    // console.log(uploads);
    downloads.forEach(file => {
        try {
            const pathToFile = `${pathToDownloads}/${file}`;
            const stats = fs.statSync(pathToFile);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            const isExpired = (seconds > 5);
            if (isExpired) fs.unlinkSync(pathToFile);
        } catch(err) {console.log(err)}
    });

    const decrypted = fs.readdirSync(`${pathToDownloads}/decrypted`);
    // console.log(decrypted);
    decrypted.forEach(file => {
        try {
            const pathToFile = `${pathToDownloads}/decrypted/${file}`;
            const stats = fs.statSync(pathToFile);
            // console.log(stats.mtime);
            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            if (seconds > 900) fs.rmSync(pathToFile, {recursive: true});
        } catch(err) {console.log(err)}
    });
}

async function sweepDB() {
    console.log("Sweeping DB...");
    const [successfulDeletion, noDeletions] = await deleteExpiredPins();
    if (successfulDeletion === false) return false;
    console.log("Successful DB Sweep!");
    if (successfulDeletion === true && noDeletions === true) return true;

    console.log("Sweeping Pins...");
    const remainingPins = await findAllPins();
    console.log("remainingPins", remainingPins.length);

    const remotePins = await getAllPinsExcept('indirect');
    console.log("unmatchedPins:", remotePins.length - remainingPins.length);

    var toKeep = [];
    remainingPins.forEach(entry => {toKeep.push(entry.plain)});
    console.log("keeping:", toKeep.length);

    var toRemove = [];
    remotePins.forEach(pin => {
        if (!toKeep.includes(pin)) toRemove.push(pin)
    });
    console.log("removing:", toRemove.length);

    const successfulRemoval = await rmPins(toRemove);
    return successfulRemoval;
}

async function performSweep() {
    sweepFiles();
    const success = await sweepDB();
    return success;
}


module.exports = { deleteFiles, performSweep }