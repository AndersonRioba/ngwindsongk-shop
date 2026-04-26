'use client'

import SideMenu from "./SideMenu"

export default function RecipesLayout({children}){
    return(
        <main className='flex flex-col-reverse md:flex-row gap-x-8 mx-2 md:mx-auto md:w-11/12 md:mt-6 mb-20'>
            <section className='w-full md:w-3/4 px-0 md:px-4'>
                {children}
            </section>
            <div className="w-full md:w-1/4 shrink-0 mb-10 md:mb-0">
                <SideMenu/>
            </div>
        </main>
    )
}