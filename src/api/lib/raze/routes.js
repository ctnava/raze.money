require("dotenv").config();
const fs = require("fs");
const {
  Contract,
  loadContract,
  verifySignature,
  signerAddress,
} = require("../utils/blockchain.js");

function routeServices(app) {
  app.get("/records", (req, res) => {
    const RazeMoney = loadContract(req.body.chainId, "RazeMoney");
    res.json("ok");
  });

  app.get("/router", (req, res) => {
    const RazeRouter = loadContract(req.body.chainId, "RazeRouter");
    res.json("ok");
  });
}

module.exports = { routeServices };
