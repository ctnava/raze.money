function routeServices(app) {
    require("./deaddrop/routes.js").routeServices(app);
}


module.exports = {routeServices};