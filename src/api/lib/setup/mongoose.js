require('dotenv').config();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const url = process.env.DB_URL;
const key = process.env.DB_KEY;
function connectDatabase() {
  mongoose.connect(url, { keepAlive: true, keepAliveInitialDelay: 300000 })
  .then(() => {
    console.log("Database Connection Established!");
  })
  .catch(async (err) => {
    console.log(err);
    await new Promise(resolve => setTimeout(resolve, 5000));
    connectDatabase();
  });
}


const pinSchema = new mongoose.Schema({
  plain: { type: String, required: true },
  cipher: { type: String, required: true },
  secret: { type: String, required: true }, // decryption
  contract: { type: String, required: true }, // contractInteraction
  expDate: { type: Number, required: true } // sweeps
});
pinSchema.plugin(encrypt, { secret: key, encryptedFields: ["secret"] });
const Pin = mongoose.model("pin", pinSchema);


module.exports = { connectDatabase, Pin }