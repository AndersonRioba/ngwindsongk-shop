'use client'
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useSWR from "swr"
import { fetcher } from "@/app/lib/data"
import useCart from "@/app/lib/hooks/useCart";
import Rating from "@/app/UI/Rating";
import Spinner from "@/app/UI/Spinner";
import ProductListing, {ProductListingSkeleton} from "@/app/UI/ProductListing";
import Overlay from "@/app/UI/Overlay";
import ReviewModal from "@/app/UI/ReviewModal";
import { Question } from "@/app/(docs)/FAQs/page";
import { getImageUrl } from "@/app/lib/utils/image";

function Details({product}){
    const [currentIndex, setCurrentIndex] = useState(0);
    let { data, error, isLoading } = useSWR([`/descriptions/${product}`,{}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const images = data?.product?.product_images || [];

    const [paused, setPaused] = useState(false);

    const prev = () => setCurrentIndex(i => (i - 1 + images.length) % images.length);
    const next = () => setCurrentIndex(i => (i + 1) % images.length);

    useEffect(() => {
        if (paused || images.length <= 1) return;
        const timer = setInterval(() => setCurrentIndex(i => (i + 1) % images.length), 5000);
        return () => clearInterval(timer);
    }, [paused, images.length]);

    if(isLoading || error) return <Spinner/>
    return(
        <section id="details" className="pt-10">
            <p className="font-semibold text-2xl mb-4">Product details</p>
            <div>
                <div className="flex flex-col items-center gap-4 mb-6 lg:float-right lg:ml-8 lg:w-1/2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                    {images.length > 0 && (
                        <div className="relative w-full flex justify-center items-center">
                            {images.length > 1 && (
                                <button onClick={prev} className="absolute left-2 z-10">
                                    <span className="icon-[ri--arrow-left-s-line] w-6 h-6"/>
                                </button>
                            )}
                            <div className="relative w-full h-96">
                                <Image 
                                    className="object-cover rounded-md transition-all duration-300" 
                                    src={getImageUrl(images[currentIndex]?.url)} 
                                    alt={data?.product?.name || "Product detail image"} 
                                    fill
                                />
                            </div>
                            {images.length > 1 && (
                                <button onClick={next} className="absolute right-2 z-10">
                                    <span className="icon-[ri--arrow-right-s-line] w-6 h-6"/>
                                </button>
                            )}
                        </div>
                    )}
                    {images.length > 1 && (
                        <div className="flex gap-2">
                            {images.map((_, i) => (
                                <button key={i} onClick={() => setCurrentIndex(i)} className={`w-3 h-3 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}/>
                            ))}
                        </div>
                    )}
                </div>
                <div className="[&>*]:mb-4" dangerouslySetInnerHTML={{__html: data.description}}/>
            </div>
        </section>
    )
}

function Reviews({product}){
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(['/reviews',{product}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });
    
    if(isLoading) return <Spinner/>
    if(error || !data) return null;

    return(
        <section id="reviews" className="pt-20">
            <ReviewModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    mutate();
                }}
                product_id={product} // Optional: Pass product to modal if I update modal to accept it
            />
            <div className="flex justify-between items-center mb-12 bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm">
                <div>
                    <p className="font-black text-3xl text-gray-900 tracking-tight mb-2">Customer Feedback</p>
                    <p className="text-gray-400 font-medium italic">What our community thinks of this product</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 text-primary font-black border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10 active:scale-95"
                > 
                    <span className="icon-[solar--pen-new-square-bold] w-5 h-5"/> 
                    Write a review
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-sm h-fit sticky top-24">
                    <div className="flex items-center gap-6 mb-8">
                        <span className="font-black text-6xl text-gray-900 tracking-tighter">{data.rating}</span> 
                        <div>
                            <div className="flex gap-1 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`${i < Math.floor(data.rating) ? 'icon-[solar--star-bold]' : 'icon-[solar--star-linear] text-gray-200'} w-6 h-6 text-yellow-400`} />
                                ))}
                            </div>
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{data.reviews} Approved Reviews</span> 
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {
                            (data.ratings || [0,0,0,0,0]).map((percentage, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-900 w-4">{5-i}</span>
                                    <span className="icon-[solar--star-bold] w-4 h-4 text-gray-200"/>
                                    <div className="flex-grow h-2 bg-gray-50 rounded-full overflow-hidden border border-black/[0.03]">
                                        <div 
                                            className="h-full bg-yellow-400 rounded-full transition-all duration-1000" 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 w-8">{percentage}%</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className="lg:w-2/3 space-y-6">
                    {data.reviewers && data.reviewers.length > 0 ? (
                        data.reviewers.map((reviewer, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-all shadow-md">
                                            {reviewer.name ? reviewer.name[0] : 'C'}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base uppercase tracking-tight">{reviewer.name}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{reviewer.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 gap-0.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-black/[0.03]">
                                        {[...Array(5)].map((_, star) => (
                                            <span key={star} className={`${star < reviewer.rating ? 'icon-[solar--star-bold]' : 'icon-[solar--star-linear] text-gray-200'} w-4 h-4`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed font-medium italic">
                                    "{reviewer.comment}"
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-[2rem] p-20 border border-dashed border-gray-200 text-center flex flex-col items-center">
                            <span className="icon-[solar--chat-dots-bold-duotone] w-16 h-16 text-gray-200 mb-6" />
                            <h3 className="text-xl font-bold text-gray-400">No approved reviews yet.</h3>
                            <p className="text-gray-300 text-sm mt-2 font-medium">Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function Related({product, category}){
    let { data, error, isLoading } = useSWR([`/products`,{category, exclude: product}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });
    
    const scrollRef = useRef(null);

    function scroll(dir) {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
    }

    const items = data?.data || [];

    return(
        <div className="relative group">
            {items.length > 3 && (
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-black/5 items-center justify-center hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
                    aria-label="Scroll left"
                >
                    <span className="icon-[ant-design--left-outlined] w-5 h-5" />
                </button>
            )}

            <div ref={scrollRef} className="grid grid-flow-col auto-cols-[85%] md:auto-cols-[300px] grid-rows-1 gap-6 py-4 overflow-x-auto scrollbar-hide snap-x px-2">
                {
                    isLoading || error?
                    [...new Array(4)].map((_,i)=>(<div key={i} className="snap-start"><ProductListingSkeleton/></div>))
                    :
                    items.map((product,i)=>(<div className="snap-start" key={i}><ProductListing data={product}/></div>))
                }
            </div>

            {items.length > 3 && (
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-black/5 items-center justify-center hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:flex"
                    aria-label="Scroll right"
                >
                    <span className="icon-[ant-design--right-outlined] w-5 h-5" />
                </button>
            )}
        </div>
    )
}

function ProductRecipes({product}){
    let { data, error, isLoading } = useSWR([`/recipes`, {product_id: product}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });

    const recipes = data?.data?.data || data?.data || [];

    if(isLoading) return <Spinner/>
    if(error || recipes.length === 0) return null;

    return(
        <section id="recipes" className="pt-20">
            <p className="font-semibold text-2xl mb-8 font-black uppercase tracking-widest italic text-primary">Associated Recipes</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map((recipe) => (
                    <Link 
                        key={recipe.id} 
                        href={`/recipes/${recipe.slug}`}
                        className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-primary transition-all duration-500 shadow-sm hover:shadow-xl"
                    >
                        <div className="relative h-48 overflow-hidden">
                            <Image
                                src={getImageUrl(recipe.image, '/recipe-placeholder.png')}
                                alt={recipe.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                        </div>
                        <div className="p-6">
                            <h4 className="text-gray-900 font-bold text-lg mb-2 group-hover:text-primary transition-colors">{recipe.title}</h4>
                            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1"><span className="icon-[solar--clock-circle-bold] text-primary" /> {recipe.cooking_time} Min</span>
                                <span className="text-primary">View Recipe →</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

function Faqs({product}){
    let { data, error, isLoading } = useSWR(['/product-faqs',{product}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });
    return(
        <section id="faqs" className="pt-20">
            <p className="font-semibold text-2xl mb-8">Frequently Asked Questions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-7">
                {
                    isLoading || error?
                    <Spinner/>
                    :
                    (data || []).map((item,i)=>(<div className="" key={i}><Question question={item.question} answer={item.answer}/></div>))
                }
            </div>
        </section>
    )
}

function DetailsSkeleton(){
    return(
        <div className="w-11/12 2xl:w-10/12 mx-auto animate-pulse flex flex-col md:flex-row">
            <div className="flex flex-col-reverse md:flex-row md:w-2/3 2xl:w-2/3">
                <div className="grid grid-flow-col md:grid-flow-row auto-cols-[40%] md:auto-rows-[20%] overflow-auto md:grid-cols-1 gap-x-3 gap-y-3 py-3 md:py-0">
                        {
                            [...new Array(4)].map((_,i)=>(<div key={i} className="bg-gray-100/80 flex items-center justify-center p-3"><div className="h-24 w-32" /></div>))
                        }
                </div>
                <div className="flex justify-center h-72 md:h-full w-full">
                    <div className="bg-gray-300 w-[70%] h-[85%]" />
                </div>
            </div>
            <div className="md:w-5/12 mt-4 md:mt-0">
                    <p className="bg-gray-300 w-1/4 h-3 mb-4"></p>
                    <p className="bg-gray-300 w-2/3 h-3"></p>
                    <p className="bg-gray-300 w-1/5 h-2 my-2 lg:my-4"> </p>
                    <p className="bg-gray-300 w-full h-5"></p>
                    <div className="flex gap-4 my-6 items-center">
                        <p className="bg-gray-300 h-3 flex-grow"></p>
                        <p className="bg-gray-300 h-3 flex-grow"></p>
                        <div className="bg-gray-300 h-3 flex-grow"></div>
                    </div>
                    {
                        [...new Array(2)].map((_,i)=>(<div key={i} className="flex bg-gray-300 gap-2 my-4 h-2 w-1/2"></div>))
                    }
                    <div className="my-4 w-full h-4"></div>
                    <p className="bg-gray-300 h-2"></p>
                    <div className="flex gap-5 mb-6 mt-4">
                        <button className="bg-gray-200 px-4"> </button>
                        <input className="bg-gray-200 p-2 w-10 text-center"type="number" name="" id="" />
                        <button className="bg-gray-200 px-4"> </button>
                    </div>
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                        <button className=""></button>
                        <button className=""></button>
                    </div>
                </div>
        </div>
    )
}

export default function Page({params}){
    let product = params.product;
    let category = params.category;
    let [quantity, setQuantity] =useState(1);
    const [variation, setVariation] = useState(null);
    const [thumbStart, setThumbStart] = useState(0);
    const [activeImage, setActiveImage] = useState("");
    let mediaRef = useRef();
    let router = useRouter();
    
    let { data, error, isLoading } = useSWR([`/products/${product}`,{}], fetcher,{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: true,
        errorRetryInterval: 300000
    });
    let {addToCart} = useCart();
    
    useEffect(()=>{
        if(data && !isLoading && !error) {
            const primary = (data.product_images || []).filter(image=>image.is_primary)[0]?.url || data.product_images?.[0]?.url;
            setActiveImage(primary);
            if(data?.product_variations && data.product_variations.length > 0) {
                setVariation(data.product_variations[0]);
            }
        }
    },[data, isLoading, error])

    if(isLoading || error) return <DetailsSkeleton/>
    
    return(
        <div className="">
            <div className="flex flex-col md:flex-row">
                <div className="flex flex-col md:w-2/3 2xl:w-2/3">
                    <div className="relative flex justify-center w-full h-96 mb-7">
                        {activeImage && (
                            <Image 
                                src={getImageUrl(activeImage, '/product-placeholder.png')} 
                                className="object-contain" 
                                alt={data.name || "Product Image"} 
                                fill
                                priority
                            />
                        )}
                    </div>
                    {(data.product_images || []).length > 1 && (
                        <div className="flex items-center gap-2 py-3 md:w-fit md:mx-auto">
                            <button onClick={() => setThumbStart(i => Math.max(0, i - 1))} className={`p-1 rounded-full ${thumbStart === 0 ? 'opacity-30 cursor-default' : 'hover:bg-gray-100'}`}>
                                <span className="icon-[ri--arrow-left-s-line] w-6 h-6"/>
                            </button>
                            <div className="flex gap-3 justify-center">
                                {data.product_images.slice(thumbStart, thumbStart + 3).map((image, i) => (
                                    <button onClick={() => setActiveImage(image.url)} key={thumbStart + i} className="relative flex items-center justify-center h-24 md:h-28 w-24 md:w-28">
                                        <Image 
                                            className="object-cover rounded-md hover:ring-2 hover:ring-primary transition-all" 
                                            src={getImageUrl(image.url)} 
                                            alt={`${data.name} Thumbnail ${thumbStart + i + 1}`}
                                            fill
                                        />
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setThumbStart(i => Math.min(data.product_images.length - 3, i + 1))} className={`p-1 rounded-full ${thumbStart >= data.product_images.length - 3 ? 'opacity-30 cursor-default' : 'hover:bg-gray-100'}`}>
                                <span className="icon-[ri--arrow-right-s-line] w-6 h-6"/>
                            </button>
                        </div>
                    )}
                </div>
                <div className="md:w-5/12 mt-4 md:mt-0">
                    <p className="font-semibold text-3xl mb-4">{data.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-black/45">{data.category?.name}</p>
                    {/* Price and Stock Logic */}
                    {(() => {
                        const basePrice = parseFloat(variation?.price || data.price || 0);
                        const discountAmount = parseFloat(variation?.discount || data.discount || 0);
                        const isOffer = discountAmount > 0;
                        const finalPrice = isOffer ? Math.max(0, basePrice - discountAmount) : basePrice;
                        const previousPrice = isOffer ? basePrice : (variation?.previous || data.previous || null);

                        return (
                            <>
                                <p className="text-2xl text-primary font-semibold my-2 lg:my-4">
                                    Ksh {finalPrice.toLocaleString()} 
                                    {previousPrice && (
                                        <span className="line-through text-base text-gray-400 align-top ml-3">
                                            KSH {parseFloat(previousPrice).toLocaleString()}
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm lg:text-xs 2xl:text-sm text-justify">{data.about}</p>
                                <div className="flex gap-4 my-6 items-center">
                                    <p><span className="font-semibold">{(data.approved_reviews || []).length}</span> <span className="text-gray-500">reviews</span></p>
                                    <p>
                                        <span className="font-semibold">{variation ? variation.stock : data.stock}</span> 
                                        <span className="text-gray-500"> in stock</span>
                                    </p>
                                    <div className="flex items-center gap-1 font-semibold">
                                        <Rating rating={data.approved_reviews?.length > 0 ? (data.approved_reviews.reduce((acc, r) => acc + r.rate, 0) / data.approved_reviews.length) : 0}/> 
                                        <span>{data.approved_reviews?.length > 0 ? (data.approved_reviews.reduce((acc, r) => acc + r.rate, 0) / data.approved_reviews.length).toFixed(1) : '0.0'}</span> 
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                    {
                        data.perks?.map((perk,i)=>(<div key={i} className="flex gap-2 my-4"><span className="icon-[teenyicons--tick-circle-outline] text-Success w-6 h-6"/> {perk}</div>))
                    }
                    {
                        // Group product variations by attribute_name
                        (() => {
                            const grouped = {};
                            (data.product_variations || []).forEach(variation => {
                                if (!grouped[variation.attribute_name]) {
                                    grouped[variation.attribute_name] = [];
                                }
                                grouped[variation.attribute_name].push(variation);
                            });
                            return Object.entries(grouped).map(([attributeName, variations], idx) => (
                                <div key={attributeName} className="my-4">
                                    <p className="mb-3 font-semibold">Choose {attributeName}</p>
                                    <select
                                        className="w-full md:w-1/2 lg:w-1/3 py-2.5 px-4 rounded-xl border border-black/10 bg-[#f9f9f7] text-sm font-medium focus:border-primary focus:bg-white transition-all shadow-sm outline-none"
                                        name={attributeName}
                                        id={attributeName}
                                        value={variation?.id}
                                        onChange={e => {
                                            const selectedId = parseInt(e.target.value);
                                            const selVar = variations.find(v => v.id === selectedId);
                                            setVariation(selVar);
                                            
                                            // Handle image switching via state
                                            const variationImage = selVar?.image;
                                            const lowerCaseValue = selVar?.attribute_value?.toLowerCase() || "";
                                            
                                            if (variationImage) {
                                                setActiveImage(variationImage);
                                            } else {
                                                // Search gallery for matching color/variation name
                                                const galleryMatch = data.product_images?.find(img => 
                                                    img.url.toLowerCase().includes(lowerCaseValue)
                                                );
                                                
                                                if (galleryMatch) {
                                                    setActiveImage(galleryMatch.url);
                                                } else {
                                                    // Fallback to primary image
                                                    const primary = data.product_images?.find(img => img.is_primary)?.url || data.product_images?.[0]?.url;
                                                    if (primary) setActiveImage(primary);
                                                }
                                            }
                                        }}
                                    >
                                        {variations
                                            .slice()
                                            .map((v, i) => (
                                                <option key={v.id || i} value={v.id}>
                                                    {v.attribute_value}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            ));
                        })()
                    }
                    <p>Quantity</p>
                    <div className="flex gap-5 mb-6 mt-2">
                        <button onClick={e=>quantity>1?setQuantity(quantity-=1):setQuantity(1)} className="bg-gray-200 px-4">-</button>
                        <input className="bg-gray-200 p-2 w-10 text-center" value={quantity} onChange={e=>setQuantity(parseInt(e.target.value))} type="number" name="" id="" />
                        <button onClick={e=>setQuantity(quantity+=1)} className="bg-gray-200 px-4">+</button>
                    </div>
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                        <button 
                          onClick={e=>addToCart(quantity,data.name,variation)}
                          className="flex items-center gap-2 justify-center flex-grow text-center py-3 lg:py-2 2xl:py-3 rounded-md hover:scale-105 hover:font-semibold border-2 border-primary text-primary"
                        >
                            <span className="icon-[ri--shopping-cart-line] w-6 h-6"/>Add to cart
                        </button>
                        <button onClick={e=>{
                            addToCart(quantity,data.name,variation)
                            router.push('/checkout')
                        }} className="block flex-grow text-center py-3 lg:py-2 2xl:py-3 rounded-md hover:scale-105 bg-primary text-white">Checkout</button>
                    </div>
                </div>
            </div>
            <div className="my-20">
                <h6 className="mb-2 text-2xl font-semibold">Related products</h6>
                <Related product={product} category={category} />
            </div>
            <div className="mb-20">
                <div className="flex gap-4 overflow-y-scroll bg-gray-50 p-2 rounded-lg mb-6">
                    <Link className={`text-primary font-bold text-lg px-6 hover:bg-white hover:shadow-sm py-2 rounded-md transition-all border-r-2 border-gray-200`} href={'#details'}>Details</Link>
                    {category?.toLowerCase() !== 'nanacare' && (
                        <Link className={`text-primary font-bold text-lg px-6 hover:bg-white hover:shadow-sm py-2 rounded-md transition-all border-r-2 border-gray-200`} href={'#recipes'}>Recipes</Link>
                    )}
                    <Link className={`text-primary font-bold text-lg px-6 hover:bg-white hover:shadow-sm py-2 rounded-md transition-all border-r-2 border-gray-200`} href={'#reviews'}>Reviews</Link>
                    <Link className={`text-primary font-bold text-lg px-6 hover:bg-white hover:shadow-sm py-2 rounded-md transition-all`} href={'#faqs'}>FAQs</Link>
                </div>
                <Details product={product}/>
                {category?.toLowerCase() !== 'nanacare' && (
                    <ProductRecipes product={data.id}/>
                )}
                <Reviews product={data.id}/>
                <Faqs product={product}/>
            </div>
        </div>
    )
}