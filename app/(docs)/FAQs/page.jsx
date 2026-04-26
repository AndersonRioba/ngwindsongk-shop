'use client'
import { useState } from "react";
import useSWR from "swr";
import { fetcher, postData } from "@/app/lib/data";
import Link from "next/link";
import Spinner from "@/app/UI/Spinner";

export function Question({question, answer}){
    let plus = 'icon-[fe--plus]'
    let minus = 'icon-[tabler--minus]'
    let [dropDown, setDropDown] = useState(plus)
    return(
        <div className={`border-2 p-2 rounded-lg ${dropDown==plus?'':'border-primary/50'}`}>
            <button className="flex justify-between md:items-center mb-3 w-full" onClick={e=>setDropDown(dropDown==plus?minus:plus)}>
                <p className="font-semibold text-left">{question}</p>
                <span className={`${dropDown} block w-7 h-7`}/>
            </button>
            <p className={`${dropDown==plus?'hidden':'block'} pb-3`}>{answer}</p>
        </div>
    )
}
export default function FAQs(){
    let { data, error, isLoading } = useSWR(['/faqs',{product:'global'}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    if(isLoading || error) return <Spinner/>
    
    return(
        <main className="mx-2 md:w-2/3 2xl:w-1/2 md:mx-auto">
            <h3 className="text-2xl 2xl:text-3xl font-semibold my-6">Frequently asked <span className="text-primary">Questions (FAQs)</span></h3>
            
            <p className="">
                Here, you’ll find answers to common questions about using our platform, managing your account, item purchase, and more. If you don’t find the answer you’re looking for, feel free to <Link href={'/contact'} className="text-primary italic">contact our customer support team</Link> for further assistance.
            </p>

            <div className="my-4">
                {
                    (data || []).map((item,i)=>(<div className="my-8" key={i}><Question question={item.question} answer={item.answer}/></div>))
                }
            </div>
        </main>
    )
}