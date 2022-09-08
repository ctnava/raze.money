# raze.money

## *L3gendary DAO has formed a product team and built its first product - RAZE!*

### Mission Statement
[RAZE](http://raze.money/) is a decentralized fundraising platform, created by [L3gendary DAO](https://www.legendary.lgbt/), that assists with the delivery of liquidity of those who need it most and awards personalized impact certificate NFTs to contributors. Marginalized communities have come to rely on crowdfunding platforms, such as GoFundMe, for the individualized financing of needs, such as: medical treatment, legal consultation, and small ventures like start-ups or collectives. We aim to broaden this reach with DeFi, through Web3, in order to introduce a transparent, grassroots alternative.

Anyone can start a fundraiser and share it with anyone, anywhere and verification (designated by the presence of our signature green gem) is completely optional. However, the featured section of our platform is exclusively reserved for verified campaigns. By allowing unverified campaigns, we are extending our reach to countries where LGBTQA+ activities have been made illegal.

### NOTICE
POWERSHELL INSTALLATION REQUIRED
for more details, refer to readme files in the individual project "root" folders under "./src"

### Mandatory .env values
```
# Client
API_URL=https://api.legendary.lgbt/


# IPFS @ https://infura.io/
PORT=4001
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_PROJECT_ID=YOUR_OWN
IPFS_PROJECT_SECRET=YOUR_OWN

# PINATA_PUBLIC=NOT_YET_IMPLEMENTED
# PINATA_PRIVATE=NOT_YET_IMPLEMENTED
# PINATA_JWT=NOT_YET_IMPLEMENTED

# API @ https://cloud.mongodb.com/
CLIENT_URL=http://localhost:4002
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

### Deployment Instructions
#### Step 1: Contract Deployment
to boot up local blockchain & deploy to localhost
```
yarn sim 
yarn deploy 
```
#### Step 2: API Deployment
to launch the api
```
yarn api 
```
#### Step 3: Client Deployment
to launch the dapp client 
```
yarn client 
```
THEN
```
y
```


### Utils
to show configured hardhat networks
```
yarn networks
```
to remove useless artifacts (heroku predeploy)
```
yarn clean
```