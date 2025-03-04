import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

import { db } from "../Service/firebaseConfig";
import { TravelPlan } from "../types/travel";

function parseItinerary(itineraryData: any) {
  if (typeof itineraryData === "string") {
    try {
      const parsed = JSON.parse(itineraryData);
      return {
        bestTimeToVisit: parsed.bestTimeToVisit || "Not specified",
        hotelOptions: parsed.hotelOptions || [],
        itinerary: parsed.itinerary || [],
      };
    } catch (e) {
      console.error("Error parsing itinerary:", e);
      return {
        bestTimeToVisit: "Not specified",
        hotelOptions: [],
        itinerary: [],
      };
    }
  }
  return {
    bestTimeToVisit: itineraryData?.bestTimeToVisit || "Not specified",
    hotelOptions: itineraryData?.hotelOptions || [],
    itinerary: itineraryData?.itinerary || [],
  };
}

function formatTravelPlan(docId: string, data: any): TravelPlan {
  const parsedItinerary = parseItinerary(data.itinerary);
  
  // Format itinerary based on different possible structures
  let formattedItinerary = [];
  if (Array.isArray(parsedItinerary.itinerary)) {
    formattedItinerary = parsedItinerary.itinerary;
  } else if (typeof parsedItinerary.itinerary === "object") {
    // Convert object format to array format
    formattedItinerary = Object.entries(parsedItinerary.itinerary)
      .map(([day, activities]) => ({
        day,
        ...(Array.isArray(activities) ? { plan: activities } : activities),
      }));
  }

  return {
    id: docId,
    destination: data.destination || "",
    duration: data.duration || "0 days",
    groupType: data.groupType || "Not specified",
    numberOfPeople: data.numberOfPeople || "Not specified",
    startDate: data.startDate || new Date().toISOString(),
    userId: data.userId || "",
    budget: data.budget || "Not specified",
    bestTimeToVisit: parsedItinerary.bestTimeToVisit,
    hotelOptions: parsedItinerary.hotelOptions,
    itinerary: formattedItinerary,
  };
}

export async function fetchUserTravelPlans(userId: string): Promise<TravelPlan[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const travelPlansRef = collection(db, "travelPlans");
    const q = query(travelPlansRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => formatTravelPlan(doc.id, doc.data()));
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw error;
  }
}

export async function fetchTravelPlanById(id: string): Promise<TravelPlan> {
  try {
    if (!id) {
      throw new Error("Travel plan ID is required");
    }

    const travelPlanRef = doc(db, "travelPlans", id);
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      throw new Error("Travel plan not found");
    }

    return formatTravelPlan(docSnap.id, docSnap.data());
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    throw error;
  }
}
