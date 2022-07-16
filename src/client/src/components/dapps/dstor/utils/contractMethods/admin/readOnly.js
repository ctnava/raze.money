

async function expDate(contract, encryptedHash) {
    const expirationDate = await contract.expirationDates(encryptedHash);
    return parseInt(expirationDate.toString());
}

async function authAddr(contract, encryptedHash) {
    const authorized = await contract.getAddresses(encryptedHash);
    return authorized;
}