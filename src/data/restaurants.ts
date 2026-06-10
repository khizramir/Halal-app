export interface Restaurant {
  id: string
  name: string
  cuisine: string
  suburb: string
  city: string
  state: string
  address: string
  phone?: string
  website?: string
  rating: number
  certificationStatus: 'certified' | 'community-verified'
  features: ('family-friendly' | 'prayer-space' | 'halal-certified' | 'community-verified')[]
  lat: number
  lng: number
  openingHours?: string
  description?: string
}

export const restaurants: Restaurant[] = [
  {
    id: '1', name: 'Al Aseel Grill', cuisine: 'Lebanese', suburb: 'Greenacre',
    city: 'Sydney', state: 'NSW', address: '85 Waterloo Rd, Greenacre NSW 2190',
    phone: '(02) 9750 4455', rating: 4.5, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -33.9063, lng: 151.0723,
    description: 'Authentic Lebanese grill with AFIC-certified halal meat.'
  },
  {
    id: '2', name: 'Lakemba Sweets & Kebab', cuisine: 'Lebanese', suburb: 'Lakemba',
    city: 'Sydney', state: 'NSW', address: '8 Haldon St, Lakemba NSW 2195',
    phone: '(02) 9759 0123', rating: 4.3, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -33.9180, lng: 151.0718,
    description: 'Famous Lakemba sweets and shawarma.'
  },
  {
    id: '3', name: 'Bilal Halal Meats & Grill', cuisine: 'Pakistani', suburb: 'Auburn',
    city: 'Sydney', state: 'NSW', address: '22 Auburn Rd, Auburn NSW 2144',
    rating: 4.2, certificationStatus: 'certified',
    features: ['halal-certified'], lat: -33.8490, lng: 151.0329,
    description: 'Pakistani halal meats and traditional grills.'
  },
  {
    id: '4', name: 'Naan & Curry House', cuisine: 'Pakistani', suburb: 'Parramatta',
    city: 'Sydney', state: 'NSW', address: '73 Macquarie St, Parramatta NSW 2150',
    phone: '(02) 9891 5678', rating: 4.4, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly', 'prayer-space'], lat: -33.8148, lng: 151.0025,
    description: 'Authentic Pakistani curries and fresh naan bread.'
  },
  {
    id: '5', name: 'Istanbul Turkish Restaurant', cuisine: 'Turkish', suburb: 'Bankstown',
    city: 'Sydney', state: 'NSW', address: '45 Paul St, Bankstown NSW 2200',
    phone: '(02) 9708 3344', rating: 4.6, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -33.9163, lng: 151.0343,
    description: 'Authentic Turkish cuisine with certified halal meats.'
  },
  {
    id: '6', name: 'Mamak Malaysian', cuisine: 'Malaysian', suburb: 'Haymarket',
    city: 'Sydney', state: 'NSW', address: '15 Goulburn St, Haymarket NSW 2000',
    phone: '(02) 9211 1668', rating: 4.5, certificationStatus: 'certified',
    features: ['halal-certified'], lat: -33.8779, lng: 151.2058,
    description: 'Popular Malaysian street food in the city.'
  },
  {
    id: '7', name: 'Mogadishu Kitchen', cuisine: 'Somali', suburb: 'Merrylands',
    city: 'Sydney', state: 'NSW', address: '67 Merrylands Rd, Merrylands NSW 2160',
    rating: 4.1, certificationStatus: 'community-verified',
    features: ['community-verified', 'prayer-space'], lat: -33.8357, lng: 150.9877,
    description: 'Homestyle Somali cooking, community favourite.'
  },
  {
    id: '8', name: 'Kabul Kitchen', cuisine: 'Afghan', suburb: 'Dandenong',
    city: 'Melbourne', state: 'VIC', address: '34 McCrae St, Dandenong VIC 3175',
    phone: '(03) 9792 1234', rating: 4.4, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly', 'prayer-space'], lat: -37.9873, lng: 145.2149,
    description: 'Traditional Afghan cuisine, popular with local community.'
  },
  {
    id: '9', name: 'Abla Lebanese Restaurant', cuisine: 'Lebanese', suburb: 'Carlton',
    city: 'Melbourne', state: 'VIC', address: '109 Elgin St, Carlton VIC 3053',
    phone: '(03) 9347 0006', website: 'https://ablas.com.au', rating: 4.7,
    certificationStatus: 'certified', features: ['halal-certified', 'family-friendly'],
    lat: -37.8013, lng: 144.9683, description: 'Melbourne institution for Lebanese cuisine since 1979.'
  },
  {
    id: '10', name: 'Maha Restaurant', cuisine: 'Middle Eastern', suburb: 'Melbourne CBD',
    city: 'Melbourne', state: 'VIC', address: '21 Bond St, Melbourne VIC 3000',
    phone: '(03) 9629 5900', website: 'https://maharestaurant.com.au', rating: 4.8,
    certificationStatus: 'certified', features: ['halal-certified'],
    lat: -37.8170, lng: 144.9618, description: 'Award-winning Middle Eastern inspired cuisine.'
  },
  {
    id: '11', name: 'Lazat Malaysian Cuisine', cuisine: 'Malaysian', suburb: 'Footscray',
    city: 'Melbourne', state: 'VIC', address: '68 Hopkins St, Footscray VIC 3011',
    rating: 4.3, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly'], lat: -37.8009, lng: 144.9005,
    description: 'Authentic Malaysian halal flavours in the west.'
  },
  {
    id: '12', name: 'Bosphorus Turkish Grill', cuisine: 'Turkish', suburb: 'Coburg',
    city: 'Melbourne', state: 'VIC', address: '556 Sydney Rd, Coburg VIC 3058',
    phone: '(03) 9354 7788', rating: 4.4, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -37.7431, lng: 144.9642,
    description: 'Authentic Turkish grills and pide in Coburg.'
  },
  {
    id: '13', name: 'Mecca Bah', cuisine: 'Middle Eastern', suburb: 'Fortitude Valley',
    city: 'Brisbane', state: 'QLD', address: '39 Warner St, Fortitude Valley QLD 4006',
    phone: '(07) 3852 4779', website: 'https://meccabah.com', rating: 4.5,
    certificationStatus: 'certified', features: ['halal-certified'],
    lat: -27.4567, lng: 153.0367, description: 'Popular Middle Eastern tapas restaurant.'
  },
  {
    id: '14', name: 'Spice Affair Indian & Pakistani', cuisine: 'Pakistani', suburb: 'Sunnybank',
    city: 'Brisbane', state: 'QLD', address: '28 Pinelands Rd, Sunnybank QLD 4109',
    rating: 4.3, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly'], lat: -27.5764, lng: 153.0544,
    description: 'Pakistani and Indian cuisine with halal certification.'
  },
  {
    id: '15', name: 'Jakarta Indonesian Restaurant', cuisine: 'Indonesian', suburb: 'Moorooka',
    city: 'Brisbane', state: 'QLD', address: '6 Boundary Rd, Moorooka QLD 4105',
    phone: '(07) 3848 1122', rating: 4.2, certificationStatus: 'community-verified',
    features: ['community-verified', 'prayer-space'], lat: -27.5228, lng: 153.0112,
    description: 'Home-style Indonesian cooking, community run.'
  },
  {
    id: '16', name: 'Halal Boys', cuisine: 'Pakistani', suburb: 'West End',
    city: 'Brisbane', state: 'QLD', address: '89 Boundary St, West End QLD 4101',
    rating: 4.4, certificationStatus: 'community-verified',
    features: ['community-verified'], lat: -27.4794, lng: 153.0131,
    description: 'Popular halal street food concept.'
  },
  {
    id: '17', name: 'El Kebab Turkish Grillhouse', cuisine: 'Turkish', suburb: 'Annerley',
    city: 'Brisbane', state: 'QLD', address: '344 Ipswich Rd, Annerley QLD 4103',
    rating: 4.1, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -27.5064, lng: 153.0203,
    description: 'Traditional Turkish grills and doner.'
  },
  {
    id: '18', name: 'Al-Medina Halal Restaurant', cuisine: 'Lebanese', suburb: 'Northbridge',
    city: 'Perth', state: 'WA', address: '65 James St, Northbridge WA 6003',
    phone: '(08) 9328 4455', rating: 4.3, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -31.9481, lng: 115.8613,
    description: 'Lebanese and Middle Eastern cuisine in Northbridge.'
  },
  {
    id: '19', name: 'Aryana Afghan Restaurant', cuisine: 'Afghan', suburb: 'Mirrabooka',
    city: 'Perth', state: 'WA', address: '28 Yirrigan Dr, Mirrabooka WA 6061',
    rating: 4.5, certificationStatus: 'community-verified',
    features: ['community-verified', 'prayer-space', 'family-friendly'], lat: -31.8568, lng: 115.8543,
    description: 'Beloved Afghan community restaurant with authentic flavours.'
  },
  {
    id: '20', name: 'Istanbul Kebab House', cuisine: 'Turkish', suburb: 'Cannington',
    city: 'Perth', state: 'WA', address: '1360 Albany Hwy, Cannington WA 6107',
    phone: '(08) 9451 7788', rating: 4.2, certificationStatus: 'certified',
    features: ['halal-certified'], lat: -32.0156, lng: 115.9401,
    description: 'Certified halal Turkish kebabs and grills.'
  },
  {
    id: '21', name: 'Nasi Kandar Pelita', cuisine: 'Malaysian', suburb: 'Victoria Park',
    city: 'Perth', state: 'WA', address: '345 Albany Hwy, Victoria Park WA 6100',
    rating: 4.4, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly'], lat: -31.9747, lng: 115.8905,
    description: 'Malaysian nasi kandar and curry favourites.'
  },
  {
    id: '22', name: 'Somali Kitchen Perth', cuisine: 'Somali', suburb: 'Balga',
    city: 'Perth', state: 'WA', address: '15 Wanneroo Rd, Balga WA 6061',
    rating: 4.0, certificationStatus: 'community-verified',
    features: ['community-verified', 'prayer-space'], lat: -31.8500, lng: 115.8378,
    description: 'Community-run Somali restaurant in Balga.'
  },
  {
    id: '23', name: 'Rangoon Burmese Restaurant', cuisine: 'Burmese/Malaysian', suburb: 'Highgate',
    city: 'Perth', state: 'WA', address: '78 Beaufort St, Highgate WA 6003',
    rating: 4.3, certificationStatus: 'community-verified',
    features: ['community-verified', 'family-friendly'], lat: -31.9350, lng: 115.8710,
    description: 'Halal Burmese and Malaysian fusion.'
  },
  {
    id: '24', name: 'Medina Palace', cuisine: 'Lebanese', suburb: 'Punchbowl',
    city: 'Sydney', state: 'NSW', address: '1 The Boulevarde, Punchbowl NSW 2196',
    phone: '(02) 9750 9999', rating: 4.6, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly', 'prayer-space'], lat: -33.9266, lng: 151.0563,
    description: 'Grand banquet hall for weddings and family gatherings.'
  },
  {
    id: '25', name: 'Biryani House', cuisine: 'Pakistani', suburb: 'Dandenong',
    city: 'Melbourne', state: 'VIC', address: '57 Foster St, Dandenong VIC 3175',
    phone: '(03) 9793 2211', rating: 4.5, certificationStatus: 'certified',
    features: ['halal-certified', 'family-friendly'], lat: -37.9866, lng: 145.2180,
    description: 'Award-winning biryani and Pakistani curries.'
  }
]

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
