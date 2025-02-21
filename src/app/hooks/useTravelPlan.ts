import { useState } from 'react';
import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { db } from '../Service/firebaseConfig';
import { TravelPlan } from '../types/travel';


export function useTravelPlan() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTravelPlan = async (planData: Omit<TravelPlan, 'userId' | 'createdAt'>) => {
    if (!user) {
      setError('User must be logged in to save travel plans');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const travelPlan: TravelPlan = {
        ...planData,
        userId: user.id,
      };

      // First, ensure the user document exists
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        email: user.emailAddresses[0]?.emailAddress,
        lastUpdated: new Date(),
        userId: user.id
      }, { merge: true });

      // Then create the travel plan
      const travelPlansRef = collection(db, 'travelPlans');
      const docRef = await addDoc(travelPlansRef, travelPlan);

      return docRef.id;
    } catch (err) {
      const error = err as Error;
      setError('Failed to save travel plan');
      console.error('Error saving travel plan:', error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTravelPlan = async (planId: string) => {
    if (!user) {
      setError('User must be logged in to delete travel plans');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const planRef = doc(db, 'travelPlans', planId);
      await deleteDoc(planRef);
      return true;
    } catch (err) {
      const error = err as Error;
      setError('Failed to delete travel plan');
      console.error('Error deleting travel plan:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTravelPlans = async () => {
    if (!user) {
      setError('User must be logged in to fetch travel plans');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const travelPlansRef = collection(db, 'travelPlans');
      const userPlansQuery = query(travelPlansRef, where('userId', '==', user.id));
      const snapshot = await getDocs(userPlansQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (TravelPlan & { id: string })[];
    } catch (err) {
      const error = err as Error;
      setError('Failed to fetch travel plans');
      console.error('Error fetching travel plans:', error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveTravelPlan,
    getUserTravelPlans,
    deleteTravelPlan,
    isLoading,
    error
  };
}