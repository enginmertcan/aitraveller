import { TravelPlan } from "@/app/types/travel";

export async function fetchTravelPlans(userId: string): Promise<TravelPlan[]> {
  try {
    const response = await fetch(`/api/travel-plans?userId=${userId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch travel plans');
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw error;
  }
}