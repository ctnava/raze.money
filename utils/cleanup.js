function rootPaths(entry) {return [`./${entry}`, `./src/solidity/${entry}`, `./src/api/${entry}`, `./src/client/${entry}`]}
function devNetPaths(entry) {return [`./${entry}`, `./src/solidity/${entry}`, `./src/api/${entry}`, `./src/client/src/${entry}`]}
function sharedPaths(entry, repo) {return [`./${entry}`, `./src/${repo}/${entry}`]}
function unsharedPath(entry, repo) {return `./src/${repo}/${entry}`}
function solidityTrash(entry) {return unsharedPath(entry, "solidity")}

const commonTrash = [
    ...rootPaths(".DS_Store"),
    ...rootPaths("node_modules"),
    ...rootPaths("package-lock.json"),
    ...rootPaths("npm-debug.log"),
    ...rootPaths("yarn.lock"),
    ...rootPaths("yarn-debug.log"),
    ...rootPaths("yarn-error.log"),
    ...rootPaths(".pnp"),
    ...rootPaths(".pnp.js"),
    ...devNetPaths("data/1337"),
    ...devNetPaths("data/31337")
];

const semiExclusiveTrash = [
    ...sharedPaths("build", "client"),
    ...sharedPaths("typechain", "solidity"),
    ...sharedPaths("temp", "api")
];

const exclusiveTrash = [
    solidityTrash("artifacts"),
    solidityTrash("cache"),
    solidityTrash("coverage"),
    solidityTrash("coverage.json")
];

const paths = [
    ...commonTrash,
    ...semiExclusiveTrash,
    ...exclusiveTrash
];


const fs = require('fs');
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


(() => {paths.forEach(path => {removeFileOrDirectory(path)})})();