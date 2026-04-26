'use client'

import { useContext, useRef } from "react";
import { CartContext } from "@/app/lib/providers/CartProvider";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Cart() {
    const router = useRouter();
    const { cart } = useContext(CartContext);
    const buttonRef = useRef(null);
    const totalItems = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    useGSAP(()=>{
      if (!buttonRef.current) return;
      return gsap.fromTo(
        buttonRef.current,
        { rotate: -10, scale: 1 },
        {
          rotate: 10,
          scale: 1.5,
          duration: 0.6,
          ease: 'power2.inOut',
          repeat: 1,
          yoyo: true,
          transformOrigin: 'center'
        }
      )
    }, { dependencies: [totalItems], scope: buttonRef })

    const openCart = e => {
      router.push('/cart')
    }

    return (
      <button id="cart-icon" ref={buttonRef}
      className="bg-gray-100 block p-4 rounded-full border-primary  w-16 h-16 hover:scale-110"
      onClick={e=>openCart(e)}
      >
        <span className="text-white bg-primary rounded-full absolute w-6 h-6 top-0 -right-1 flex items-center justify-center font-semibold">{totalItems}</span>
        <span className="icon-[heroicons--shopping-bag-solid] w-7 h-7 text-primary mx-auto" />
      </button>
    );
}