import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import { db } from "../Service/firebaseConfig";
import { TravelPlan, TripComment } from "../types/travel";

// Koleksiyon referansları
const TRAVEL_PLANS_COLLECTION = "travelPlans";
const TRAVEL_PLANS_COMMENTS_COLLECTION = "travelPlans_comments";

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

      console.log('Parsed itinerary type:', typeof parsedItinerary);
      if (parsedItinerary) {
        console.log('Parsed itinerary keys:', Object.keys(parsedItinerary));
      }

      // Mobil uygulamadan gelen itinerary formatını kontrol et
      if (Array.isArray(parsedItinerary)) {
        // Doğrudan array formatı - günlük planlar dizisi
        console.log('Itinerary is an array with length:', parsedItinerary.length);
        parsedData.itinerary = parsedItinerary;
      }
      // Eğer itinerary.itinerary bir array ise (nested format)
      else if (parsedItinerary && parsedItinerary.itinerary && Array.isArray(parsedItinerary.itinerary)) {
        console.log('Itinerary has nested itinerary array with length:', parsedItinerary.itinerary.length);
        parsedData.itinerary = parsedItinerary.itinerary;
      }
      // Eğer itinerary bir obje ise ve içinde günlük planlar varsa (mobil uygulamadan gelen yeni format)
      else if (typeof parsedItinerary === 'object' && !Array.isArray(parsedItinerary) &&
               Object.keys(parsedItinerary).some(key => key.includes('Gün'))) {
        console.log('Itinerary is an object with day keys');
        parsedData.itinerary = parsedItinerary;
      }
      // Diğer formatlar - obje olarak gelmiş olabilir
      else if (typeof parsedItinerary === 'object') {
        console.log('Itinerary is a generic object');
        parsedData.itinerary = parsedItinerary;
      }

      // Eğer hotelOptions varsa onu da çıkar
      if (parsedItinerary && parsedItinerary.hotelOptions && Array.isArray(parsedItinerary.hotelOptions)) {
        console.log('Found hotelOptions in itinerary with length:', parsedItinerary.hotelOptions.length);
        parsedData.hotelOptions = parsedItinerary.hotelOptions;
      }
    }

    // Parse culturalDifferences if it's a string
    if (typeof data.culturalDifferences === 'string') {
      try {
        const parsedCulturalDifferences = safeParseJSON(data.culturalDifferences);
        if (parsedCulturalDifferences && typeof parsedCulturalDifferences === 'object') {
          parsedData.culturalDifferences = parsedCulturalDifferences;
        }
      } catch (error) {
        console.error('Error parsing culturalDifferences:', error);
      }
    }

    // Parse localTips if it's a string
    if (typeof data.localTips === 'string') {
      try {
        const parsedLocalTips = safeParseJSON(data.localTips);
        if (parsedLocalTips && typeof parsedLocalTips === 'object') {
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
        console.error('Error parsing localTips:', error);
      }
    }

    // Parse visaInfo if it's a string
    if (typeof data.visaInfo === 'string') {
      try {
        const parsedVisaInfo = safeParseJSON(data.visaInfo);
        if (parsedVisaInfo && typeof parsedVisaInfo === 'object') {
          parsedData.visaInfo = parsedVisaInfo;
        }
      } catch (error) {
        console.error('Error parsing visaInfo:', error);
      }
    }

    // Parse hotelOptions if it's a string
    if (typeof data.hotelOptions === 'string') {
      try {
        const parsedHotelOptions = safeParseJSON(data.hotelOptions);
        if (Array.isArray(parsedHotelOptions)) {
          parsedData.hotelOptions = parsedHotelOptions;
        }
      } catch (error) {
        console.error('Error parsing hotelOptions:', error);
      }
    }

    // Parse tripSummary if it's a string
    if (typeof data.tripSummary === 'string') {
      try {
        const parsedTripSummary = safeParseJSON(data.tripSummary);
        if (parsedTripSummary && typeof parsedTripSummary === 'object') {
          parsedData.tripSummary = parsedTripSummary;
        }
      } catch (error) {
        console.error('Error parsing tripSummary:', error);
      }
    }

    // Parse destinationInfo if it's a string
    if (typeof data.destinationInfo === 'string') {
      try {
        const parsedDestinationInfo = safeParseJSON(data.destinationInfo);
        if (parsedDestinationInfo && typeof parsedDestinationInfo === 'object') {
          parsedData.destinationInfo = parsedDestinationInfo;
        }
      } catch (error) {
        console.error('Error parsing destinationInfo:', error);
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

    // Ensure all required fields exist with proper types
    const formattedPlan = {
      ...DEFAULT_TRAVEL_PLAN,
      ...parsedData,
      id: data?.id || DEFAULT_TRAVEL_PLAN.id,
      days: typeof parsedData.days === 'number' ? parsedData.days : DEFAULT_TRAVEL_PLAN.days,
      isDomestic: typeof parsedData.isDomestic === 'boolean' ? parsedData.isDomestic : DEFAULT_TRAVEL_PLAN.isDomestic,
    };

    // Temel alanları kontrol et ve düzenle
    if (!formattedPlan.bestTimeToVisit) {
      formattedPlan.bestTimeToVisit = "Not specified";
    }

    if (typeof formattedPlan.duration === 'number') {
      formattedPlan.duration = `${formattedPlan.duration} days`;
    }

    if (!formattedPlan.country && formattedPlan.destination) {
      // Destinasyondan ülke bilgisini çıkarmaya çalış
      const parts = formattedPlan.destination.split(',');
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

    // Karmaşık nesneleri JSON string'e dönüştür
    // Bu, web uygulamasının mobil uygulamayla aynı formatta veri almasını sağlar
    const complexObjectsToStringify = [
      'culturalDifferences', 'localTips', 'visaInfo', 'tripSummary', 'destinationInfo'
    ];

    complexObjectsToStringify.forEach(field => {
      if (formattedPlan[field] && typeof formattedPlan[field] === 'object') {
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
        console.log('hotelOptions converted to JSON string');
      } catch (error) {
        console.error('Error converting hotelOptions to JSON string:', error);
        formattedPlan.hotelOptions = "[]";
      }
    }

    // itinerary'yi JSON string'e dönüştür
    if (formattedPlan.itinerary && (Array.isArray(formattedPlan.itinerary) || typeof formattedPlan.itinerary === 'object')) {
      try {
        formattedPlan.itinerary = JSON.stringify(formattedPlan.itinerary);
        console.log('itinerary converted to JSON string');
      } catch (error) {
        console.error('Error converting itinerary to JSON string:', error);
        formattedPlan.itinerary = "[]";
      }
    }

    return formattedPlan;
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

    const travelPlanRef = doc(db, TRAVEL_PLANS_COLLECTION, id);
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
    const q = query(
      commentsRef,
      where("travelPlanId", "==", travelPlanId)
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} comments`);

    const comments: TripComment[] = [];

    querySnapshot.forEach(doc => {
      const data = doc.data();

      // Convert Timestamp to Date string
      const createdAt = data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt || new Date().toISOString();

      const updatedAt = data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt;

      comments.push({
        ...data as TripComment,
        id: doc.id,
        createdAt,
        updatedAt
      });
    });

    // Sort comments by date (newest first)
    return comments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

/**
 * Yeni bir yorum ekler
 */
export async function addComment(comment: Omit<TripComment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    console.log(`Adding comment for travel plan: ${comment.travelPlanId}`);

    if (!comment.travelPlanId?.trim() || !comment.userId?.trim()) {
      console.warn("Invalid travel plan ID or user ID");
      throw new Error("Invalid travel plan ID or user ID");
    }

    const commentsRef = collection(db, TRAVEL_PLANS_COMMENTS_COLLECTION);

    // Add timestamp
    const commentWithTimestamp = {
      ...comment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add to Firestore
    const docRef = await addDoc(commentsRef, commentWithTimestamp);
    console.log('Comment added:', docRef.id);

    return docRef.id;
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

    const commentRef = doc(db, TRAVEL_PLANS_COMMENTS_COLLECTION, id);

    // Add updatedAt timestamp
    const updateData = {
      ...comment,
      updatedAt: serverTimestamp()
    };

    // Remove ID (already exists as document ID in Firestore)
    if ('id' in updateData) {
      delete updateData.id;
    }

    await updateDoc(commentRef, updateData);
    console.log('Comment updated:', id);

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

    const commentRef = doc(db, TRAVEL_PLANS_COMMENTS_COLLECTION, id);
    await deleteDoc(commentRef);
    console.log('Comment deleted:', id);

    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
}
