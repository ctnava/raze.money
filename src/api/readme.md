## HEROKU DEPLOYMENT
Required changes for successful deployment
### New App?
Change package.json 
```
rename
"@chilkat/ck-node16-win64" to "@chilkat/ck-node16-linux64"

change sitRep @ app.post("/report") in ("./lib/routes").maintenanceRoutes
to 
{ 
    port: process.env.PORT,
    ipfs: version
} 
```
## Mandatory .env values
``` 
PORT=4001
# API
# - https://deaddrop-api-alpha.herokuapp.com/       # Devel
# - https://deaddrop-api-beta.herokuapp.com/        # Public Testing
# - https://deaddrop-alpha.herokuapp.com/           # Production
API_URL=https://deaddrop-api-alpha.herokuapp.com/

# Client
# - https://deaddrop-dapp-alpha.herokuapp.com       # Devel
# - https://deaddrop-dapp-beta.herokuapp.com        # Public Testing
# - https://deaddrop-dapp.herokuapp.com             # Production
CLIENT_URL=https://deaddrop-dapp-alpha.herokuapp.com


# IPFS @ https://infura.io/
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https 
IPFS_PROJECT_ID=YOUR_OWN
IPFS_PROJECT_SECRET=YOUR_OWN
# PINATA_PUBLIC=NOT_YET_IMPLEMENTED
# PINATA_PRIVATE=NOT_YET_IMPLEMENTED 
# PINATA_JWT=NOT_YET_IMPLEMENTED


# DB @ https://cloud.mongodb.com/ 
DB_URL=mongodb+srv://<USERNAME>:<PASSWORD>@<YOUR_CLUSTER>.6vpdm.mongodb.net/deadDropDB?retryWrites=true&w=majority 
DB_KEY=YOUR_OWN # decrypt secrets
BC_KEY=YOUR_OWN # decrypt the double encrypted hash stored on chain


# Web3 @ https://moralis.io/ & https://dashboard.alchemyapi.io/apps
MORALIS_KEY=YOUR_OWN 
ALCHEMY_OPTM_KEY=YOUR_OWN # Optimism Mainnet
ALCHEMY_OPTT_KEY=YOUR_OWN # Optimism Testnet


# Wallet
MAINNET_KEY=YOUR_OWN
```
 