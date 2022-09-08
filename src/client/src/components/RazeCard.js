import { useState, useEffect } from 'react'

export function RazeCard({ title, amountRaised, goalAmount, imageUrl }) {
  const [ image, setImage ] = useState(undefined)
  
  useEffect(() => {
    async function fetchImage() {
      const res = await fetch(imageUrl + '?sig=' + Math.random() * 10)
      const blob = await res.blob()
      const objUrl = URL.createObjectURL(blob)
      setImage(objUrl)
    }
    fetchImage()
  }, [imageUrl])
  
  return (
    <div 
      style={{backgroundImage: `url(${image})`}}
      className='flex flex-col justify-between h-64 bg-cover bg-center p-4 border-2 w-96 rounded-xl border-raze-pink'>
      <h2 className='px-4 py-1 border rounded-full border-raze-gray w-min whitespace-nowrap bg-raze-pink '>{ title }</h2>
      <div className='flex items-end justify-between'>
        <div className='flex flex-col text-sm space-y-2'>
          <p className='px-4 py-1 border border-2 rounded-full bg-raze-pink w-min whitespace-nowrap border-raze-gray'>RAISED: { amountRaised }</p>
          <p className='px-4 py-1 border border-2 rounded-full bg-raze-pink w-min whitespace-nowrap border-raze-gray'>GOAL: { goalAmount }</p>
        </div>
        <button className='px-4 py-1 border border-2 rounded-full border-raze-gray bg-raze-pink'>FUND</button>
      </div>
    </div>
  )
}
