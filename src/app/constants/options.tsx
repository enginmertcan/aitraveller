import { CrownIcon, DollarSign, Tent, UserIcon, UserPlus2Icon, Users, Wallet } from "lucide-react";

export const AI_PROMPT = "Generate Travel Plan for Location :{location}, for {totalDays} Days for {traveller} with a {budget} budget, give me Hotels options list with best time to visit in JSON format.";
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