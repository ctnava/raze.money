(()=> {
    console.log("\nCONFIGURED NETWORKS:");
    Object.keys(require('hardhat').userConfig.networks)
    .forEach(network => {console.log(`- ${network}`)});
    console.log();
})();