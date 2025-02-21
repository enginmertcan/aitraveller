export interface TravelFormState {
  city: {
    mainText: string;
    secondaryText: string;
    placeId: string;
  } | null;
  days: number;
  startDate: Date | null;
  budget: {
    value: string;
    title: string;
    description: string;
  } | null;
  companion: {
    value: string;
    title: string;
    description: string;
    people: string;
  } | null;
}
