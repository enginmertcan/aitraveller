import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../Service/firebaseConfig";
import { TravelPlan } from "../types/travel";

export async function fetchUserTravelPlans(userId: string): Promise<TravelPlan[]> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const travelPlansRef = collection(db, "travelPlans");
    const q = query(travelPlansRef, where("userId", "==", userId));

    console.log("Fetching plans for user:", userId);

    const querySnapshot = await getDocs(q);
    console.log("Found documents:", querySnapshot.size);

    const plans: TravelPlan[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log("Document data:", data);

      // Parse the itinerary string if it exists
      let parsedItinerary = data.itinerary;
      if (typeof data.itinerary === "string") {
        try {
          parsedItinerary = JSON.parse(data.itinerary);
        } catch (e) {
          console.error("Error parsing itinerary:", e);
          parsedItinerary = { hotelOptions: [], itinerary: [] };
        }
      }

      plans.push({
        id: doc.id,
        destination: data.destination,
        duration: data.duration,
        groupType: data.groupType,
        numberOfPeople: data.numberOfPeople,
        startDate: data.startDate,
        userId: data.userId,
        budget: data.budget,
        bestTimeToVisit: parsedItinerary.bestTimeToVisit || "",
        hotelOptions: parsedItinerary.hotelOptions || [],
        itinerary: parsedItinerary.itinerary || [],
      });
    });

    return plans;
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw error;
  }
}
