'use client'
import Link from "next/link"
import Image from "next/image"

export default function Logo(){
    return (
        <Link href={'/'}>
            <Image 
                src="/logo.png" 
                alt="ngwindsongk Logo" 
                width={130} 
                height={40} 
                priority 
                style={{ height: 'auto', width: 'auto' }}
            />
        </Link>
    )
}