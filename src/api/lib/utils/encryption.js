const unlockZip = require("./encryption/chilkat.js");
const garble = require("./encryption/garble.js");
const { quickEncrypt, quickDecrypt } = require("./encryption/strings.js");
module.exports = { garble, quickEncrypt, quickDecrypt, unlockZip };