import { useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
} from 'wagmi'
import { Dialog } from '@headlessui/react'

export function ConnectButton() {
  const { address, connector, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  
  const [ showConnectors, setShowConnectors ] = useState(false)

  if (isConnected) {
    return (
      <button
        className='w-48 px-4 py-1 rounded-full cursor-pointer text-raze-gray bg-raze-pink'
      >{ ensName ? ensName : address.substr(0, 5) + '...' + address.substr(address.length -3)}
      </button>
    )
  }

  return (
    <div className='flex flex-col w-48 space-y-4'>
      <button 
        className={ 'px-4 py-1 text-raze-gray bg-raze-pink rounded-full hover:shadow ' + (showConnectors ? 'opacity-70' : '') }
        onClick={ () => setShowConnectors(!showConnectors) }
      >CONNECT WALLET</button>
      <Dialog 
        open={showConnectors} 
        onClose={() => setShowConnectors(false)}
        className='relative z-50'>
        <div className='fixed inset-0 bg-white opacity-40' ariaHidden={true} />
        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <Dialog.Panel className='max-w-xl p-8 mx-auto bg-raze-gray rounded-xl'>
            <Dialog.Title className='pb-4 text-center'>Connect a wallet</Dialog.Title>
            <div className='flex flex-col items-center space-y-4'>
            { connectors.map((connector) => (
              <button 
                disabled={ !connector.ready}
                key={ connector.id }
                onClick={ () => connect({ connector }) }
                className='w-full px-4 py-1 text-raze-gray bg-raze-pink rounded-xl hover:shadow'
              >
                { connector.name }
                { !connector.ready && ' (unsupported)' }
                { isLoading &&
                  connector.id === pendingConnector?.id &&
                  ' (connecting)' }
              </button>
            )) }
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
