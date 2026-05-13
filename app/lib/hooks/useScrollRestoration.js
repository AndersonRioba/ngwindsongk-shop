'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const scrollPositions = new Map()

export function useScrollRestoration(key, isLoading) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const fullKey = `${pathname}?${searchParams.toString()}-${key}`

  // Save scroll position on unmount or before navigation
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(fullKey, window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [fullKey])

  // Restore scroll position after loading is complete
  useLayoutEffect(() => {
    if (!isLoading) {
      const savedPosition = scrollPositions.get(fullKey)
      if (savedPosition !== undefined) {
        // Use a small timeout to ensure DOM is painted
        setTimeout(() => {
          window.scrollTo({ top: savedPosition, behavior: 'instant' })
        }, 50)
      }
    }
  }, [isLoading, fullKey])
}
