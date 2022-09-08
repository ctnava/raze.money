var os = require('os');
const fs = require('fs');
var chilkat;
if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        chilkat = require('@chilkat/ck-node16-win-ia32');
    } else {
        chilkat = require('@chilkat/ck-node16-win64'); 
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        chilkat = require('@chilkat/ck-node16-arm');
    } else if (os.arch() == 'x86') {
        chilkat = require('@chilkat/ck-node16-linux32');
    } else {
        chilkat = require('@chilkat/ck-node16-linux64');
    }
} else if (os.platform() == 'darwin') {
    chilkat = require('@chilkat/ck-node16-macosx');
}


function unlockZip(pathToArchive, secret, exportDir) {
    var zip = new chilkat.Zip();
    var success = zip.OpenZip(pathToArchive);
    // console.log("open zip");
    if (success !== true) { 
        zip.CloseZip();
        console.log(zip.LastErrorText);
        return false;
    }

    zip.DecryptPassword = secret;
    var unzipCount;
    unzipCount = zip.Unzip(exportDir);
    // console.log("un zip");
    zip.CloseZip();
    fs.unlinkSync(pathToArchive);
    fs.unlinkSync(exportDir + "/garbage.trash");
    if (unzipCount < 0) {
        console.log(zip.LastErrorText);
        return false;
    }
    else return true;
}


module.exports = unlockZip;