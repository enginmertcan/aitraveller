import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

import { db } from "../Service/firebaseConfig";
import { TravelPlan } from "../types/travel";

// Default empty travel plan object
const DEFAULT_TRAVEL_PLAN: Partial<TravelPlan> = {
  id: '',
  destination: '',
  startDate: '',
  duration: '',
  days: 0,
  groupType: '',
  numberOfPeople: '',
  budget: '',
  isDomestic: false,
  residenceCountry: '',
  userId: '',
  itinerary: {},
  hotelOptions: [],
  bestTimeToVisit: '',
  // Cultural Differences
  culturalDifferences: '',
  lifestyleDifferences: '',
  foodCultureDifferences: '',
  socialNormsDifferences: '',
  // Visa and Travel Information
  visaRequirements: '',
  visaApplicationProcess: '',
  visaFees: '',
  travelDocumentChecklist: '',
  // Local Life Recommendations
  localTransportationGuide: '',
  emergencyContacts: '',
  currencyAndPayment: '',
  healthcareInfo: '',
  communicationInfo: '',
};

function safeParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

export function parseItinerary(data: any) {
  try {
    // Create a deep copy of the data to avoid mutations
    let parsedData = JSON.parse(JSON.stringify({ ...DEFAULT_TRAVEL_PLAN, ...data }));

    // Parse itinerary if it's a string
    if (typeof data.itinerary === 'string') {
      const parsedItinerary = safeParseJSON(data.itinerary);
      if (!parsedItinerary) return parsedData;

      // Extract nested fields with safe access
      parsedData = {
        ...parsedData,
        ...parsedItinerary,
        itinerary: Array.isArray(parsedItinerary.itinerary) ? parsedItinerary.itinerary : [],
        hotelOptions: Array.isArray(parsedItinerary.hotelOptions) ? parsedItinerary.hotelOptions : [],
      };

      // Safely extract cultural differences
      const culturalDiff = parsedItinerary.culturalDifferences || {};
      if (typeof culturalDiff === 'object') {
        parsedData.culturalDifferences = culturalDiff.culturalDifferences || '';
        parsedData.lifestyleDifferences = culturalDiff.lifestyleDifferences || '';
        parsedData.foodCultureDifferences = culturalDiff.foodCultureDifferences || '';
        parsedData.socialNormsDifferences = culturalDiff.socialNormsDifferences || '';
      }

      // Safely extract visa requirements
      const visaReq = parsedItinerary.visaAndTravelRequirements || {};
      if (typeof visaReq === 'object') {
        parsedData.visaRequirements = visaReq.visaRequirements || '';
        parsedData.visaApplicationProcess = visaReq.visaApplicationProcess || '';
        parsedData.visaFees = visaReq.visaFees || '';
        parsedData.travelDocumentChecklist = Array.isArray(visaReq.travelDocumentChecklist) 
          ? visaReq.travelDocumentChecklist 
          : typeof visaReq.travelDocumentChecklist === 'string' 
            ? visaReq.travelDocumentChecklist 
            : '';
      }

      // Safely extract local life information
      const localInfo = parsedItinerary.localLifeInformation || {};
      if (typeof localInfo === 'object') {
        parsedData.localTransportationGuide = localInfo.localTransportationGuide || '';
        parsedData.emergencyContacts = Array.isArray(localInfo.emergencyContacts)
          ? localInfo.emergencyContacts
          : typeof localInfo.emergencyContacts === 'string'
            ? localInfo.emergencyContacts
            : '';
        parsedData.currencyAndPayment = localInfo.currencyAndPayment || '';
        parsedData.healthcareInfo = localInfo.healthcareInfo || '';
        parsedData.communicationInfo = localInfo.communicationInfo || '';
      }
    }

    return parsedData;
  } catch (error) {
    console.error('Error in parseItinerary:', error);
    return { ...DEFAULT_TRAVEL_PLAN, ...data };
  }
}

export function formatTravelPlan(data: any): Partial<TravelPlan> {
  try {
    const parsedData = parseItinerary(data);
    
    // Format itinerary if it's an array
    let formattedItinerary = parsedData.itinerary;
    if (Array.isArray(parsedData.itinerary)) {
      formattedItinerary = parsedData.itinerary.reduce((acc: any, day: any, index: number) => {
        if (day && typeof day === 'object') {
          acc[`Day ${index + 1}`] = day;
        }
        return acc;
      }, {});
    }
    
    // Ensure all required fields exist with proper types
    return {
      ...DEFAULT_TRAVEL_PLAN,
      ...parsedData,
      id: data?.id || DEFAULT_TRAVEL_PLAN.id,
      itinerary: formattedItinerary || DEFAULT_TRAVEL_PLAN.itinerary,
      hotelOptions: Array.isArray(parsedData.hotelOptions) 
        ? parsedData.hotelOptions.filter(hotel => hotel && typeof hotel === 'object')
        : DEFAULT_TRAVEL_PLAN.hotelOptions,
      days: typeof parsedData.days === 'number' ? parsedData.days : DEFAULT_TRAVEL_PLAN.days,
      isDomestic: typeof parsedData.isDomestic === 'boolean' ? parsedData.isDomestic : DEFAULT_TRAVEL_PLAN.isDomestic,
    };
  } catch (error) {
    console.error('Error formatting travel plan:', error);
    return { ...DEFAULT_TRAVEL_PLAN, id: data?.id || '' };
  }
}

export async function fetchUserTravelPlans(userId: string): Promise<Partial<TravelPlan>[]> {
  try {
    if (!userId?.trim()) {
      console.warn("Invalid user ID provided");
      return [];
    }

    const travelPlansRef = collection(db, "travelPlans");
    const q = query(travelPlansRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => formatTravelPlan({ ...doc.data(), id: doc.id }))
      .filter(plan => plan.id && plan.destination); // Only return valid plans
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    return [];
  }
}

export async function fetchTravelPlanById(id: string): Promise<Partial<TravelPlan>> {
  try {
    if (!id?.trim()) {
      console.warn("Invalid travel plan ID provided");
      return { ...DEFAULT_TRAVEL_PLAN };
    }

    const travelPlanRef = doc(db, "travelPlans", id);
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      console.warn('Travel plan not found:', id);
      return { ...DEFAULT_TRAVEL_PLAN, id };
    }

    const rawData = docSnap.data();
    console.log('Raw data from Firebase:', rawData);
    const formattedPlan = formatTravelPlan({ ...rawData, id: docSnap.id });
    console.log('Formatted travel plan:', formattedPlan);
    return formattedPlan;
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    return { ...DEFAULT_TRAVEL_PLAN, id: id || '' };
  }
}
