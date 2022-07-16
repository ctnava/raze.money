require('dotenv').config();
const app = require("./lib/setup/all.js").initApp();
require("./lib/routes.js").routeServices(app);


const welcomeMessage = "This is my backend, the only reason to be here is to try to crack my security.";
const dappUrl = process.env.CLIENT_URL;
app.get("/", (req, res)=>{res.json({welcomeMessage, dappUrl})});