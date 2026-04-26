export default function Spinner({full}){
    return(
        <div className={`flex items-center justify-center ${full?'w-[100vw] h-[90vh] bg-white flex-col absolute top-0 z-50':'w-full h-full bg-transparent'}`}>
            {
                full && <div className='icon-[eos-icons--three-dots-loading] text-primary w-20 h-20'/>
            }
            {
                !full && <div className="icon-[line-md--loading-alt-loop] w-24 h-24 text-primary"/>
            }
        </div>
    )
}