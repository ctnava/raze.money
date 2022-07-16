const fs = require('fs');
const archiver = require('archiver');
const { garble, quickEncrypt, quickDecrypt, unlockZip } = require("../utils/encryption.js");

function encryptInputs(cid, contractInput, key) {
    const encryptedInputs = {
      hash: quickEncrypt(cid, key),
      size: contractInput.size,
      type: quickEncrypt(contractInput.type, key),
      name: quickEncrypt(contractInput.name, key),
      description: quickEncrypt(contractInput.description, key),
      recipient: contractInput.recipient
    };
    return encryptedInputs;
}

async function encryptFile(fileName, key) {
    const noExt = fileName.split(".")[0];
    const pathToFile = `./temp/deaddrop/uploads/${fileName}`;
    const pathToGarbage = `./temp/deaddrop/uploads/${noExt}.trash`;
    const pathToArchive = `./temp/deaddrop/uploads/encrypted/${noExt}.zip`
  
    const garbage = garble(127);
    if (fs.existsSync(pathToGarbage)) fs.unlinkSync(pathToGarbage);
    fs.writeFileSync(pathToGarbage, garbage);
  
    const prepareArchive = () => new Promise((resolve) => {
      const archiveConfig = {
        zlib: {level: 8}, 
        encryptionMethod: 'aes256', 
        password: key
      };
      var archive = archiver.create('zip-encrypted', archiveConfig);
      var output = fs.createWriteStream(pathToArchive);
      
      output
        .on('close', () => {console.log(`OUTPUT: wrote ${archive.pointer()} total bytes`); resolve();})
        .on('end', () => {console.log('OUTPUT: data drained\nfinalized and outFile descriptor closed.')});
  
      archive
        .on('warning', (err) => { if (err.code === 'ENOENT') console.log(err); else throw err; })
        .on('error', (err) => { throw err })
        .on('drain', () => {console.log('ARCHIVE: drained adding a file to zip')})
        // .on('data', () => {console.log('ARCHIVE: on data')})
        // .on('entry', () => {console.log('ARCHIVE: on entry')})
        .on('close', () => {console.log('ARCHIVE: archive closed')})
        .on('end', () => {console.log('ARCHIVE: archive ended')})
        .on('finish', () => {console.log('ARCHIVE: archive finished')});
  
      archive.pipe(output);
  
      archive  
        .file(pathToFile, { name: noExt })
        .file(pathToGarbage, { name: "garbage.trash" });
        
      archive.finalize();
    });
    await prepareArchive();
    return pathToArchive;
}


module.exports = { 
  encryptInputs, encryptFile, 
  
  garble, quickEncrypt, quickDecrypt, unlockZip 
}