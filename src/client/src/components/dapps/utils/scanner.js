function scannerUrl(chainId, address) {
    // console.log("@scanner: address", address, typeof address);
    // console.log("@scanner: chainId", chainId, typeof chainId);
    switch (chainId) {
        case 1:
            return `https://etherscan.io/address/${address}`;
        case 10:
            return `https://optimistic.etherscan.io/address/${address}`;
        case 3:
            return `https://ropsten.etherscan.io/address/${address}`;
        case 4:
            return `https://rinkeby.etherscan.io/address/${address}`;
        case 42:
            return `https://kovan.etherscan.io/address/${address}`;
        case 420:
            return `https://goerli.etherscan.io/address/${address}`;
        case 69:
            return `https://kovan-optimistic.etherscan.io/address/${address}`;


        case 56:
            return `https://bscscan.com/address/${address}`;
        case 97:
            return `https://testnet.bscscan.com/address/${address}`;


        case 137:
            return `https://polygonscan.com/address/${address}`;
        case 80001:
            return `https://mumbai.polygonscan.com/address/${address}`;


        case 42161:
            return `https://arbiscan.io/address/${address}`;
        case 421611:
            return `https://testnet.arbiscan.io/address/${address}`;


        case 43114:
            return `https://snowtrace.io/address/${address}`;
        case 43113:
            return `https://testnet.snowtrace.io/address/${address}`;


        case 250:
            return `https://ftmscan.com/address/${address}`;
        case 4002: // unsupported
            return `https://testnet.ftmscan.com/address/${address}`;


        case 128: // unsupported
            return `https://hecoinfo.com/address/${address}`;
        case 256: // unsupported
            return `https://testnet.hecoinfo.com/address/${address}`;


        case 1284: // unsupported
            return `https://moonscan.io/address/${address}`;
        case 1285: // unsupported
            return `https://moonriver.moonscan.io/address/${address}`;
        case 1287: // unsupported
            return `https://moonbase.moonscan.io/address/${address}`;

            
        case 199: // unsupported
            return `https://bttcscan.com/address/${address}`;
        case 1029: // unsupported
            return `https://testnet.bttcscan.com/address/${address}`;
        

        case 25: // unsupported
            return `https://cronoscan.com/address/${address}`;
        // case 26: // unsupported on blockscan
            // return `https://testnet.cronoscan.com/address/${address}`;


        case 70: // unsupported
            return `https://hooscan.com/address/${address}`;
        // case 71: // unsupported on blockscan
            // return `https://testnet.hooscan.com/address/${address}`;


        default:
            return `https://blockscan.com/address/${address}`;
    }
}


export default scannerUrl;