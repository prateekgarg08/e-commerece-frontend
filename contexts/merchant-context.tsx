"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { merchantsApi } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import type { Merchant, MerchantCreate, MerchantUpdate } from "@/types";

interface MerchantContextType {
  merchant: Merchant | null;
  isLoading: boolean;
  error: string | null;
  isMerchant: boolean;
  createMerchant: (merchantData: MerchantCreate) => Promise<void>;
  updateMerchant: (merchantData: MerchantUpdate) => Promise<void>;
  refreshMerchant: () => Promise<void>;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMerchantProfile = useCallback(async () => {
    if (!user) {
      setMerchant(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const merchantData = await merchantsApi.getMerchantProfile();
      setMerchant(merchantData);
    } catch (error: any) {
      // 404 means user is not a merchant yet, which is a valid state
      if (error.status !== 404) {
        console.error("Error fetching merchant profile:", error);
        setError("Failed to load merchant profile");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check for merchant profile on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchMerchantProfile();
    }
  }, [user, fetchMerchantProfile]);

  const createMerchant = async (merchantData: MerchantCreate) => {
    setIsLoading(true);
    setError(null);

    try {
      const newMerchant = await merchantsApi.createMerchant(merchantData);
      setMerchant(newMerchant);
    } catch (error) {
      console.error("Error creating merchant:", error);
      setError("Failed to create merchant profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMerchant = async (merchantData: MerchantUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedMerchant = await merchantsApi.updateMerchantProfile(merchantData);
      setMerchant(updatedMerchant);
    } catch (error) {
      console.error("Error updating merchant:", error);
      setError("Failed to update merchant profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMerchant = async () => {
    return fetchMerchantProfile();
  };

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        isLoading,
        error,
        isMerchant: !!merchant,
        createMerchant,
        updateMerchant,
        refreshMerchant,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error("useMerchant must be used within a MerchantProvider");
  }
  return context;
}
