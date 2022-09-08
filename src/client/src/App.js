import { Navbar } from './components/Navbar'
import { RazeViewer } from './components/RazeViewer'

import {
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi'

//import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

//const alchemyId = process.env.ALCHEMY_ID

// Configure chains & providers with the Alchemy provider.
// TODO: set chain to polygon main?
const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  // TODO: set provider key
  // alchemyProvider({ alchemyId }),
  publicProvider(),
])

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'raze.money',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

// Pass client to React Context Provider
export default function App() {
  return (
    <WagmiConfig client={client}>
      <div className='bg-raze-gray'>
      <Navbar />
      <div className='flex justify-center w-screen'>
        <div className='w-full max-w-4xl p-4'>
          <RazeViewer />
        </div>
      </div>
      </div>
    </WagmiConfig>
  )
}
