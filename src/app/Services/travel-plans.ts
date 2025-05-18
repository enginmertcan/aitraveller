import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../Service/firebaseConfig";
import { TravelPlan, TripComment } from "../types/travel";
import { Budget, Expense } from "../types/budget";

// Koleksiyon referansları
const TRAVEL_PLANS_COLLECTION = "travelPlans";
const TRAVEL_PLANS_COMMENTS_COLLECTION = "travelPlans_comments";
const COMMENT_PHOTOS_COLLECTION = "commentPhotos";
const BUDGETS_COLLECTION = "budgets";
const EXPENSES_COLLECTION = "expenses";

// Default empty travel plan object
const DEFAULT_TRAVEL_PLAN: Partial<TravelPlan> = {
  id: "",
  destination: "",
  startDate: "",
  duration: "",
  days: 0,
  groupType: "",
  numberOfPeople: "",
  budget: "",
  isDomestic: false,
  residenceCountry: "",
  userId: "",
  isRecommended: false,
  itinerary: {},
  hotelOptions: [],
  bestTimeToVisit: "",
  // Cultural Differences
  culturalDifferences: "",
  lifestyleDifferences: "",
  foodCultureDifferences: "",
  socialNormsDifferences: "",
  // Visa and Travel Information
  visaRequirements: "",
  visaApplicationProcess: "",
  visaFees: "",
  travelDocumentChecklist: "",
  // Local Life Recommendations
  localTransportationGuide: "",
  emergencyContacts: "",
  currencyAndPayment: "",
  healthcareInfo: "",
  communicationInfo: "",
};

function safeParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return null;
  }
}

export function parseItinerary(data: any) {
  try {
    // Create a deep copy of the data to avoid mutations
    const parsedData = JSON.parse(JSON.stringify({ ...DEFAULT_TRAVEL_PLAN, ...data }));

    // Parse itinerary if it's a string
    if (typeof data.itinerary === "string") {
      const parsedItinerary = safeParseJSON(data.itinerary);
      if (!parsedItinerary) return parsedData;

      console.log("Parsed itinerary type:", typeof parsedItinerary);
      if (parsedItinerary) {
        console.log("Parsed itinerary keys:", Object.keys(parsedItinerary));
      }

      // Extract visaInfo, culturalDifferences, localTips, and bestTimeToVisit from the itinerary JSON string
      if (parsedItinerary && typeof parsedItinerary === "object") {
        // Extract bestTimeToVisit - AITravellerMobile ile uyumlu olması için
        if (parsedItinerary.bestTimeToVisit) {
          console.log("Found bestTimeToVisit in itinerary:", parsedItinerary.bestTimeToVisit);
          parsedData.bestTimeToVisit = parsedItinerary.bestTimeToVisit;
        }

        // Extract visaInfo
        if (parsedItinerary.visaInfo) {
          console.log("Found visaInfo in itinerary");
          parsedData.visaInfo = parsedItinerary.visaInfo;
        }

        // Extract culturalDifferences
        if (parsedItinerary.culturalDifferences) {
          console.log("Found culturalDifferences in itinerary");
          parsedData.culturalDifferences = parsedItinerary.culturalDifferences;
        }

        // Extract localTips
        if (parsedItinerary.localTips) {
          console.log("Found localTips in itinerary");
          parsedData.localTips = parsedItinerary.localTips;
        }
      }

      // Mobil uygulamadan gelen itinerary formatını kontrol et
      if (Array.isArray(parsedItinerary)) {
        // Doğrudan array formatı - günlük planlar dizisi
        console.log("Itinerary is an array with length:", parsedItinerary.length);
        parsedData.itinerary = parsedItinerary;
      }
      // Eğer itinerary.itinerary bir array ise (nested format)
      else if (parsedItinerary && parsedItinerary.itinerary && Array.isArray(parsedItinerary.itinerary)) {
        console.log("Itinerary has nested itinerary array with length:", parsedItinerary.itinerary.length);
        parsedData.itinerary = parsedItinerary.itinerary;
      }
      // Eğer itinerary bir obje ise ve içinde günlük planlar varsa (mobil uygulamadan gelen yeni format)
      else if (
        typeof parsedItinerary === "object" &&
        !Array.isArray(parsedItinerary) &&
        Object.keys(parsedItinerary).some(key => key.includes("Gün"))
      ) {
        console.log("Itinerary is an object with day keys");
        parsedData.itinerary = parsedItinerary;
      }
      // Diğer formatlar - obje olarak gelmiş olabilir
      else if (typeof parsedItinerary === "object") {
        console.log("Itinerary is a generic object");
        parsedData.itinerary = parsedItinerary;
      }

      // Eğer hotelOptions varsa onu da çıkar
      if (parsedItinerary && parsedItinerary.hotelOptions && Array.isArray(parsedItinerary.hotelOptions)) {
        console.log("Found hotelOptions in itinerary with length:", parsedItinerary.hotelOptions.length);
        parsedData.hotelOptions = parsedItinerary.hotelOptions;
      }
    }

    // Parse culturalDifferences if it's a string
    if (typeof data.culturalDifferences === "string") {
      try {
        const parsedCulturalDifferences = safeParseJSON(data.culturalDifferences);
        if (parsedCulturalDifferences && typeof parsedCulturalDifferences === "object") {
          parsedData.culturalDifferences = parsedCulturalDifferences;

          // Extract individual fields from culturalDifferences for compatibility
          if (parsedCulturalDifferences.lifestyleDifferences) {
            parsedData.lifestyleDifferences = parsedCulturalDifferences.lifestyleDifferences;
          }
          if (parsedCulturalDifferences.foodCultureDifferences) {
            parsedData.foodCultureDifferences = parsedCulturalDifferences.foodCultureDifferences;
          }
          if (parsedCulturalDifferences.socialNormsDifferences) {
            parsedData.socialNormsDifferences = parsedCulturalDifferences.socialNormsDifferences;
          }
        }
      } catch (error) {
        console.error("Error parsing culturalDifferences:", error);
      }
    }

    // Parse localTips if it's a string
    if (typeof data.localTips === "string") {
      try {
        const parsedLocalTips = safeParseJSON(data.localTips);
        if (parsedLocalTips && typeof parsedLocalTips === "object") {
          parsedData.localTips = parsedLocalTips;

          // Extract individual fields from localTips for compatibility
          if (parsedLocalTips.localTransportationGuide) {
            parsedData.localTransportationGuide = parsedLocalTips.localTransportationGuide;
          }
          if (parsedLocalTips.emergencyContacts) {
            parsedData.emergencyContacts = parsedLocalTips.emergencyContacts;
          }
          if (parsedLocalTips.currencyAndPayment) {
            parsedData.currencyAndPayment = parsedLocalTips.currencyAndPayment;
          }
          if (parsedLocalTips.healthcareInfo) {
            parsedData.healthcareInfo = parsedLocalTips.healthcareInfo;
          }
          if (parsedLocalTips.communicationInfo) {
            parsedData.communicationInfo = parsedLocalTips.communicationInfo;
          }
          if (parsedLocalTips.localCuisineAndFoodTips) {
            parsedData.localCuisineAndFoodTips = parsedLocalTips.localCuisineAndFoodTips;
          }
          if (parsedLocalTips.safetyTips) {
            parsedData.safetyTips = parsedLocalTips.safetyTips;
          }
          if (parsedLocalTips.localLanguageAndCommunicationTips) {
            parsedData.localLanguageAndCommunicationTips = parsedLocalTips.localLanguageAndCommunicationTips;
          }
        }
      } catch (error) {
        console.error("Error parsing localTips:", error);
      }
    }

    // Parse visaInfo if it's a string
    if (typeof data.visaInfo === "string") {
      try {
        const parsedVisaInfo = safeParseJSON(data.visaInfo);
        if (parsedVisaInfo && typeof parsedVisaInfo === "object") {
          parsedData.visaInfo = parsedVisaInfo;

          // Extract individual fields from visaInfo for compatibility
          if (parsedVisaInfo.visaRequirement) {
            parsedData.visaRequirements = parsedVisaInfo.visaRequirement;
          }
          if (parsedVisaInfo.visaApplicationProcess) {
            parsedData.visaApplicationProcess = parsedVisaInfo.visaApplicationProcess;
          }
          if (parsedVisaInfo.visaFee) {
            parsedData.visaFees = parsedVisaInfo.visaFee;
          }
          if (parsedVisaInfo.requiredDocuments) {
            parsedData.travelDocumentChecklist = parsedVisaInfo.requiredDocuments;
          }
        }
      } catch (error) {
        console.error("Error parsing visaInfo:", error);
      }
    }

    // Parse hotelOptions if it's a string
    if (typeof data.hotelOptions === "string") {
      try {
        const parsedHotelOptions = safeParseJSON(data.hotelOptions);
        if (Array.isArray(parsedHotelOptions)) {
          parsedData.hotelOptions = parsedHotelOptions;
        }
      } catch (error) {
        console.error("Error parsing hotelOptions:", error);
      }
    }

    // Parse tripSummary if it's a string
    if (typeof data.tripSummary === "string") {
      try {
        const parsedTripSummary = safeParseJSON(data.tripSummary);
        if (parsedTripSummary && typeof parsedTripSummary === "object") {
          parsedData.tripSummary = parsedTripSummary;
        }
      } catch (error) {
        console.error("Error parsing tripSummary:", error);
      }
    }

    // Parse destinationInfo if it's a string
    if (typeof data.destinationInfo === "string") {
      try {
        const parsedDestinationInfo = safeParseJSON(data.destinationInfo);
        if (parsedDestinationInfo && typeof parsedDestinationInfo === "object") {
          parsedData.destinationInfo = parsedDestinationInfo;

          // AITravellerMobile ile uyumlu olması için bestTimeToVisit alanını da çıkar
          if (parsedDestinationInfo.bestTimeToVisit && (!parsedData.bestTimeToVisit || parsedData.bestTimeToVisit === "Not specified")) {
            console.log("Found bestTimeToVisit in destinationInfo:", parsedDestinationInfo.bestTimeToVisit);
            parsedData.bestTimeToVisit = parsedDestinationInfo.bestTimeToVisit;
          }
        }
      } catch (error) {
        console.error("Error parsing destinationInfo:", error);
      }
    }

    return parsedData;
  } catch (error) {
    console.error("Error in parseItinerary:", error);
    return { ...DEFAULT_TRAVEL_PLAN, ...data };
  }
}

export function formatTravelPlan(data: any): Partial<TravelPlan> {
  try {
    const parsedData = parseItinerary(data);

    // Ensure all required fields exist with proper types
    const formattedPlan = {
      ...DEFAULT_TRAVEL_PLAN,
      ...parsedData,
      id: data?.id || DEFAULT_TRAVEL_PLAN.id,
      days: typeof parsedData.days === "number" ? parsedData.days : DEFAULT_TRAVEL_PLAN.days,
      isDomestic: typeof parsedData.isDomestic === "boolean" ? parsedData.isDomestic : DEFAULT_TRAVEL_PLAN.isDomestic,
    };

    // Temel alanları kontrol et ve düzenle
    // bestTimeToVisit alanını işle - AITravellerMobile ile aynı mantığı kullan
    console.log("İşlenmeden önce bestTimeToVisit:", formattedPlan.bestTimeToVisit);

    // 1. Önce doğrudan bestTimeToVisit alanını kontrol et
    let bestTimeToVisit = formattedPlan.bestTimeToVisit;

    // 2. Eğer bestTimeToVisit boşsa veya "Not specified" ise, destinationInfo içinde ara
    if (!bestTimeToVisit || bestTimeToVisit === "Not specified") {
      console.log("bestTimeToVisit boş, destinationInfo içinde aranıyor...");

      if (formattedPlan.destinationInfo) {
        if (typeof formattedPlan.destinationInfo === 'string') {
          try {
            const destinationInfo = safeParseJSON(formattedPlan.destinationInfo);
            if (destinationInfo && destinationInfo.bestTimeToVisit) {
              bestTimeToVisit = destinationInfo.bestTimeToVisit;
              console.log("destinationInfo string içinde bestTimeToVisit bulundu:", bestTimeToVisit);
            }
          } catch (error) {
            console.error('destinationInfo parse hatası:', error);
          }
        } else if (typeof formattedPlan.destinationInfo === 'object' &&
                  formattedPlan.destinationInfo.bestTimeToVisit) {
          bestTimeToVisit = formattedPlan.destinationInfo.bestTimeToVisit;
          console.log("destinationInfo object içinde bestTimeToVisit bulundu:", bestTimeToVisit);
        }
      }
    }

    // 3. Eğer itinerary içinde bestTimeToVisit varsa, onu kullan
    if ((!bestTimeToVisit || bestTimeToVisit === "Not specified") &&
        formattedPlan.itinerary && typeof formattedPlan.itinerary === 'string') {
      console.log("bestTimeToVisit hala boş, itinerary içinde aranıyor...");

      try {
        const parsedItinerary = safeParseJSON(formattedPlan.itinerary);
        if (parsedItinerary && parsedItinerary.bestTimeToVisit) {
          bestTimeToVisit = parsedItinerary.bestTimeToVisit;
          console.log("itinerary içinde bestTimeToVisit bulundu:", bestTimeToVisit);
        }
      } catch (error) {
        console.error('itinerary parse hatası:', error);
      }
    }

    // 4. Hala boşsa, mevsimsel bir varsayılan değer ata
    if (!bestTimeToVisit || bestTimeToVisit === "Not specified") {
      console.log("bestTimeToVisit hala boş, varsayılan değer atanıyor...");

      const destination = formattedPlan.destination || '';
      if (destination.includes('Türkiye') || destination.includes('Turkey')) {
        bestTimeToVisit = 'İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları';
      } else {
        bestTimeToVisit = 'İlkbahar ve Sonbahar ayları';
      }
      console.log("Varsayılan bestTimeToVisit atandı:", bestTimeToVisit);
    }

    // 5. Son değeri formattedPlan'a ata
    formattedPlan.bestTimeToVisit = bestTimeToVisit;
    console.log("Son bestTimeToVisit değeri:", formattedPlan.bestTimeToVisit);

    if (typeof formattedPlan.duration === "number") {
      formattedPlan.duration = `${formattedPlan.duration} days`;
    }

    if (!formattedPlan.country && formattedPlan.destination) {
      // Destinasyondan ülke bilgisini çıkarmaya çalış
      const parts = formattedPlan.destination.split(",");
      if (parts.length > 1) {
        formattedPlan.country = parts[parts.length - 1].trim();
      }
    }

    // Mobil uygulamayla uyumlu olması için eksik alanları tamamla
    if (!formattedPlan.citizenship) {
      formattedPlan.citizenship = "Turkey";
    }

    if (!formattedPlan.residenceCountry) {
      formattedPlan.residenceCountry = "Turkey";
    }

    // Web uygulamasından oluşturulan seyahat planları için culturalDifferences oluştur
    if (
      !formattedPlan.culturalDifferences &&
      (formattedPlan.lifestyleDifferences ||
        formattedPlan.foodCultureDifferences ||
        formattedPlan.socialNormsDifferences)
    ) {
      console.log("Creating culturalDifferences object from individual fields");
      formattedPlan.culturalDifferences = {
        culturalDifferences: "Belirtilmemiş",
        lifestyleDifferences: formattedPlan.lifestyleDifferences || "Belirtilmemiş",
        foodCultureDifferences: formattedPlan.foodCultureDifferences || "Belirtilmemiş",
        socialNormsDifferences: formattedPlan.socialNormsDifferences || "Belirtilmemiş",
        religiousAndCulturalSensitivities: "Belirtilmemiş",
        localTraditionsAndCustoms: "Belirtilmemiş",
        culturalEventsAndFestivals: "Belirtilmemiş",
        localCommunicationTips: "Belirtilmemiş",
      };
    }

    // Web uygulamasından oluşturulan seyahat planları için visaInfo oluştur
    if (
      !formattedPlan.visaInfo &&
      (formattedPlan.visaRequirements || formattedPlan.visaApplicationProcess || formattedPlan.travelDocumentChecklist)
    ) {
      console.log("Creating visaInfo object from individual fields");
      formattedPlan.visaInfo = {
        visaRequirement: formattedPlan.visaRequirements || "",
        visaApplicationProcess: formattedPlan.visaApplicationProcess || "",
        requiredDocuments: Array.isArray(formattedPlan.travelDocumentChecklist)
          ? formattedPlan.travelDocumentChecklist
          : formattedPlan.travelDocumentChecklist
            ? [formattedPlan.travelDocumentChecklist]
            : [],
        visaFee: formattedPlan.visaFees || "0 TL",
        visaProcessingTime: "Belirtilmemiş",
        visaApplicationCenters: ["Belirtilmemiş"],
        passportRequirements: "Geçerli pasaport",
        passportValidityRequirements: "Seyahat bitiş tarihinden sonra en az 6 ay",
        importantNotes: "Belirtilmemiş",
        emergencyContacts: {
          ambulance: "112",
          police: "155",
          jandarma: "156",
        },
      };
    }

    // Web uygulamasından oluşturulan seyahat planları için localTips oluştur
    if (
      !formattedPlan.localTips &&
      (formattedPlan.localTransportationGuide ||
        formattedPlan.emergencyContacts ||
        formattedPlan.currencyAndPayment ||
        formattedPlan.healthcareInfo ||
        formattedPlan.communicationInfo)
    ) {
      console.log("Creating localTips object from individual fields");
      formattedPlan.localTips = {
        localTransportationGuide: formattedPlan.localTransportationGuide || "Belirtilmemiş",
        emergencyContacts: formattedPlan.emergencyContacts || { ambulance: "112", police: "155", jandarma: "156" },
        currencyAndPayment: formattedPlan.currencyAndPayment || "Belirtilmemiş",
        healthcareInfo: formattedPlan.healthcareInfo || "Belirtilmemiş",
        communicationInfo: formattedPlan.communicationInfo || "Belirtilmemiş",
        localCuisineAndFoodTips: formattedPlan.localCuisineAndFoodTips || "Belirtilmemiş",
        safetyTips: formattedPlan.safetyTips || "Belirtilmemiş",
        localLanguageAndCommunicationTips: formattedPlan.localLanguageAndCommunicationTips || "Belirtilmemiş",
      };
    }

    // Karmaşık nesneleri JSON string'e dönüştür
    // Bu, web uygulamasının mobil uygulamayla aynı formatta veri almasını sağlar
    const complexObjectsToStringify = [
      "culturalDifferences",
      "localTips",
      "visaInfo",
      "tripSummary",
      "destinationInfo",
    ];

    // bestTimeToVisit alanını itinerary içine de ekle - AITravellerMobile ile uyumlu olması için
    if (formattedPlan.itinerary && typeof formattedPlan.itinerary === "object") {
      const itineraryObj = formattedPlan.itinerary as any;

      // bestTimeToVisit alanını itinerary içine ekle
      if (formattedPlan.bestTimeToVisit && formattedPlan.bestTimeToVisit !== "Not specified") {
        console.log("Adding bestTimeToVisit to itinerary:", formattedPlan.bestTimeToVisit);
        itineraryObj.bestTimeToVisit = formattedPlan.bestTimeToVisit;
      }
    }

    // Önce bu alanları itinerary'den çıkaralım (eğer varsa)
    if (formattedPlan.itinerary && typeof formattedPlan.itinerary === "object") {
      const itineraryObj = formattedPlan.itinerary as any;

      // visaInfo, culturalDifferences ve localTips alanlarını itinerary'den çıkar
      // ve üst seviye alanlara taşı (eğer üst seviyede yoksa)
      if (itineraryObj.visaInfo && !formattedPlan.visaInfo) {
        console.log("Moving visaInfo from itinerary to top level");
        formattedPlan.visaInfo = itineraryObj.visaInfo;
        delete itineraryObj.visaInfo;
      }

      if (itineraryObj.culturalDifferences && !formattedPlan.culturalDifferences) {
        console.log("Moving culturalDifferences from itinerary to top level");
        formattedPlan.culturalDifferences = itineraryObj.culturalDifferences;
        delete itineraryObj.culturalDifferences;
      }

      if (itineraryObj.localTips && !formattedPlan.localTips) {
        console.log("Moving localTips from itinerary to top level");
        formattedPlan.localTips = itineraryObj.localTips;
        delete itineraryObj.localTips;
      }

      // bestTimeToVisit alanını itinerary'den çıkar (eğer varsa)
      if (itineraryObj.bestTimeToVisit && (!formattedPlan.bestTimeToVisit || formattedPlan.bestTimeToVisit === "Not specified")) {
        console.log("Moving bestTimeToVisit from itinerary to top level:", itineraryObj.bestTimeToVisit);
        formattedPlan.bestTimeToVisit = itineraryObj.bestTimeToVisit;
        // bestTimeToVisit'i silme, hem itinerary'de hem de üst seviyede olsun
      }
    }

    complexObjectsToStringify.forEach(field => {
      if (formattedPlan[field] && typeof formattedPlan[field] === "object") {
        try {
          formattedPlan[field] = JSON.stringify(formattedPlan[field]);
          console.log(`${field} field converted to JSON string`);
        } catch (error) {
          console.error(`Error converting ${field} to JSON string:`, error);
          formattedPlan[field] = "{}";
        }
      }
    });

    // hotelOptions'ı JSON string'e dönüştür
    if (formattedPlan.hotelOptions && Array.isArray(formattedPlan.hotelOptions)) {
      try {
        formattedPlan.hotelOptions = JSON.stringify(formattedPlan.hotelOptions);
        console.log("hotelOptions converted to JSON string");
      } catch (error) {
        console.error("Error converting hotelOptions to JSON string:", error);
        formattedPlan.hotelOptions = "[]";
      }
    }

    // itinerary'yi JSON string'e dönüştür
    if (
      formattedPlan.itinerary &&
      (Array.isArray(formattedPlan.itinerary) || typeof formattedPlan.itinerary === "object")
    ) {
      try {
        // Ensure bestTimeToVisit is included in the itinerary object before stringifying
        if (typeof formattedPlan.itinerary === "object" && !Array.isArray(formattedPlan.itinerary)) {
          const itineraryObj = formattedPlan.itinerary as any;
          if (formattedPlan.bestTimeToVisit && formattedPlan.bestTimeToVisit !== "Not specified") {
            console.log("Adding bestTimeToVisit to itinerary before stringifying:", formattedPlan.bestTimeToVisit);
            itineraryObj.bestTimeToVisit = formattedPlan.bestTimeToVisit;
          }
        }

        formattedPlan.itinerary = JSON.stringify(formattedPlan.itinerary);
        console.log("itinerary converted to JSON string");
      } catch (error) {
        console.error("Error converting itinerary to JSON string:", error);
        formattedPlan.itinerary = "[]";
      }
    }

    return formattedPlan;
  } catch (error) {
    console.error("Error formatting travel plan:", error);
    return { ...DEFAULT_TRAVEL_PLAN, id: data?.id || "" };
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

    // Her bir plan için özel işleme yap
    const plans = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const rawData = doc.data();

        // Özel işleme: itinerary içindeki visaInfo, culturalDifferences, localTips ve bestTimeToVisit alanlarını çıkar
        if (rawData.itinerary && typeof rawData.itinerary === "string") {
          try {
            const parsedItinerary = safeParseJSON(rawData.itinerary);
            if (parsedItinerary && typeof parsedItinerary === "object") {
              // bestTimeToVisit alanını itinerary'den çıkar - AITravellerMobile ile uyumlu olması için
              if (parsedItinerary.bestTimeToVisit) {
                console.log("Extracting bestTimeToVisit from itinerary:", parsedItinerary.bestTimeToVisit);
                // Her zaman itinerary'deki değeri kullan, daha güncel olabilir
                rawData.bestTimeToVisit = parsedItinerary.bestTimeToVisit;
              }

              // visaInfo, culturalDifferences ve localTips alanlarını itinerary'den çıkar
              // ve üst seviye alanlara taşı
              if (parsedItinerary.visaInfo && !rawData.visaInfo) {
                console.log("Extracting visaInfo from itinerary");
                rawData.visaInfo = parsedItinerary.visaInfo;
              }

              if (parsedItinerary.culturalDifferences && !rawData.culturalDifferences) {
                console.log("Extracting culturalDifferences from itinerary");
                rawData.culturalDifferences = parsedItinerary.culturalDifferences;
              }

              if (parsedItinerary.localTips && !rawData.localTips) {
                console.log("Extracting localTips from itinerary");
                rawData.localTips = parsedItinerary.localTips;
              }
            }
          } catch (error) {
            console.error("Error parsing itinerary:", error);
          }
        }

        // Eğer bestTimeToVisit hala boşsa veya "Not specified" ise, varsayılan bir değer ata
        if (!rawData.bestTimeToVisit || rawData.bestTimeToVisit === "Not specified") {
          console.log("Setting default bestTimeToVisit for mobile compatibility");
          const destination = rawData.destination || '';
          if (destination.includes('İstanbul') || destination.includes('Istanbul')) {
            rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
          } else if (destination.includes('Antalya') || destination.includes('Muğla') || destination.includes('Bodrum')) {
            rawData.bestTimeToVisit = "Yaz ayları (Haziran-Eylül)";
          } else if (destination.includes('Türkiye') || destination.includes('Turkey')) {
            rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
          } else {
            rawData.bestTimeToVisit = "İlkbahar ve Sonbahar ayları";
          }
        }

        return formatTravelPlan({ ...rawData, id: doc.id });
      })
    );

    // Sadece geçerli planları döndür
    return plans.filter(plan => plan.id && plan.destination);
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

    const travelPlanRef = doc(db, TRAVEL_PLANS_COLLECTION, id);
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      console.warn("Travel plan not found:", id);
      return { ...DEFAULT_TRAVEL_PLAN, id };
    }

    const rawData = docSnap.data();
    console.log("Raw data from Firebase:", rawData);

    // Özel işleme: itinerary içindeki visaInfo, culturalDifferences, localTips ve bestTimeToVisit alanlarını çıkar
    if (rawData.itinerary && typeof rawData.itinerary === "string") {
      try {
        const parsedItinerary = safeParseJSON(rawData.itinerary);
        if (parsedItinerary && typeof parsedItinerary === "object") {
          // bestTimeToVisit alanını itinerary'den çıkar - AITravellerMobile ile uyumlu olması için
          if (parsedItinerary.bestTimeToVisit) {
            console.log("Extracting bestTimeToVisit from itinerary:", parsedItinerary.bestTimeToVisit);
            // Her zaman itinerary'deki değeri kullan, daha güncel olabilir
            rawData.bestTimeToVisit = parsedItinerary.bestTimeToVisit;
          }

          // visaInfo, culturalDifferences ve localTips alanlarını itinerary'den çıkar
          // ve üst seviye alanlara taşı
          if (parsedItinerary.visaInfo && !rawData.visaInfo) {
            console.log("Extracting visaInfo from itinerary");
            rawData.visaInfo = parsedItinerary.visaInfo;
          }

          if (parsedItinerary.culturalDifferences && !rawData.culturalDifferences) {
            console.log("Extracting culturalDifferences from itinerary");
            rawData.culturalDifferences = parsedItinerary.culturalDifferences;
          }

          if (parsedItinerary.localTips && !rawData.localTips) {
            console.log("Extracting localTips from itinerary");
            rawData.localTips = parsedItinerary.localTips;
          }
        }
      } catch (error) {
        console.error("Error parsing itinerary:", error);
      }
    }

    // Eğer bestTimeToVisit hala boşsa veya "Not specified" ise, varsayılan bir değer ata
    if (!rawData.bestTimeToVisit || rawData.bestTimeToVisit === "Not specified") {
      console.log("Setting default bestTimeToVisit for mobile compatibility");
      const destination = rawData.destination || '';
      if (destination.includes('İstanbul') || destination.includes('Istanbul')) {
        rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
      } else if (destination.includes('Antalya') || destination.includes('Muğla') || destination.includes('Bodrum')) {
        rawData.bestTimeToVisit = "Yaz ayları (Haziran-Eylül)";
      } else if (destination.includes('Türkiye') || destination.includes('Turkey')) {
        rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
      } else {
        rawData.bestTimeToVisit = "İlkbahar ve Sonbahar ayları";
      }
    }

    const formattedPlan = formatTravelPlan({ ...rawData, id: docSnap.id });
    console.log("Formatted travel plan:", formattedPlan);
    return formattedPlan;
  } catch (error) {
    console.error("Error fetching travel plan:", error);
    return { ...DEFAULT_TRAVEL_PLAN, id: id || "" };
  }
}

/**
 * Yorum fotoğrafları servisi
 */
export const CommentPhotoService = {
  /**
   * Yorum fotoğrafı ekler
   */
  async addCommentPhoto(commentId: string, travelPlanId: string, photoData: string, photoLocation?: string): Promise<string> {
    try {
      console.log(`Yorum fotoğrafı ekleniyor: ${commentId}`);

      if (!commentId?.trim() || !travelPlanId?.trim()) {
        console.warn("Geçersiz yorum ID'si veya seyahat planı ID'si");
        throw new Error("Geçersiz yorum ID'si veya seyahat planı ID'si");
      }

      // Base64 verisi boş mu kontrol et
      if (!photoData?.trim()) {
        console.warn("Geçersiz fotoğraf verisi");
        throw new Error("Geçersiz fotoğraf verisi");
      }

      // Fotoğraf ID'si oluştur
      const photoId = `photo_${commentId}_${new Date().getTime()}`;

      // Base64 formatını kontrol et ve düzelt
      let processedPhotoData = photoData;

      // Eğer data:image ile başlamıyorsa, ekle
      if (!processedPhotoData.startsWith('data:image')) {
        processedPhotoData = `data:image/jpeg;base64,${processedPhotoData}`;
        console.log('Base64 verisi data:image formatına dönüştürüldü');
      }

      // Fotoğraf verilerini hazırla
      const photoInfo = {
        id: photoId,
        commentId,
        travelPlanId,
        photoData: processedPhotoData,
        photoLocation: photoLocation || "",
        uploadedAt: serverTimestamp()
      };

      // Firestore'a ekle
      const photoDocRef = doc(db, COMMENT_PHOTOS_COLLECTION, photoId);
      await setDoc(photoDocRef, photoInfo);

      console.log('Yorum fotoğrafı başarıyla eklendi, ID:', photoId);
      return photoId;
    } catch (error) {
      console.error("Yorum fotoğrafı ekleme hatası:", error);
      throw error;
    }
  },

  /**
   * Yorum ID'sine göre fotoğrafları getirir
   */
  async getPhotosByCommentId(commentId: string): Promise<any[]> {
    try {
      console.log(`Yorum fotoğrafları getiriliyor: ${commentId}`);

      if (!commentId?.trim()) {
        console.warn("Geçersiz yorum ID'si");
        return [];
      }

      const photosRef = collection(db, COMMENT_PHOTOS_COLLECTION);
      const q = query(
        photosRef,
        where("commentId", "==", commentId)
      );

      const querySnapshot = await getDocs(q);
      console.log(`${querySnapshot.size} yorum fotoğrafı bulundu`);

      const photos: any[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        photos.push({
          ...data,
          id: doc.id
        });
      });

      return photos;
    } catch (error) {
      console.error("Yorum fotoğrafları getirme hatası:", error);
      return [];
    }
  },

  /**
   * Seyahat planı ID'sine göre tüm yorum fotoğraflarını getirir
   */
  async getPhotosByTravelPlanId(travelPlanId: string): Promise<any[]> {
    try {
      console.log(`Seyahat planı yorum fotoğrafları getiriliyor: ${travelPlanId}`);

      if (!travelPlanId?.trim()) {
        console.warn("Geçersiz seyahat planı ID'si");
        return [];
      }

      const photosRef = collection(db, COMMENT_PHOTOS_COLLECTION);
      const q = query(
        photosRef,
        where("travelPlanId", "==", travelPlanId)
      );

      const querySnapshot = await getDocs(q);
      console.log(`${querySnapshot.size} yorum fotoğrafı bulundu`);

      const photos: any[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        photos.push({
          ...data,
          id: doc.id
        });
      });

      return photos;
    } catch (error) {
      console.error("Seyahat planı yorum fotoğrafları getirme hatası:", error);
      return [];
    }
  },

  /**
   * Yorum fotoğrafını siler
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      console.log(`Yorum fotoğrafı siliniyor: ${photoId}`);

      if (!photoId?.trim()) {
        console.warn("Geçersiz fotoğraf ID'si");
        return false;
      }

      const photoRef = doc(db, COMMENT_PHOTOS_COLLECTION, photoId);
      await deleteDoc(photoRef);

      console.log('Yorum fotoğrafı silindi:', photoId);
      return true;
    } catch (error) {
      console.error("Yorum fotoğrafı silme hatası:", error);
      return false;
    }
  }
};

/**
 * Bir seyahat planına ait yorumları getirir
 */
export async function fetchCommentsByTravelPlanId(travelPlanId: string): Promise<TripComment[]> {
  try {
    console.log(`Fetching comments for travel plan: ${travelPlanId}`);

    if (!travelPlanId?.trim()) {
      console.warn("Invalid travel plan ID provided");
      return [];
    }

    const commentsRef = collection(db, TRAVEL_PLANS_COMMENTS_COLLECTION);
    const q = query(commentsRef, where("travelPlanId", "==", travelPlanId));

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} comments`);

    const comments: TripComment[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();

      // Convert Timestamp to Date string
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString();

      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt;

      comments.push({
        ...(data as TripComment),
        id: doc.id,
        createdAt,
        updatedAt,
      });
    });

    // 2. Sonra bu seyahat planına ait tüm yorum fotoğraflarını getir
    console.log(`Yorum fotoğrafları getiriliyor...`);
    const photos = await CommentPhotoService.getPhotosByTravelPlanId(travelPlanId);
    console.log(`${photos.length} yorum fotoğrafı bulundu`);

    // 3. Her yoruma ait fotoğrafları eşleştir
    if (photos.length > 0) {
      comments.forEach(comment => {
        // Bu yoruma ait fotoğrafı bul
        const commentPhoto = photos.find(photo => photo.commentId === comment.id);

        if (commentPhoto) {
          console.log(`Yorum ${comment.id} için fotoğraf bulundu`);

          // Fotoğraf verilerini kontrol et
          if (commentPhoto.photoData) {
            console.log(`Fotoğraf verisi formatı: ${commentPhoto.photoData.substring(0, 30)}...`);

            // Fotoğraf verisi data:image ile başlıyor mu kontrol et
            if (!commentPhoto.photoData.startsWith('data:image')) {
              console.log('Fotoğraf verisi data:image formatında değil, düzeltiliyor...');
              commentPhoto.photoData = `data:image/jpeg;base64,${commentPhoto.photoData}`;
            }
          } else {
            console.log('Fotoğraf verisi bulunamadı veya boş');
          }

          // Fotoğraf verilerini yoruma ekle
          comment.photoData = commentPhoto.photoData;
          comment.photoLocation = commentPhoto.photoLocation;
        }
      });
    }

    // Sort comments by date (newest first)
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

/**
 * Yeni bir yorum ekler
 */
export async function addComment(comment: Omit<TripComment, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    console.log(`Adding comment for travel plan: ${comment.travelPlanId}`);

    if (!comment.travelPlanId?.trim() || !comment.userId?.trim()) {
      console.warn("Invalid travel plan ID or user ID");
      throw new Error("Invalid travel plan ID or user ID");
    }

    // Fotoğraf verilerini geçici olarak sakla
    const photoData = comment.photoData;
    const photoLocation = comment.photoLocation;

    // Yorum nesnesinden fotoğraf verilerini çıkar (ayrı koleksiyona taşıyacağız)
    delete comment.photoData;
    delete comment.photoUrl;
    delete comment.photoLocation;

    const commentsRef = collection(db, TRAVEL_PLANS_COMMENTS_COLLECTION);

    // Add timestamp
    const commentWithTimestamp = {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Add to Firestore
    const docRef = await addDoc(commentsRef, commentWithTimestamp);
    const commentId = docRef.id;
    console.log("Comment added:", commentId);

    // Eğer fotoğraf verisi varsa, ayrı koleksiyona ekle
    if (photoData && photoData.trim() !== '') {
      try {
        console.log(`Fotoğraf verisi var, uzunluk: ${photoData.length}`);
        console.log(`Fotoğraf ayrı koleksiyona ekleniyor...`);

        // CommentPhotoService kullanarak fotoğrafı ekle
        await CommentPhotoService.addCommentPhoto(
          commentId,
          comment.travelPlanId,
          photoData,
          photoLocation
        );

        console.log(`Fotoğraf başarıyla ayrı koleksiyona eklendi`);
      } catch (photoError) {
        console.error(`Fotoğraf ekleme hatası:`, photoError);
        // Fotoğraf eklenemese bile yorumu silmiyoruz
      }
    }

    return commentId;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

/**
 * Bir yorumu günceller
 */
export async function updateComment(id: string, comment: Partial<TripComment>): Promise<boolean> {
  try {
    console.log(`Updating comment: ${id}`);

    if (!id?.trim()) {
      console.warn("Invalid comment ID");
      return false;
    }

    // Fotoğraf verilerini geçici olarak sakla
    const photoData = comment.photoData;
    const photoLocation = comment.photoLocation;

    // Yorum nesnesinden fotoğraf verilerini çıkar (ayrı koleksiyona taşıyacağız)
    delete comment.photoData;
    delete comment.photoUrl;
    delete comment.photoLocation;

    const commentRef = doc(db, TRAVEL_PLANS_COMMENTS_COLLECTION, id);

    // Add updatedAt timestamp
    const updateData = {
      ...comment,
      updatedAt: serverTimestamp(),
    };

    // Remove ID (already exists as document ID in Firestore)
    if ("id" in updateData) {
      delete updateData.id;
    }

    await updateDoc(commentRef, updateData);
    console.log("Comment updated:", id);

    // Eğer fotoğraf verisi varsa, ayrı koleksiyonda güncelle veya ekle
    if (photoData && photoData.trim() !== '') {
      try {
        console.log(`Fotoğraf verisi var, uzunluk: ${photoData.length}`);

        // Önce bu yoruma ait mevcut fotoğrafları getir
        const existingPhotos = await CommentPhotoService.getPhotosByCommentId(id);

        if (existingPhotos.length > 0) {
          // Mevcut fotoğraf varsa güncelle
          console.log(`Mevcut fotoğraf bulundu, güncelleniyor...`);

          // Mevcut fotoğrafı sil
          await CommentPhotoService.deletePhoto(existingPhotos[0].id);
        }

        // Yeni fotoğrafı ekle
        console.log(`Fotoğraf ayrı koleksiyona ekleniyor...`);

        // CommentPhotoService kullanarak fotoğrafı ekle
        await CommentPhotoService.addCommentPhoto(
          id,
          comment.travelPlanId || existingPhotos[0]?.travelPlanId,
          photoData,
          photoLocation
        );

        console.log(`Fotoğraf başarıyla ayrı koleksiyona eklendi`);
      } catch (photoError) {
        console.error(`Fotoğraf güncelleme hatası:`, photoError);
        // Fotoğraf güncellenemese bile yorumu silmiyoruz
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating comment:", error);
    return false;
  }
}

/**
 * Bir yorumu siler
 */
export async function deleteComment(id: string): Promise<boolean> {
  try {
    console.log(`Deleting comment: ${id}`);

    if (!id?.trim()) {
      console.warn("Invalid comment ID");
      return false;
    }

    // Önce bu yoruma ait fotoğrafları getir
    try {
      console.log(`Yorum fotoğrafları kontrol ediliyor...`);
      const photos = await CommentPhotoService.getPhotosByCommentId(id);

      // Fotoğrafları sil
      if (photos.length > 0) {
        console.log(`${photos.length} yorum fotoğrafı bulundu, siliniyor...`);

        for (const photo of photos) {
          await CommentPhotoService.deletePhoto(photo.id);
          console.log(`Fotoğraf silindi: ${photo.id}`);
        }
      }
    } catch (photoError) {
      console.error(`Fotoğraf silme hatası:`, photoError);
      // Fotoğraflar silinemese bile yorumu silmeye devam et
    }

    // Yorumu sil
    const commentRef = doc(db, TRAVEL_PLANS_COMMENTS_COLLECTION, id);
    await deleteDoc(commentRef);
    console.log("Comment deleted:", id);

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}

/**
 * Bir seyahat planını önerilen olarak işaretler veya öneriden kaldırır
 * Sadece planı oluşturan kullanıcı bu işlemi yapabilir
 */
export async function toggleRecommendation(id: string, isRecommended: boolean, currentUserId?: string): Promise<boolean> {
  try {
    console.log(`${isRecommended ? "Recommending" : "Unrecommending"} travel plan: ${id}`);

    if (!id?.trim()) {
      console.warn("Invalid travel plan ID");
      return false;
    }

    const travelPlanRef = doc(db, TRAVEL_PLANS_COLLECTION, id);

    // Önce planı getir ve kullanıcı kontrolü yap
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      console.warn("Travel plan not found:", id);
      return false;
    }

    const planData = docSnap.data();

    // Eğer currentUserId verilmişse ve plan sahibi değilse işlemi reddet
    if (currentUserId && planData.userId !== currentUserId) {
      console.warn("Permission error: Only the creator of the plan can change its recommendation status");
      return false;
    }

    // Sadece isRecommended alanını güncelle
    await updateDoc(travelPlanRef, {
      isRecommended,
      updatedAt: serverTimestamp(),
    });

    console.log(`Travel plan ${isRecommended ? "recommended" : "unrecommended"}:`, id);

    return true;
  } catch (error) {
    console.error("Error updating travel plan recommendation status:", error);
    return false;
  }
}

/**
 * Bir seyahat planını beğenme veya beğeniyi kaldırma
 */
export async function toggleLike(id: string, userId: string): Promise<boolean> {
  try {
    console.log(`Toggling like for travel plan: ${id} by user: ${userId}`);

    if (!id?.trim() || !userId?.trim()) {
      console.warn("Invalid travel plan ID or user ID");
      return false;
    }

    const travelPlanRef = doc(db, TRAVEL_PLANS_COLLECTION, id);

    // Önce planı getir
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      console.warn("Travel plan not found:", id);
      return false;
    }

    const planData = docSnap.data();

    // likedBy dizisini kontrol et, yoksa oluştur
    const likedBy = planData.likedBy || [];

    // Kullanıcı zaten beğenmiş mi kontrol et
    const userIndex = likedBy.indexOf(userId);

    if (userIndex > -1) {
      // Kullanıcı zaten beğenmiş, beğeniyi kaldır
      likedBy.splice(userIndex, 1);
      console.log(`User removed like: ${userId}`);
    } else {
      // Kullanıcı henüz beğenmemiş, beğeni ekle
      likedBy.push(userId);
      console.log(`User added like: ${userId}`);
    }

    // Beğeni sayısını güncelle ve veritabanını güncelle
    await updateDoc(travelPlanRef, {
      likedBy,
      likes: likedBy.length,
      updatedAt: serverTimestamp()
    });

    console.log(`Travel plan like status updated. New like count: ${likedBy.length}`);

    return true;
  } catch (error) {
    console.error("Error updating travel plan like status:", error);
    return false;
  }
}

/**
 * Bir seyahat planını favorilere ekleme veya favorilerden çıkarma
 * Kullanıcı sadece kendi seyahat planlarını favorilere ekleyebilir
 */
export async function toggleFavorite(id: string, userId: string): Promise<boolean> {
  try {
    console.log(`Toggling favorite for travel plan: ${id} by user: ${userId}`);

    if (!id?.trim() || !userId?.trim()) {
      console.warn("Invalid travel plan ID or user ID");
      return false;
    }

    const travelPlanRef = doc(db, TRAVEL_PLANS_COLLECTION, id);

    // Önce planı getir
    const docSnap = await getDoc(travelPlanRef);

    if (!docSnap.exists()) {
      console.warn("Travel plan not found:", id);
      return false;
    }

    const planData = docSnap.data();

    // Kullanıcı kontrolü - sadece kendi planlarını favorilere ekleyebilir
    if (planData.userId !== userId) {
      console.warn("Permission error: Users can only favorite their own travel plans");
      return false;
    }

    // Favori durumunu tersine çevir
    const isFavorite = !planData.isFavorite;

    // Veritabanını güncelle
    await updateDoc(travelPlanRef, {
      isFavorite,
      updatedAt: serverTimestamp()
    });

    console.log(`Travel plan favorite status updated to: ${isFavorite}`);

    return true;
  } catch (error) {
    console.error("Error updating travel plan favorite status:", error);
    return false;
  }
}

/**
 * Kullanıcının favori seyahat planlarını getirir
 */
export async function fetchFavoriteTravelPlans(userId: string): Promise<Partial<TravelPlan>[]> {
  try {
    if (!userId?.trim()) {
      console.warn("Invalid user ID provided");
      return [];
    }

    const travelPlansRef = collection(db, TRAVEL_PLANS_COLLECTION);
    const q = query(
      travelPlansRef,
      where("userId", "==", userId),
      where("isFavorite", "==", true)
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} favorite plans for user: ${userId}`);

    const plans = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const rawData = doc.data();

        // Eksik alanları varsayılan değerlerle doldur
        if (!rawData.bestTimeToVisit) {
          const destination = rawData.destination || '';
          if (destination.includes('Türkiye') || destination.includes('Turkey')) {
            rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
          } else {
            rawData.bestTimeToVisit = "İlkbahar ve Sonbahar ayları";
          }
        }

        return formatTravelPlan({ ...rawData, id: doc.id });
      })
    );

    // Sadece geçerli planları döndür
    return plans.filter(plan => plan.id && plan.destination);
  } catch (error) {
    console.error("Error fetching favorite travel plans:", error);
    return [];
  }
}

/**
 * Önerilen seyahat planlarını getirir
 */
export async function fetchRecommendedTravelPlans(): Promise<Partial<TravelPlan>[]> {
  try {
    console.log("Fetching recommended travel plans...");

    const travelPlansRef = collection(db, TRAVEL_PLANS_COLLECTION);

    // Sadece önerilen planları getir
    const q = query(travelPlansRef, where("isRecommended", "==", true));

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} recommended plans`);

    // Her bir plan için özel işleme yap
    const plans = await Promise.all(
      querySnapshot.docs.map(async doc => {
        const rawData = doc.data();

        // Özel işleme: itinerary içindeki visaInfo, culturalDifferences, localTips ve bestTimeToVisit alanlarını çıkar
        if (rawData.itinerary && typeof rawData.itinerary === "string") {
          try {
            const parsedItinerary = safeParseJSON(rawData.itinerary);
            if (parsedItinerary && typeof parsedItinerary === "object") {
              // bestTimeToVisit alanını itinerary'den çıkar - AITravellerMobile ile uyumlu olması için
              if (parsedItinerary.bestTimeToVisit) {
                console.log("Extracting bestTimeToVisit from itinerary:", parsedItinerary.bestTimeToVisit);
                // Her zaman itinerary'deki değeri kullan, daha güncel olabilir
                rawData.bestTimeToVisit = parsedItinerary.bestTimeToVisit;
              }

              // visaInfo, culturalDifferences ve localTips alanlarını itinerary'den çıkar
              // ve üst seviye alanlara taşı
              if (parsedItinerary.visaInfo && !rawData.visaInfo) {
                console.log("Extracting visaInfo from itinerary");
                rawData.visaInfo = parsedItinerary.visaInfo;
              }

              if (parsedItinerary.culturalDifferences && !rawData.culturalDifferences) {
                console.log("Extracting culturalDifferences from itinerary");
                rawData.culturalDifferences = parsedItinerary.culturalDifferences;
              }

              if (parsedItinerary.localTips && !rawData.localTips) {
                console.log("Extracting localTips from itinerary");
                rawData.localTips = parsedItinerary.localTips;
              }
            }
          } catch (error) {
            console.error("Error parsing itinerary:", error);
          }
        }

        // Eğer bestTimeToVisit hala boşsa veya "Not specified" ise, varsayılan bir değer ata
        if (!rawData.bestTimeToVisit || rawData.bestTimeToVisit === "Not specified") {
          console.log("Setting default bestTimeToVisit for mobile compatibility");
          const destination = rawData.destination || '';
          if (destination.includes('İstanbul') || destination.includes('Istanbul')) {
            rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
          } else if (destination.includes('Antalya') || destination.includes('Muğla') || destination.includes('Bodrum')) {
            rawData.bestTimeToVisit = "Yaz ayları (Haziran-Eylül)";
          } else if (destination.includes('Türkiye') || destination.includes('Turkey')) {
            rawData.bestTimeToVisit = "İlkbahar (Nisan-Haziran) ve Sonbahar (Eylül-Ekim) ayları";
          } else {
            rawData.bestTimeToVisit = "İlkbahar ve Sonbahar ayları";
          }
        }

        return formatTravelPlan({ ...rawData, id: doc.id });
      })
    );

    // Sadece geçerli planları filtrele
    const validPlans = plans.filter(plan => plan.id && plan.destination);

    // Beğeni sayısına göre sırala (çoktan aza)
    validPlans.sort((a, b) => {
      const likesA = a.likes || 0;
      const likesB = b.likes || 0;
      return likesB - likesA;
    });

    return validPlans;
  } catch (error) {
    console.error("Error fetching recommended travel plans:", error);
    return [];
  }
}

// Bütçe işlemleri
export async function createBudget(budget: any) {
  try {
    if (!budget.userId || !budget.travelPlanId) {
      throw new Error("Kullanıcı ID ve seyahat planı ID gereklidir");
    }

    const budgetRef = collection(db, BUDGETS_COLLECTION);

    // Timestamp ekle
    const budgetWithTimestamp = {
      ...budget,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Firestore'a ekle
    const docRef = await addDoc(budgetRef, budgetWithTimestamp);
    console.log("Bütçe oluşturuldu:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('Bütçe oluşturma hatası:', error);
    throw error;
  }
}

// Bütçe bilgilerini getir
export async function getBudget(budgetId: string, currentUserId?: string) {
  try {
    if (!budgetId?.trim()) {
      console.warn("Geçersiz bütçe ID'si");
      return null;
    }

    const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetDocRef);

    if (!budgetDoc.exists()) {
      console.warn('Bütçe bulunamadı:', budgetId);
      return null;
    }

    const data = budgetDoc.data();

    // Kullanıcı bütçe sahibi mi kontrol et (erişim kontrolü yok, sadece isOwner özelliği için)
    let isOwner = false;
    if (currentUserId) {
      isOwner = data.userId === currentUserId;

      // Kullanıcı bütçenin sahibi değilse, log kaydı oluştur
      if (!isOwner) {
        console.log('Kullanıcı bütçe sahibi değil, sadece görüntüleme yetkisi var');
      }
    }

    // Timestamp'i Date'e dönüştür
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : undefined;

    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : undefined;

    return {
      id: budgetDoc.id,
      ...data,
      createdAt,
      updatedAt,
      isOwner // Kullanıcının bütçe sahibi olup olmadığı bilgisi
    };
  } catch (error) {
    console.error('Bütçe getirme hatası:', error);
    throw error;
  }
}

// Seyahat planına ait bütçeyi getir
export async function getBudgetByTravelPlanId(travelPlanId: string) {
  try {
    if (!travelPlanId?.trim()) {
      console.warn("Geçersiz seyahat planı ID'si");
      return null;
    }

    const budgetQuery = query(
      collection(db, BUDGETS_COLLECTION),
      where('travelPlanId', '==', travelPlanId)
    );

    const budgetSnapshot = await getDocs(budgetQuery);

    if (budgetSnapshot.empty) {
      console.log("Seyahat planına ait bütçe bulunamadı:", travelPlanId);
      return null;
    }

    const budgetDoc = budgetSnapshot.docs[0];
    const data = budgetDoc.data();

    // Timestamp'i Date'e dönüştür
    const createdAt = data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : undefined;

    const updatedAt = data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : undefined;

    return {
      id: budgetDoc.id,
      ...data,
      createdAt,
      updatedAt
    };
  } catch (error) {
    console.error('Seyahat planı bütçesi getirme hatası:', error);
    throw error;
  }
}

// Kullanıcıya ait bütçeleri getir
export async function getUserBudgets(userId: string) {
  try {
    if (!userId?.trim()) {
      console.warn("Geçersiz kullanıcı ID'si");
      return [];
    }

    const budgetQuery = query(
      collection(db, BUDGETS_COLLECTION),
      where('userId', '==', userId)
    );

    const budgetSnapshot = await getDocs(budgetQuery);

    if (budgetSnapshot.empty) {
      console.log("Kullanıcıya ait bütçe bulunamadı:", userId);
      return [];
    }

    return budgetSnapshot.docs.map(doc => {
      const data = doc.data();

      // Timestamp'i Date'e dönüştür
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : undefined;

      const updatedAt = data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : undefined;

      return {
        id: doc.id,
        ...data,
        createdAt,
        updatedAt
      };
    });
  } catch (error) {
    console.error('Kullanıcı bütçeleri getirme hatası:', error);
    throw error;
  }
}

// Bütçeyi güncelle
export async function updateBudget(budgetId: string, updates: any, currentUserId?: string) {
  try {
    if (!budgetId?.trim()) {
      console.warn("Geçersiz bütçe ID'si");
      return false;
    }

    const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetDocRef);

    if (!budgetDoc.exists()) {
      console.warn('Bütçe bulunamadı:', budgetId);
      return false;
    }

    const budgetData = budgetDoc.data();

    // Erişim kontrolü: Sadece bütçe sahibi güncelleyebilir
    if (currentUserId && budgetData.userId !== currentUserId) {
      console.warn('Erişim reddedildi: Sadece bütçe sahibi bütçeyi güncelleyebilir');
      return false;
    }

    // Timestamp ekle
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(budgetDocRef, updatesWithTimestamp);
    console.log("Bütçe güncellendi:", budgetId);

    return true;
  } catch (error) {
    console.error('Bütçe güncelleme hatası:', error);
    throw error;
  }
}

// Bütçeyi sil
export async function deleteBudget(budgetId: string, currentUserId?: string) {
  try {
    if (!budgetId?.trim()) {
      console.warn("Geçersiz bütçe ID'si");
      return false;
    }

    const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
    const budgetDoc = await getDoc(budgetDocRef);

    if (!budgetDoc.exists()) {
      console.warn('Bütçe bulunamadı:', budgetId);
      return false;
    }

    const budgetData = budgetDoc.data();

    // Erişim kontrolü: Sadece bütçe sahibi silebilir
    if (currentUserId && budgetData.userId !== currentUserId) {
      console.warn('Erişim reddedildi: Sadece bütçe sahibi bütçeyi silebilir');
      return false;
    }

    // Önce bütçeye ait harcamaları sil
    const expenseQuery = query(
      collection(db, EXPENSES_COLLECTION),
      where('budgetId', '==', budgetId)
    );

    const expenseSnapshot = await getDocs(expenseQuery);

    const deletePromises = expenseSnapshot.docs.map(doc =>
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    // Sonra bütçeyi sil
    await deleteDoc(budgetDocRef);

    console.log("Bütçe silindi:", budgetId);
    return true;
  } catch (error) {
    console.error('Bütçe silme hatası:', error);
    throw error;
  }
}

// Harcama işlemleri
export async function addExpense(expense: any, currentUserId?: string) {
  try {
    // Zorunlu alanları kontrol et
    if (!expense.userId) {
      throw new Error("Kullanıcı ID gereklidir");
    }

    if (!expense.budgetId) {
      throw new Error("Bütçe ID gereklidir");
    }

    if (!expense.categoryId) {
      throw new Error("Kategori ID gereklidir");
    }

    // Erişim kontrolü: Sadece bütçe sahibi harcama ekleyebilir
    if (currentUserId) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (!budgetDoc.exists()) {
        console.warn('Bütçe bulunamadı:', expense.budgetId);
        return null;
      }

      const budgetData = budgetDoc.data();

      // Kullanıcı bütçenin sahibi değilse, harcama ekleyemez
      if (budgetData.userId !== currentUserId) {
        console.warn('Erişim reddedildi: Sadece bütçe sahibi harcama ekleyebilir');
        return null;
      }
    }

    const expenseRef = collection(db, EXPENSES_COLLECTION);

    // Tarih kontrolü
    const expenseData = {
      ...expense,
      date: expense.date || serverTimestamp(),
    };

    // Firestore'a ekle
    const docRef = await addDoc(expenseRef, expenseData);
    console.log("Harcama eklendi:", docRef.id);

    // Kategori harcama miktarını güncelle
    if (expense.budgetId && expense.categoryId && expense.amount) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (budgetDoc.exists()) {
        const budget = budgetDoc.data();
        const categories = budget.categories || [];
        const categoryIndex = categories.findIndex((c: any) => c.id === expense.categoryId);

        if (categoryIndex !== -1) {
          categories[categoryIndex].spentAmount = (categories[categoryIndex].spentAmount || 0) + expense.amount;

          await updateDoc(budgetDocRef, {
            categories,
            updatedAt: serverTimestamp(),
          });

          console.log("Kategori harcama miktarı güncellendi");
        }
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Harcama ekleme hatası:', error);
    throw error;
  }
}

// Harcama bilgilerini getir
export async function getExpense(expenseId: string) {
  try {
    if (!expenseId?.trim()) {
      console.warn("Geçersiz harcama ID'si");
      return null;
    }

    const expenseDocRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const expenseDoc = await getDoc(expenseDocRef);

    if (!expenseDoc.exists()) {
      console.warn('Harcama bulunamadı:', expenseId);
      return null;
    }

    const data = expenseDoc.data();

    // Timestamp'i Date'e dönüştür
    const date = data.date instanceof Timestamp
      ? data.date.toDate().toISOString()
      : data.date;

    return {
      id: expenseDoc.id,
      ...data,
      date
    };
  } catch (error) {
    console.error('Harcama getirme hatası:', error);
    throw error;
  }
}

// Bütçeye ait harcamaları getir
export async function getExpensesByBudgetId(budgetId: string, currentUserId?: string) {
  try {
    if (!budgetId?.trim()) {
      console.warn("Geçersiz bütçe ID'si");
      return [];
    }

    // Bütçeyi getir ve kullanıcının bütçe sahibi olup olmadığını kontrol et (isOwner özelliği için)
    if (currentUserId) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (!budgetDoc.exists()) {
        console.warn('Bütçe bulunamadı:', budgetId);
        return [];
      }

      // Not: Artık erişim kontrolü yapmıyoruz, tüm kullanıcılar harcamaları görebilir
      // Sadece kullanıcının bütçe sahibi olup olmadığını kontrol ediyoruz
      console.log('Kullanıcı harcamaları görüntülüyor');
    }

    const expenseQuery = query(
      collection(db, EXPENSES_COLLECTION),
      where('budgetId', '==', budgetId)
    );

    console.log("Harcama sorgusu:", budgetId);
    const expenseSnapshot = await getDocs(expenseQuery);
    console.log("Harcama sorgu sonucu:", expenseSnapshot.size, "adet harcama bulundu");

    if (expenseSnapshot.empty) {
      console.log("Bütçeye ait harcama bulunamadı:", budgetId);
      return [];
    }

    const expenses = expenseSnapshot.docs.map(doc => {
      const data = doc.data();

      // Timestamp'i Date'e dönüştür
      const date = data.date instanceof Timestamp
        ? data.date.toDate().toISOString()
        : data.date;

      const expense = {
        id: doc.id,
        ...data,
        date
      };

      console.log("Dönüştürülen harcama:", expense);
      return expense;
    });

    console.log("Döndürülen harcamalar:", expenses.length, "adet");
    return expenses;
  } catch (error) {
    console.error('Harcama listesi getirme hatası:', error);
    throw error;
  }
}

// Harcamayı güncelle
export async function updateExpense(expenseId: string, updates: any, oldAmount?: number, currentUserId?: string) {
  try {
    if (!expenseId?.trim()) {
      console.warn("Geçersiz harcama ID'si");
      return false;
    }

    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const expenseDoc = await getDoc(expenseRef);

    if (!expenseDoc.exists()) {
      console.warn("Harcama bulunamadı:", expenseId);
      return false;
    }

    const expense = expenseDoc.data();

    // Erişim kontrolü: Sadece bütçe sahibi harcamayı güncelleyebilir
    if (currentUserId && expense.budgetId) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (!budgetDoc.exists()) {
        console.warn('Bütçe bulunamadı:', expense.budgetId);
        return false;
      }

      const budgetData = budgetDoc.data();

      // Kullanıcı bütçenin sahibi değilse, harcamayı güncelleyemez
      if (budgetData.userId !== currentUserId) {
        console.warn('Erişim reddedildi: Sadece bütçe sahibi harcamayı güncelleyebilir');
        return false;
      }
    }

    // Harcamayı güncelle
    await updateDoc(expenseRef, updates);
    console.log("Harcama güncellendi:", expenseId);

    // Eğer miktar değiştiyse, kategori harcama miktarını güncelle
    if (updates.amount !== undefined && oldAmount !== undefined && expense.budgetId && expense.categoryId) {
      const amountDiff = updates.amount - oldAmount;

      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (budgetDoc.exists()) {
        const budget = budgetDoc.data();
        const categories = budget.categories || [];
        const categoryIndex = categories.findIndex((c: any) => c.id === expense.categoryId);

        if (categoryIndex !== -1) {
          categories[categoryIndex].spentAmount = (categories[categoryIndex].spentAmount || 0) + amountDiff;

          await updateDoc(budgetDocRef, {
            categories,
            updatedAt: serverTimestamp(),
          });

          console.log("Kategori harcama miktarı güncellendi");
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Harcama güncelleme hatası:', error);
    throw error;
  }
}

// Harcamayı sil
export async function deleteExpense(expenseId: string, currentUserId?: string) {
  try {
    if (!expenseId?.trim()) {
      console.warn("Geçersiz harcama ID'si");
      return false;
    }

    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const expenseDoc = await getDoc(expenseRef);

    if (!expenseDoc.exists()) {
      console.warn("Harcama bulunamadı:", expenseId);
      return false;
    }

    const expense = expenseDoc.data();

    // Erişim kontrolü: Sadece bütçe sahibi harcamayı silebilir
    if (currentUserId && expense.budgetId) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (!budgetDoc.exists()) {
        console.warn('Bütçe bulunamadı:', expense.budgetId);
        return false;
      }

      const budgetData = budgetDoc.data();

      // Kullanıcı bütçenin sahibi değilse, harcamayı silemez
      if (budgetData.userId !== currentUserId) {
        console.warn('Erişim reddedildi: Sadece bütçe sahibi harcamayı silebilir');
        return false;
      }
    }

    // Harcamayı sil
    await deleteDoc(expenseRef);
    console.log("Harcama silindi:", expenseId);

    // Kategori harcama miktarını güncelle
    if (expense.budgetId && expense.categoryId && expense.amount) {
      const budgetDocRef = doc(db, BUDGETS_COLLECTION, expense.budgetId);
      const budgetDoc = await getDoc(budgetDocRef);

      if (budgetDoc.exists()) {
        const budget = budgetDoc.data();
        const categories = budget.categories || [];
        const categoryIndex = categories.findIndex((c: any) => c.id === expense.categoryId);

        if (categoryIndex !== -1) {
          categories[categoryIndex].spentAmount = (categories[categoryIndex].spentAmount || 0) - expense.amount;

          await updateDoc(budgetDocRef, {
            categories,
            updatedAt: serverTimestamp(),
          });

          console.log("Kategori harcama miktarı güncellendi");
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Harcama silme hatası:', error);
    throw error;
  }
}