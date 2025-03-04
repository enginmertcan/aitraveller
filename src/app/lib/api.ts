import { TravelPlan } from "../types/travel";

export async function fetchTravelPlans(userId: string): Promise<TravelPlan[]> {
  try {
    const response = await fetch(`/api/travel-plans?userId=${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch travel plans");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw error;
  }
}
