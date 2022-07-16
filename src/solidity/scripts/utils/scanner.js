function scannerUrl(chainId, address) {
    var baseUrl;
    switch (chainId) {
        case 1:
            baseUrl = "https://etherscan.io/address/";
        case 10:
            baseUrl = "https://optimistic.etherscan.io/address/";
        case 3:
            baseUrl = "https://ropsten.etherscan.io/address/";
        case 4:
            baseUrl = "https://rinkeby.etherscan.io/address/";
        case 42:
            baseUrl = "https://kovan.etherscan.io/address/";
        case 420:
            baseUrl = "https://goerli.etherscan.io/address/";
        case 69:
            baseUrl = "https://kovan-optimistic.etherscan.io/address/";
        case 42161:
            baseUrl = "https://arbiscan.io/address/";
        case 421611:
            baseUrl = "https://testnet.arbiscan.io/address/";


        case 56:
            baseUrl = "https://bscscan.com/address/";
        case 97:
            baseUrl = "https://testnet.bscscan.com/address/";


        case 137:
            baseUrl = "https://polygonscan.com/address/";
        case 8001:
            baseUrl = "https://mumbai.polygonscan.com/";


        case 43114:
            baseUrl = "https://snowtrace.io/address/";
        case 43113:
            baseUrl = "https://testnet.snowtrace.io/address/";


        case 250:
            baseUrl = "https://ftmscan.com/address/";
        case 4002: // unsupported
            baseUrl = "https://testnet.ftmscan.com/address/";


        case 128: // unsupported
            baseUrl = "https://hecoinfo.com/address/";
        case 256: // unsupported
            baseUrl = "https://testnet.hecoinfo.com/address/";


        case 1284: // unsupported
            baseUrl = "https://moonscan.io/address/";
        case 1285: // unsupported
            baseUrl = "https://moonriver.moonscan.io/address/";
        case 1287: // unsupported
            baseUrl = "https://moonbase.moonscan.io/address/";

            
        case 199: // unsupported
            baseUrl = "https://bttcscan.com/address/";
        case 1029: // unsupported
            baseUrl = "https://testnet.bttcscan.com/address/";
        

        case 25: // unsupported
            baseUrl = "https://cronoscan.com/address/";
        // case X: // unsupported
            // baseUrl = "";


        case 70: // unsupported
            baseUrl = "https://hooscan.com/address/";
        // case X: // unsupported
            // baseUrl = "";


        case 100: // unsupported
            baseUrl = "https://blockscout.com/xdai/mainnet/address/";
        // case X: // unsupported
            // baseUrl = "";


        case 1666600000: // unsupported Shard0
            baseUrl = "https://explorer.harmony.one/address/";
        case 1666700000: // unsupported Shard0
            baseUrl = "https://explorer.testnet.harmony.one/address/";

            
        default:
            baseUrl = "https://blockscan.com/address/";
    }
    return baseUrl + address;
}


module.exports.default = scannerUrl;