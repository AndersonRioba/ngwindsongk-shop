/**
 * icon-[bxs--star-half]
 * icon-[ri--star-s-fill]
 * #f3c63f
 */
export default function Rating({rating, iconClass}){
    return(
        <div className="flex items-center">
            <span className={`icon-[ri--star-s-fill] text-[#f3c63f] ${iconClass}`}></span>
            <span className={`icon-[ri--star-s-fill] text-[#f3c63f] ${iconClass}`}></span>
            <span className={`icon-[ri--star-s-fill] text-[#f3c63f] ${iconClass}`}></span>
            <span className={`icon-[ri--star-s-fill] text-[#f3c63f] ${iconClass}`}></span>
            <span className={`icon-[bxs--star-half] text-[#f3c63f] ${iconClass}`}></span>
        </div>
    )
}