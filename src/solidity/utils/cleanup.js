(() => {
    const fs = require('fs');

    const paths = [
        "./.DS_Store", "./node_modules", "./package-lock.json", "./npm-debug.log",
        "./yarn.lock", "./yarn-debug.log", "./yarn-error.log", "./.pnp", "./.pnp.js",
        "./data/1337", "./data/31337",
        "./typechain", "./artifacts", "./cache", "./coverage", "./coverage.json"
    ];
    
    function removeFileOrDirectory(path) {
        const index = paths.indexOf(path);
        if (index === 0) console.log("\nBeginning cleanup operation...\n");
    
        if(fs.existsSync(path)) {
            const parts = path.split('/');
            const repo = parts[1] === "src" ? parts[2] : "project root";
            const fod = parts[parts.length - 1];
            const isDir = (fs.lstatSync(path)).isDirectory();
            console.log(`\nRemoved: ${fod} ${isDir?"folder ":""}from ${repo}`);
            if (!isDir) fs.rmSync(path);
            else fs.rmSync(path, { recursive: true });
        }
    
        if (index === paths.length - 1) console.log("\n\nCleanup complete!\n");
    }

    paths.forEach(path => {removeFileOrDirectory(path)})
})();