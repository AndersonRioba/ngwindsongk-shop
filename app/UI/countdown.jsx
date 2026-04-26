'use client'
import { useRef, useEffect } from "react";

export default function Countdown(Props){
    let daysRef = useRef();
    let hourRef = useRef();
    let minuteRef = useRef();
    let secondRef = useRef();
    let countDownDate = new Date(Props.target).getTime();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const duration = countDownDate - now;
            
            if (daysRef.current) daysRef.current.innerText = Math.floor(duration / (1000 * 60 * 60 * 24));
            if (hourRef.current) hourRef.current.innerText = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (minuteRef.current) minuteRef.current.innerText = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            if (secondRef.current) secondRef.current.innerText = Math.floor((duration % (1000 * 60)) / 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [countDownDate]);
    return(
        <div className="countdown flex justify-center items-center font-semibold md:text-4xl mx-auto uppercase">
            <div className=" text-primary-base">
                <div className="md:text-6xl text-center" ref={daysRef}></div>
                <div>Days</div>
            </div>
            <div className=" text-2xl md:text-4xl mx-2">:</div>
            <div className="text-primary-base">
                <div className="md:text-6xl text-center" ref={hourRef}></div>
                <div>Hours</div>
            </div>
            <div className=" text-2xl md:text-4xl mx-2">:</div>
            <div className="text-primary-base">
                <div className="md:text-6xl text-center" ref={minuteRef}></div>
                <div>minutes</div>
            </div>
            <div className="text-2xl md:text-4xl mx-2">:</div>
            <div className="text-secondary-base">
                <div className="md:text-6xl text-center" ref={secondRef}></div>
                <div>seconds</div>
            </div>
        </div>
    )
}