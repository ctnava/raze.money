const balance = async (signer, logme = false) => {
  const provider = ethers.provider;
  let value = await provider.getBalance(signer.address);
  if (logme) {
    console.log("Balance (wei)", value.toString());
  }
  return value;
};

module.exports = { balance };
