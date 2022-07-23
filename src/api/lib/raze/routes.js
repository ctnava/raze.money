require("dotenv").config();
const fs = require("fs");
// const { uploadPaths, uploadedPaths } = require("./dirs.js");
// const { uploadLabels, uploadedLabels } = require("./labels.js");
const {
  verifyMessage,
  verifyMessages,
  getCachedContract,
} = require("./blockchain.js");

// const { deleteFiles } = require("./cleanup.js");
// const { garble, quickDecrypt } = require("../utils/encryption");
// const { performSweep } = require("./cleanup.js");
// const messageKey = process.env.BC_KEY;

// const {
//   decomposeFile,
//   uploadEncrypted,
//   saveAndValidate,
//   updatePin,
//   unpin,
//   extractKey,
//   extractKeys,
//   getFile
// } = require("./transformation.js");
// const { findPin } = require("./pins.js");

function routeServices(app) {
  app.get("/records", (req, res) => {
    res.json("ok");
  });

  app.get("/router", (req, res) => {
    res.json("ok");
  });
}

module.exports = { routeServices };
