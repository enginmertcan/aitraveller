import { CrownIcon, DollarSign, Tent, UserIcon, UserPlus2Icon, Users, Wallet } from "lucide-react";

export const AI_PROMPT =
  `Generate a comprehensive travel plan in JSON format for a trip to {location} for {totalDays} Days, tailored for {traveller} with a {budget} budget. The traveler is from {residenceCountry} with {citizenship} citizenship.

Please include:
1. Daily itinerary with activities, timings, and costs
2. Hotel options with best time to visit
3. Cultural differences and recommendations:
   - Local customs and etiquette
   - Daily life differences
   - Food culture
   - Social norms and behavior
4. Visa and travel requirements:
   - Visa process and requirements
   - Application procedures
   - Fees
   - Required documents
5. Local life information:
   - Transportation guide
   - Emergency contacts
   - Currency and payment methods
   - Healthcare facilities
   - Communication and internet access

Format the response in JSON with clear sections for each category.`;
export const commonIconStyle = { width: "2.5rem", height: "2.5rem", strokeWidth: 1.5 };

export const companionOptions = [
  {
    title: "Tek Başına",
    description: "Özgür bir keşif deneyimi",
    icon: <UserIcon style={{ ...commonIconStyle, color: "#3B82F6" }} />,
    value: "solo",
    people: "1 Kişi",
  },
  {
    title: "Çift",
    description: "Romantik bir kaçamak",
    icon: <Users style={{ ...commonIconStyle, color: "#EC4899" }} />,
    value: "couple",
    people: "2 Kişi",
  },
  {
    title: "Aile",
    description: "Unutulmaz aile macerası",
    icon: <UserPlus2Icon style={{ ...commonIconStyle, color: "#10B981" }} />,
    value: "family",
    people: "3-5 Kişi",
  },
  {
    title: "Arkadaşlar",
    description: "Eğlenceli grup seyahati",
    icon: <Tent style={{ ...commonIconStyle, color: "#F59E0B" }} />,
    value: "friends",
    people: "5-10 Kişi",
  },
];

export const budgetOptions = [
  {
    title: "Ekonomik",
    description: "Bütçe dostu seyahat",
    icon: <Wallet style={{ ...commonIconStyle, color: "#10B981" }} />,
    value: "cheap",
  },
  {
    title: "Standart",
    description: "Dengeli harcama",
    icon: <DollarSign style={{ ...commonIconStyle, color: "#F59E0B" }} />,
    value: "moderate",
  },
  {
    title: "Lüks",
    description: "Premium deneyim",
    icon: <CrownIcon style={{ ...commonIconStyle, color: "#6366F1" }} />,
    value: "luxury",
  },
];
