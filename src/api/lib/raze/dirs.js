const uploadPath = (fileName) => { return `./temp/deaddrop/uploads/${fileName}` }
const encryptedPath = (fileName) => { return `./temp/deaddrop/uploads/encrypted/${fileName}` }

function uploadPaths(fileNames) {
    const temp = uploadPath(fileNames.tmp);
    const preview = uploadPath(fileNames.prev);
    const garbage = uploadPath(fileNames.trash);
    const archive = encryptedPath(fileNames.zip);

    const allPaths = {
        tmp: temp,
        prev: preview,
        trash: garbage,
        zip: archive
    };
    
    // console.log(allPaths);
    return allPaths;
}

function uploadedPaths(fileNames) {
    const filePath = uploadPath(fileNames.file);
    const garbage = uploadPath(fileNames.trash);
    const archive = encryptedPath(fileNames.zip);

    const allPaths = {
        file: filePath,
        trash: garbage,
        zip: archive,
    };

    // console.log(allPaths);
    return allPaths;
}


module.exports = { uploadPaths, uploadedPaths }