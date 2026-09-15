/**
 * CI validation: checks every state in ATTRACTIONS has matching STATE_COST_DATA entry.
 * Run with: npx ts-node --project tsconfig.json scripts/validateBudgetData.ts
 */
import { ATTRACTIONS } from '../src/data/attractions'
import { STATE_COST_DATA } from '../src/data/costOfLiving'

let errors = 0
const fail = (msg: string) => { console.error(`❌ ${msg}`); errors++ }

const statesInAttractions = [...new Set(ATTRACTIONS.map((a) => a.state))]

for (const state of statesInAttractions) {
  const data = STATE_COST_DATA[state]
  if (!data) {
    fail(`State "${state}" has no entry in STATE_COST_DATA`)
    continue
  }
  const numFields: (keyof typeof data)[] = [
    'budgetHotel', 'midrangeHotel', 'luxuryHotel',
    'budgetMealPerPerson', 'midrangeMealPerPerson', 'premiumMealPerPerson',
    'activitiesPerDayPerPerson', 'miscPerDayPerPerson',
  ]
  for (const field of numFields) {
    if (typeof data[field] !== 'number' || data[field] <= 0) {
      fail(`STATE_COST_DATA["${state}"].${field} is not a positive number (got ${data[field]})`)
    }
  }
}

if (errors === 0) {
  console.log(`✅ Budget data valid for all ${statesInAttractions.length} states.`)
  process.exit(0)
} else {
  console.error(`\n${errors} error(s) found.`)
  process.exit(1)
}
