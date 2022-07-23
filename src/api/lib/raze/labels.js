const md5 = require('md5');


function addExt(fileName, ext) { return `${fileName}.${ext}` }
function rmExt(fileName) { return fileName.split(".")[0] }

function tempLabel(ext, string1, string2) { 
    const noExt = 'tmp_' + md5(string1 + string2);
    const temp = addExt(noExt, ext);
    return { label: temp };
}

function cachedLabel(ext, string1) {
    const string2 = Date.now();
    const noExt = md5(string1 + string2);
    const preview = addExt(noExt, ext);
    const garbage = addExt(noExt, "trash");
    const archive = addExt(noExt, "zip")
    return { preview: preview, garbage: garbage, archive: archive };
}

function uploadLabels(ext, string1, string2) {
    const temp = tempLabel(ext, string1, string2);
    const cached = cachedLabel(ext, string1);

    const allLabels = { 
        tmp: temp.label, 
        prev: cached.preview, 
        trash: cached.garbage, 
        zip: cached.archive 
    };
    
    // console.log(allLabels);
    return allLabels;
}

function uploadedLabels(fileName) {
    const raw = rmExt(fileName);
    const garbage = addExt(raw, "trash");
    const archive = addExt(raw, "zip");

    const allLabels = {
        file: fileName,
        trash: garbage,
        zip: archive
    };

    // console.log(allLabels);
    return allLabels;
}

function isTemp(fileName) { return (fileName.slice(0, 4) === "tmp_") }

module.exports = { rmExt, uploadLabels, uploadedLabels, isTemp }