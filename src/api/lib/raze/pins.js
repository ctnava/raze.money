const { Pin } = require("../setup/mongoose.js");

function saveNewPin(newPin) {
    const pin = new Pin(newPin);
    const savedPin = pin.save();
    return savedPin;
}

async function findPin(unhashed) {
  const pin = await Pin.findOne({cipher: unhashed});
  return pin;
}

async function findAllPins() {
    const allPins = await Pin.find({});
    return allPins;
}

async function extractSecret(unhashed) {
    const pin = await findPin(unhashed);
    return pin.secret;
}

async function updatePinExp(unhashed, expDate) {
    const result = await Pin.updateOne({ cipher: unhashed}, { $set: {expDate:expDate} });
    // console.log("Pin.updateOne", result);
    return result;
}

async function deletePin(unhashed) {
    const result = await Pin.deleteOne({cipher: unhashed});
    // console.log("Pin.deleteOne", result);
    return result;
}

async function deleteExpiredPins() {
    const now = Math.floor(Date.now() / 1000);
    const expiredPins = await Pin.find({ expDate: { $lte: now } });
    console.log("expiredPins:", expiredPins.length);

    const result = await Pin.deleteMany({ expDate: { $lte: now } });
    // console.log("deleteMany", result);

    const successfulDeletion = (expiredPins.length === result.deletedCount);
    const noDeletions = (result.deletedCount === 0);
    return [successfulDeletion, noDeletions];
}

module.exports = { 
    saveNewPin, 
    findPin,
    findAllPins,
    extractSecret,
    updatePinExp,
    deletePin,
    deleteExpiredPins
};