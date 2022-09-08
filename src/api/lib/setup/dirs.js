const fs = require('fs');


function initTempDirs() {
    if (!fs.existsSync("./temp/deaddrop/uploads/encrypted/active")) { 
        fs.mkdirSync("./temp/deaddrop/uploads/encrypted/active", { recursive: true }) 
    }

    if (!fs.existsSync("./temp/deaddrop/downloads/decrypted")) { 
        fs.mkdirSync("./temp/deaddrop/downloads/decrypted", { recursive: true }) 
    }
}


module.exports = { initTempDirs }