const CryptoJS = require("crypto-js");


function quickEncrypt(data, key) { 
    return CryptoJS.AES.encrypt(data, key).toString() 
}

function quickDecrypt(data, key) { 
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8)
} 


module.exports = { quickEncrypt, quickDecrypt }