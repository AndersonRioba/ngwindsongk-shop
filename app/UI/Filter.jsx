'use client'
import { useState } from "react"
export default function Filter(){
    let [filter, setFilter] = useState('');
    
    return(
        <button className="icon-[mage--filter] text-gray-900/70 hover:text-primary w-7 h-7"/>
    )
}