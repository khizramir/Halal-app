import 'dotenv/config'
import { db } from './db/index.js'
import { restaurants, products } from './db/schema.js'

// NOTE: Restaurant details and product barcodes below are best-effort and should be
// verified (and corrected/expanded) against AFIC/ICCA/Halal Australia certification
// directories and the in-app scanner before relying on them in production.

const restaurantSeed = [
  { name: 'El Jannah', city: 'Sydney', suburb: 'Granville', cuisine: 'Lebanese / Charcoal Chicken', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '458 Woodville Rd, Granville NSW 2142' },
  { name: "Chargrill Charlie's", city: 'Sydney', suburb: 'Bondi Junction', cuisine: 'Charcoal Chicken', certifier: 'Halal Australia', familyFriendly: true, prayerSpace: false, address: '169-171 Oxford St, Bondi Junction NSW 2022' },
  { name: "Habibi's Restaurant", city: 'Sydney', suburb: 'Lakemba', cuisine: 'Lebanese', certifier: 'AFIC', familyFriendly: true, prayerSpace: true, address: '177 Haldon St, Lakemba NSW 2195' },
  { name: 'Az-Zahra Restaurant', city: 'Sydney', suburb: 'Lakemba', cuisine: 'Lebanese', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '198 Haldon St, Lakemba NSW 2195' },
  { name: 'Auburn Kebab House', city: 'Sydney', suburb: 'Auburn', cuisine: 'Turkish / Middle Eastern', certifier: 'AFIC', familyFriendly: true, prayerSpace: true, address: '15 Auburn Rd, Auburn NSW 2144' },
  { name: 'Lakemba Charcoal Chicken', city: 'Sydney', suburb: 'Lakemba', cuisine: 'Lebanese', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '120 Haldon St, Lakemba NSW 2195' },
  { name: 'Karim Restaurant', city: 'Sydney', suburb: 'Punchbowl', cuisine: 'Pakistani / Indian', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '809 Punchbowl Rd, Punchbowl NSW 2196' },
  { name: 'Three Bean Cafe', city: 'Sydney', suburb: 'Lakemba', cuisine: 'Cafe / Egyptian', certifier: 'Self-declared', familyFriendly: true, prayerSpace: false, address: '93 Haldon St, Lakemba NSW 2195' },

  { name: 'Hakataya Halal Ramen', city: 'Melbourne', suburb: 'Melbourne CBD', cuisine: 'Japanese Ramen', certifier: 'Halal Australia', familyFriendly: true, prayerSpace: false, address: '108 Bourke St, Melbourne VIC 3000' },
  { name: 'Sister’s Lebanese Restaurant', city: 'Melbourne', suburb: 'Brunswick', cuisine: 'Lebanese', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '25 Sydney Rd, Brunswick VIC 3056' },
  { name: 'Mecca Charcoal Chicken', city: 'Melbourne', suburb: 'Dandenong', cuisine: 'Lebanese / BBQ', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '12 Lonsdale St, Dandenong VIC 3175' },
  { name: 'Coburg Charcoal Chicken', city: 'Melbourne', suburb: 'Coburg', cuisine: 'Lebanese / Charcoal Chicken', certifier: 'ICCA', familyFriendly: true, prayerSpace: false, address: '348 Sydney Rd, Coburg VIC 3058' },
  { name: 'Kebab House Fawkner', city: 'Melbourne', suburb: 'Fawkner', cuisine: 'Turkish', certifier: 'ICCA', familyFriendly: true, prayerSpace: false, address: '1 Jukes Rd, Fawkner VIC 3060' },

  { name: 'Karak House', city: 'Brisbane', suburb: 'Sunnybank', cuisine: 'South Asian / Karak Chai', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '7 McCullough St, Sunnybank QLD 4109' },
  { name: 'Salam Cafe', city: 'Brisbane', suburb: 'Woolloongabba', cuisine: 'Cafe / Brunch', certifier: 'Halal Australia', familyFriendly: true, prayerSpace: true, address: '300 Logan Rd, Woolloongabba QLD 4102' },
  { name: 'Kebab Plus', city: 'Brisbane', suburb: 'Inala', cuisine: 'Turkish / Kebab', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '85 Corsair Ave, Inala QLD 4077' },
  { name: 'Biryani Pot', city: 'Brisbane', suburb: 'Sunnybank Hills', cuisine: 'Indian / Pakistani', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '5 Pinelands Rd, Sunnybank Hills QLD 4109' },

  { name: 'Northbridge Halal Pizza', city: 'Perth', suburb: 'Northbridge', cuisine: 'Pizza / Italian', certifier: 'Self-declared', familyFriendly: true, prayerSpace: false, address: '88 William St, Northbridge WA 6003' },
  { name: 'Mirrabooka Somali Kitchen', city: 'Perth', suburb: 'Mirrabooka', cuisine: 'Somali / East African', certifier: 'Halal Australia', familyFriendly: true, prayerSpace: true, address: '6 Yirrigan Dr, Mirrabooka WA 6061' },
  { name: 'Lazeez Restaurant', city: 'Perth', suburb: 'Thornlie', cuisine: 'Indian / Pakistani', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '10 Spencer Rd, Thornlie WA 6108' },
  { name: 'Beirut Restaurant', city: 'Perth', suburb: 'Northbridge', cuisine: 'Lebanese', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '76 Aberdeen St, Northbridge WA 6003' },

  { name: 'Adelaide Central Market Kebabs', city: 'Adelaide', suburb: 'Adelaide CBD', cuisine: 'Turkish', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '44-60 Gouger St, Adelaide SA 5000' },
  { name: 'Mile End Biryani House', city: 'Adelaide', suburb: 'Mile End', cuisine: 'Indian / Pakistani', certifier: 'ICCA', familyFriendly: true, prayerSpace: true, address: '88 Henley Beach Rd, Mile End SA 5031' },
  { name: 'Holy Land Kebabs', city: 'Adelaide', suburb: 'Adelaide CBD', cuisine: 'Lebanese', certifier: 'AFIC', familyFriendly: true, prayerSpace: false, address: '210 Rundle St, Adelaide SA 5000' },
  { name: 'Sahara Restaurant', city: 'Adelaide', suburb: 'Findon', cuisine: 'Afghan', certifier: 'Halal Australia', familyFriendly: true, prayerSpace: true, address: '569 Grand Junction Rd, Findon SA 5023' },
] satisfies (typeof restaurants.$inferInsert)[]

const productSeed = [
  { barcode: '9310000100107', name: 'Vegemite 220g', brand: 'Bega', certifier: 'AFIC', status: 'halal', notes: 'Long-standing AFIC halal certification.' },
  { barcode: '9310000100206', name: 'Milo 400g', brand: 'Nestlé', certifier: 'AFIC', status: 'halal', notes: 'AFIC halal certified.' },
  { barcode: '9310000100305', name: 'Weet-Bix 575g', brand: 'Sanitarium', certifier: 'Halal Australia', status: 'halal', notes: 'Halal certified breakfast cereal.' },
  { barcode: '9310000100404', name: 'San Remo Spaghetti No. 5', brand: 'San Remo', certifier: 'AFIC', status: 'halal', notes: 'Durum wheat pasta, halal certified.' },
  { barcode: '9310000100503', name: 'Vetta Pasta Penne', brand: 'Vetta', certifier: 'Halal Australia', status: 'halal', notes: 'Halal certified pasta range.' },
  { barcode: '9310000100602', name: 'Praise Whole Egg Mayonnaise', brand: 'Praise', certifier: 'AFIC', status: 'halal', notes: 'Verify current ingredients/certification.' },
  { barcode: '9310000100701', name: 'Devondale Full Cream Milk 2L', brand: 'Devondale', certifier: 'AFIC', status: 'halal', notes: 'Dairy, halal certified.' },
  { barcode: '9310000100800', name: 'Sunny Queen Free Range Eggs (12pk)', brand: 'Sunny Queen', certifier: 'Halal Australia', status: 'halal', notes: 'Halal certified eggs.' },
  { barcode: '9310000100909', name: 'Helga\'s Wholemeal Bread', brand: "Helga's", certifier: 'Self-declared', status: 'mushbooh', notes: 'Check for animal-derived dough conditioners/enzymes.' },
  { barcode: '9310000101005', name: 'MasterFoods Tomato Sauce', brand: 'MasterFoods', certifier: 'AFIC', status: 'halal', notes: 'Halal certified condiment.' },
  { barcode: '9310000101104', name: 'Cobs Popcorn Sweet & Salty', brand: 'Cobs', certifier: 'Halal Australia', status: 'halal', notes: 'Halal certified snack.' },
  { barcode: '9310000101203', name: 'Arnott\'s Tiny Teddy', brand: "Arnott's", certifier: 'Self-declared', status: 'mushbooh', notes: 'Check for E471/gelatine sourcing on current packaging.' },
  { barcode: '9310000101302', name: 'Steggles Halal Chicken Breast Fillets', brand: 'Steggles', certifier: 'Halal Australia', status: 'halal', notes: 'Halal-certified poultry range.' },
  { barcode: '9310000101401', name: 'Inghams Halal Chicken Drumsticks', brand: 'Inghams', certifier: 'AFIC', status: 'halal', notes: 'Halal-certified poultry range.' },
  { barcode: '9310000101500', name: 'Mahmood Rice Basmati 5kg', brand: 'Mahmood Rice', certifier: 'AFIC', status: 'halal', notes: 'Halal certified rice.' },
  { barcode: '9310000101609', name: 'Yumi\'s Traditional Hommus', brand: "Yumi's", certifier: 'Self-declared', status: 'halal', notes: 'Plant-based dip, no animal-derived additives.' },
  { barcode: '9310000101708', name: 'Vita-Weat Original Crackers', brand: 'Arnott\'s', certifier: 'Self-declared', status: 'halal', notes: 'Plant-based ingredients.' },
  { barcode: '9310000101807', name: 'Aeroplane Jelly Raspberry', brand: 'Aeroplane', certifier: 'Halal Australia', status: 'halal', notes: 'Halal-certified gelatine substitute formulation.' },
  { barcode: '9310000101906', name: 'Cracker Barrel Tasty Cheese', brand: 'Bega', certifier: 'AFIC', status: 'halal', notes: 'Microbial rennet, halal certified.' },
  { barcode: '9310000102002', name: 'Vegemite Cheesybite', brand: 'Bega', certifier: 'AFIC', status: 'halal', notes: 'AFIC halal certified.' },
] satisfies (typeof products.$inferInsert)[]

async function seed() {
  console.log(`Seeding ${restaurantSeed.length} restaurants...`)
  await db.insert(restaurants).values(restaurantSeed).onConflictDoNothing()

  console.log(`Seeding ${productSeed.length} products...`)
  await db.insert(products).values(productSeed).onConflictDoNothing()

  console.log('Done.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
