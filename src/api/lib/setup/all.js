function initApp() {
    require('archiver').registerFormat('zip-encrypted', require("archiver-zip-encrypted"));
    require("./dirs.js").initTempDirs();
    require("../setup/mongoose.js").connectDatabase(); 
    const app = require("./app.js").configureApp();
    return app;
}


module.exports = { initApp }