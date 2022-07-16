const mNodeKey = process.env.MORALIS_KEY;
const aMNodeKey = process.env.ALCHEMY_OPTM_KEY;
const aTNodeKey = process.env.ALCHEMY_OPTT_KEY;


const invalidChain = "unsupported/chainId";
function getProvider(chainId) {
  const isDev = (chainId === 31337 || chainId === 1337);
  // console.log(isDev); // COMMENT ME BEFORE PROD
  if (isDev) return new ethers.providers.JsonRpcProvider();
  else {
    const mRegions = ["speedy-nodes-nyc"];
    const mUrl = `https://${mRegions[0]}.moralis.io/${mNodeKey}/`;
    const aUrl = `g.alchemy.com/v2/`;
    var endpoint;
    switch (chainId) {
      case 1:
        endpoint = mUrl + "eth/mainnet";
	    case 10:
        endpoint = "https://opt-mainnet." + aUrl + aMNodeKey;
      case 3:
        endpoint = mUrl + "eth/ropsten";
      case 4:
        endpoint = mUrl + "eth/rinkeby";
      case 42:
        endpoint = mUrl + "eth/kovan";
      case 420:
        endpoint = mUrl + "eth/goerli";
      case 69:
        endpoint = "https://opt-kovan." + aUrl + aTNodeKey;


      case 42161:
        endpoint = mUrl + "arbitrum/mainnet";
      case 421611:
        endpoint = mUrl + "arbitrum/testnet";


      case 56:
        endpoint = mUrl + "bsc/mainnet";
      case 97:
        endpoint = mUrl + "bsc/testnet";

      case 137:
        endpoint = mUrl + "polygon/mainnet";
      case 80001:
        endpoint = mUrl + "polygon/mumbai";  


      case 43114:
        endpoint = mUrl + "avalanche/mainnet";
      case 43113:
        endpoint = mUrl + "avalanche/testnet";

        
      case 250:
        endpoint = mUrl + "fantom/mainnet";
        

      default:
        endpoint = invalidChain;
    }
    if (endpoint === invalidChain) return endpoint;
    else return new ethers.providers.JsonRpcProvider(endpoint);
  }
}


module.exports = { getProvider }