'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';
const DotLottieReact = dynamic(
  () =>
      import('@lottiefiles/dotlottie-react').then(
          (mod) => mod.DotLottieReact
      ),
  {
      ssr: false,
  }
)
import Countdown from '@/app/UI/countdown';
import Input from '@/app/UI/Input';

export default function Maintenance() {
  let [email, setEmail] = useState('')
  return (
    <main className='flex flex-col h-[100vh] items-center justify-center'>
      <div className='w-2/3 md:w-1/3 mb-8'>
        <DotLottieReact
          src="/building.json"
          loop
          autoplay
        />
      </div>
      <Countdown target="September 26, 2024"/>
      <h3 className='my-8 text-lg w-full text-center font-extrabold tracking-wide'>TO LAUNCH</h3>
      <div>
      <Input type='email' value={email} setValue={setEmail} placeholder='Enter your email' disabled={false} name='Email' required={false}/>
      </div>
      <button className='bg-primary-base text-white mt-9 py-3 rounded-full w-44 hover:scale-105 hover:bg-secondary-base hover:font-bold'>Join Waitlist</button>
    </main>
  );
}
