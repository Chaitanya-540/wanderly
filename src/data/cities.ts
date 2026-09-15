export interface City {
  name: string
  state: string
  lat: number
  lng: number
}

export const MAJOR_CITIES: Record<string, City> = {
  'Mumbai': { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  'Delhi': { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  'Bangalore': { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  'Chennai': { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  'Kolkata': { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  'Ahmedabad': { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  'Pune': { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  'Jaipur': { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  'Surat': { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  'Lucknow': { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  'Kanpur': { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  'Nagpur': { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  'Visakhapatnam': { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  'Indore': { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  'Thane': { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  'Bhopal': { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  'Patna': { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  'Vadodara': { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },
  'Ghaziabad': { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 },
  'Ludhiana': { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  'Agra': { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081 },
  'Nashik': { name: 'Nashik', state: 'Maharashtra', lat: 20.0059, lng: 73.7897 },
  'Faridabad': { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
  'Meerut': { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lng: 77.7064 },
  'Rajkot': { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022 },
  'Varanasi': { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  'Amritsar': { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },
  'Allahabad': { name: 'Allahabad', state: 'Uttar Pradesh', lat: 25.4358, lng: 81.8463 },
  'Jodhpur': { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  'Coimbatore': { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  'Kochi': { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  'Guwahati': { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  'Chandigarh': { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  'Bhubaneswar': { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  'Thiruvananthapuram': { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  'Dehradun': { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  'Shimla': { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734 },
  'Srinagar': { name: 'Srinagar', state: 'Jammu and Kashmir', lat: 34.0837, lng: 74.7973 },
  'Goa': { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240 },
}

// City names array for dropdown selects
export const MAJOR_CITY_NAMES = Object.keys(MAJOR_CITIES).sort()
