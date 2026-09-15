/**
 * CI validation: checks every attraction satisfies data contracts.
 * Run with: npx ts-node --project tsconfig.json scripts/validateAttractions.ts
 */
import { ATTRACTIONS } from '../src/data/attractions'

const INDIA_LAT_MIN = 8, INDIA_LAT_MAX = 37
const INDIA_LNG_MIN = 68, INDIA_LNG_MAX = 97
const REQUIRED_ITINERARY_COMBOS = [
  [2, 'Solo'], [2, 'Family'],
  [3, 'Solo'], [3, 'Family'],
  [4, 'Solo'], [4, 'Family'],
] as [2|3|4, 'Solo'|'Family'][]

let errors = 0

for (const a of ATTRACTIONS) {
  const fail = (msg: string) => { console.error(`❌ [${a.id}] ${msg}`); errors++ }

  if (!a.id)          fail('missing id')
  if (!a.name)        fail('missing name')
  if (!a.city)        fail('missing city')
  if (!a.state)       fail('missing state')
  if (!a.district)    fail('missing district')
  if (!a.description) fail('missing description')

  if (a.highlights.length < 3)  fail(`highlights < 3 (got ${a.highlights.length})`)
  if (a.insiderTips.length < 2) fail(`insiderTips < 2 (got ${a.insiderTips.length})`)
  if (a.moodTags.length < 1)    fail('no moodTags')

  const { lat, lng } = a.coordinates
  if (lat < INDIA_LAT_MIN || lat > INDIA_LAT_MAX) fail(`lat out of bounds: ${lat}`)
  if (lng < INDIA_LNG_MIN || lng > INDIA_LNG_MAX) fail(`lng out of bounds: ${lng}`)

  for (const [days, profile] of REQUIRED_ITINERARY_COMBOS) {
    const it = a.itineraries.find((x) => x.days === days && x.profile === profile)
    if (!it) {
      fail(`missing itinerary ${days}d-${profile}`)
    } else if (it.schedule.length !== days) {
      fail(`itinerary ${days}d-${profile} schedule length ${it.schedule.length} !== ${days}`)
    }
  }
}

if (errors === 0) {
  console.log(`✅ All ${ATTRACTIONS.length} attractions passed validation.`)
  process.exit(0)
} else {
  console.error(`\n${errors} error(s) found.`)
  process.exit(1)
}
