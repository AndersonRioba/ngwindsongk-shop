'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

let googleScriptLoaded = false
let googleScriptLoading = false
const loadCallbacks = []

function loadGoogleMapsScript() {
    if (googleScriptLoaded) return Promise.resolve()
    if (googleScriptLoading) {
        return new Promise(resolve => loadCallbacks.push(resolve))
    }
    googleScriptLoading = true
    return new Promise((resolve, reject) => {
        loadCallbacks.push(resolve)
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
        script.async = true
        script.onload = () => {
            googleScriptLoaded = true
            googleScriptLoading = false
            loadCallbacks.forEach(cb => cb())
            loadCallbacks.length = 0
        }
        script.onerror = () => {
            googleScriptLoading = false
            reject(new Error('Failed to load Google Maps'))
        }
        document.head.appendChild(script)
    })
}

export default function PlacesAutocomplete({ value, onChange, onSelect, className, placeholder, id }) {
    const inputRef = useRef(null)
    const autocompleteRef = useRef(null)
    const [suggestions, setSuggestions] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const sessionTokenRef = useRef(null)
    const serviceRef = useRef(null)

    useEffect(() => {
        loadGoogleMapsScript().then(() => {
            serviceRef.current = new window.google.maps.places.AutocompleteService()
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
        })
    }, [])

    const fetchSuggestions = useCallback((input) => {
        if (!input || input.length < 2 || !serviceRef.current) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        serviceRef.current.getPlacePredictions(
            {
                input,
                sessionToken: sessionTokenRef.current,
                componentRestrictions: { country: 'ke' },
            },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions)
                    setShowDropdown(true)
                    setActiveIndex(-1)
                } else {
                    setSuggestions([])
                    setShowDropdown(false)
                }
            }
        )
    }, [])

    // Debounce
    const debounceRef = useRef(null)
    const handleChange = (e) => {
        const val = e.target.value
        onChange(val)
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
    }

    const placesServiceRef = useRef(null)

    const selectSuggestion = (suggestion) => {
        onChange(suggestion.description)
        setSuggestions([])
        setShowDropdown(false)

        // Fetch full place details and log them
        if (!placesServiceRef.current) {
            // PlacesService needs a DOM element (can be a hidden div)
            const div = document.createElement('div')
            placesServiceRef.current = new window.google.maps.places.PlacesService(div)
        }
        placesServiceRef.current.getDetails(
            {
                placeId: suggestion.place_id,
                fields: ['name', 'formatted_address', 'geometry', 'address_components', 'place_id', 'types', 'url'],
                sessionToken: sessionTokenRef.current,
            },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    if (onSelect) {
                        onSelect({
                            name: place.name,
                            formatted_address: place.formatted_address,
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng(),
                            place_id: place.place_id,
                            address_components: place.address_components,
                        })
                    }
                } else {
                    console.warn('Place details fetch failed:', status)
                }
            }
        )

        // Reset session token after selection (for billing efficiency)
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault()
            selectSuggestion(suggestions[activeIndex])
        } else if (e.key === 'Escape') {
            setShowDropdown(false)
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (inputRef.current && !inputRef.current.parentElement.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative">
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                className={className}
                placeholder={placeholder}
                autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
                <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <li
                            key={s.place_id}
                            onClick={() => selectSuggestion(s)}
                            className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                                i === activeIndex ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                            }`}
                        >
                            <span className="icon-[mdi--map-marker-outline] w-4 h-4 inline-block mr-2 align-middle text-primary/60" />
                            {s.description}
                        </li>
                    ))}
                    <li className="px-3 py-1.5 text-[10px] text-gray-400 text-right">
                        Powered by Google
                    </li>
                </ul>
            )}
        </div>
    )
}
