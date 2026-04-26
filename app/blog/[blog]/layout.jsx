export default function BlogLayout({children}){
    return(
        <main className='flex'>
            {children}
            <section></section>
        </main>
    )
}