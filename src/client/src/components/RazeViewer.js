import { RazeCard } from './RazeCard'

const razes = [
  {
    title: 'NOMI\'S FUND',
    amountRaised: '$7,000',
    goalAmount: '$20,000',
    imageUrl: 'https://source.unsplash.com/random',
  },
  {
    title: 'CASA T',
    amountRaised: '$70,000',
    goalAmount: '$100,000',
    imageUrl: 'https://source.unsplash.com/random',
  },
  {
    title: 'LAMPS\'S FUND',
    amountRaised: '$500',
    goalAmount: '$5,000',
    imageUrl: 'https://source.unsplash.com/random',
  },
  {
    title: 'RAZE FUND',
    amountRaised: '$3,000',
    goalAmount: '$10,000',
    imageUrl: 'https://source.unsplash.com/random',
  },
]

export function RazeViewer() {
  return (
    <div className='flex flex-col items-center justify-between space-y-4 shrink-0'>
    { razes.map((raze, i) => (
      <RazeCard  
        key={i}
        title={raze.title}
        amountRaised={raze.amountRaised}
        goalAmount={raze.goalAmount}
        imageUrl={raze.imageUrl}
      />
    )) }
    </div>
  )
}
