'use client'
import { useEffect } from "react"

export default function Overlay({children, className,id, control}){
    useEffect(() => {
        const overlay = document.getElementById(id);
        if (!overlay) {
            console.error(`Overlay element with id '${id}' not found`);
            return;
        }

        const handleClick = (e) => {
            if (e.target.id === id) {
                control('');
            }
        };

        if (id !== undefined) {
            overlay.addEventListener('click', handleClick);
        }

        return () => {
            if (overlay && id !== undefined) {
                overlay.removeEventListener('click', handleClick);
            }
        };
    }, [id, control]);
    
    return(
        <div id={id} className={`fixed flex items-center justify-center z-50 w-lvw h-lvh top-0 left-0 bg-black bg-opacity-40 ${className}`}>
            <div id="children">{children}</div>
        </div>
    )
}