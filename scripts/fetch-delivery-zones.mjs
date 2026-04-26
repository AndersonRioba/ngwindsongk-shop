// Fetch Google Places data for each delivery zone location
// Usage: node scripts/fetch-delivery-zones.mjs

const API_KEY = 'AIzaSyC6C5XyXp9n-aLRVBi7YOLc4xu2oior3Dg'

const zones = [
  { zone: 1, price: 300, locations: [
    "Quick Kyang'ombe", "Quick Mombasa Road", "Naivas HQ", "Cleanshelf South B",
    "Quick TM", "Lang'ata", "Allwin Industrial Area", "Naivas Imara Daima",
    "CBD Deliveries & Collections without Trolley", "Maji House", "Paper House/KEBS", "South C"
  ]},
  { zone: 2, price: 350, locations: [
    "Quick Pipeline", "Quick Fedha", "Quick Outering 1", "Quick Kilimani",
    "Chandarana Yaya", "Chandarana Adlife", "Quick Chaka", "Quick Kileleshwa",
    "Quick Lavington", "Westlands", "Chandarana The Well", "Ngara"
  ]},
  { zone: 3, price: 400, locations: [
    "Karen", "Parklands", "BuruBuru", "Donholm", "Syokimau", "Pangani", "Embakasi"
  ]},
  { zone: 4, price: 450, locations: [
    "Outering 2", "Komarock", "Muthainga"
  ]},
  { zone: 5, price: 500, locations: [
    "Mulolongo", "Signature", "Rongai", "Waithaka", "Mountain View", "UN",
    "Ruaka", "Ridgeways", "Utawala", "Jipange", "Mountai Mall", "Garden City",
    "Roysambu", "Thindigua", "Kiambu Road", "Thome", "Kahawa Wendani",
    "Kahawa West", "Kahawa Sukari", "Kayole", "Dandora"
  ]},
  { zone: 6, price: 600, locations: [
    "Kiambu Town", "Kikuyu", "Ruiru", "By-Pass 1&2", "Ruai",
    "Kitengela", "Ngong", "Kiserian", "Greenspoon", "Athi River"
  ]},
  { zone: 7, price: 700, locations: [
    "Greenpark Athi River", "Juja", "Spur Mall"
  ]},
]

async function findPlaceId(query) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query + ', Nairobi, Kenya')}&inputtype=textquery&fields=place_id&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].place_id
  }
  return null
}

async function getPlaceDetails(placeId) {
  const fields = 'name,formatted_address,geometry,place_id,types,url,address_components'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`
  const res = await fetch(url)
  const data = await res.json()
  if (data.result) {
    const place = data.result
    return {
      name: place.name,
      formatted_address: place.formatted_address,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      place_id: place.place_id,
      types: place.types,
      url: place.url,
      address_components: place.address_components,
    }
  }
  return null
}

async function searchPlace(query) {
  const placeId = await findPlaceId(query)
  if (!placeId) return null
  return getPlaceDetails(placeId)
}

async function main() {
  const results = []

  for (const zone of zones) {
    console.log(`\nProcessing Zone ${zone.zone} (KES ${zone.price})...`)
    for (const location of zone.locations) {
      try {
        const place = await searchPlace(location)
        if (place) {
          results.push({
            zone: zone.zone,
            price: zone.price,
            original_name: location,
            ...place,
          })
          console.log(`  ✓ ${location} -> ${place.name} (${place.latitude}, ${place.longitude})`)
        } else {
          results.push({
            zone: zone.zone,
            price: zone.price,
            original_name: location,
            name: null,
            formatted_address: null,
            latitude: null,
            longitude: null,
            place_id: null,
            types: null,
          })
          console.log(`  ✗ ${location} -> NOT FOUND`)
        }
        // Small delay to respect rate limits
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.error(`  ✗ ${location} -> ERROR: ${err.message}`)
        results.push({
          zone: zone.zone,
          price: zone.price,
          original_name: location,
          name: null,
          formatted_address: null,
          latitude: null,
          longitude: null,
          place_id: null,
          types: null,
          error: err.message,
        })
      }
    }
  }

  // Write results to JSON file
  const fs = await import('fs')
  const outPath = new URL('./delivery-zones-data.json', import.meta.url)
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  console.log(`\nDone! ${results.length} locations written to scripts/delivery-zones-data.json`)
}

main()
