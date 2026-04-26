import { useEffect, useState, useCallback } from "react"

export default function Input({type, value, setValue, placeholder, disabled, name, required }){
    let [error, setError] = useState(false)
    let [show, setShow] = useState(type=='password'?true:false)

    const handler = useCallback((e) => {
        e.preventDefault();
        if (required && value === '') setError(true);
        else setError(false);
    }, [required, value]);

    useEffect(() => {
        // register to the verify event that's sent to all input elements
        const elements = document.getElementsByTagName('input');
        const activeHandlers = [];

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const h = (e) => handler(e);
            el.addEventListener('verify', h);
            activeHandlers.push({ el, h });
        }

        return () => {
            activeHandlers.forEach(({ el, h }) => {
                el.removeEventListener('verify', h);
            });
        };
    }, [handler]);
    return (
        <div id={name.replace(/\s+/g, '').toLowerCase()} className={`border-2 border-gray-300/60 flex rounded-md focus-within:border-primary-base focus-within:text-Grey py-2 pr-4 relative h-fit w-full ${error?'text-warning border-warning':'text-gray-500'} bg-transparent`}>
            <span className="text-xs absolute -top-2 left-2 px-2 bg-white font-semibold">{name} {required ? '*' : ''}</span>
            {
                type=='textarea'?
                <textarea required disabled={disabled} className={`px-4 w-full h-48 ${disabled?'text-black':'text-gray-600'}`} type="text" placeholder={placeholder} value={value} onChange={e=>setValue(e.target.value)} />
                :
                <input disabled={disabled} className={`px-4 w-full ${disabled ? 'text-black' : 'text-white'}`} type={show?'password':type=='password'?'text':type} placeholder={placeholder} value={value} onChange={e => {type=='number'?setValue(parseFloat(e.target.value)):setValue(e.target.value)}} />
            }
            {
                type=='password'?
                show?
                <button onClick={e=>{setShow(false)}} className="w-5 h-5 icon-[uiw--eye-o]"/>
                :
                <button onClick={e=>{setShow(true)}} className="w-5 h-5 icon-[heroicons--eye-slash]"/>
                :
                null
            }
        </div>
    );
}