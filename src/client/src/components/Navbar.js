import { RazeButton } from './RazeButton'
import { ConnectButton } from './ConnectButton'

export function Navbar() {
  return (
    <div className='sticky lg:top-0'>
    <div className='relative flex justify-between px-4 pt-4 space-x-4'>
      <RazeButton />
      <ConnectButton />
    </div>
    </div>
  )
}
