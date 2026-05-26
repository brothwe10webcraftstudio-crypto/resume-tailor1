import { useState, useEffect, useCallback } from 'react';
import { supabase, UsageRecord } from './supabase';
import { useAuth } from './auth-context';

const FREE_TIER_MONTHLY_LIMIT = 3;

export function useUsage() {
  const { user, profile } = useAuth();
  const [usageRecord, setUsageRecord] = useState<UsageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const monthYear = getCurrentMonthYear();

    const { data, error: fetchError } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setUsageRecord(data as UsageRecord | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const canUseTailor = useCallback(() => {
    if (!profile) return false;
    if (profile.subscription_tier === 'pro') return true;
    if (!usageRecord) return true;
    return usageRecord.tailor_count < FREE_TIER_MONTHLY_LIMIT;
  }, [profile, usageRecord]);

  const incrementUsage = useCallback(async () => {
    if (!user || !profile) return false;

    const monthYear = getCurrentMonthYear();

    if (profile.subscription_tier === 'pro') {
      return true;
    }

    if (!canUseTailor()) {
      return false;
    }

    if (!usageRecord) {
      const { data, error: insertError } = await supabase
        .from('usage_records')
        .insert({
          user_id: user.id,
          month_year: monthYear,
          tailor_count: 1
        })
        .select()
        .maybeSingle();

      if (insertError) {
        setError(insertError.message);
        return false;
      }
      setUsageRecord(data as UsageRecord);
    } else {
      const { data, error: updateError } = await supabase
        .from('usage_records')
        .update({
          tailor_count: usageRecord.tailor_count + 1
        })
        .eq('id', usageRecord.id)
        .select()
        .maybeSingle();

      if (updateError) {
        setError(updateError.message);
        return false;
      }
      setUsageRecord(data as UsageRecord);
    }

    return true;
  }, [user, profile, usageRecord, canUseTailor]);

  const getUsageDisplay = useCallback(() => {
    if (!profile || profile.subscription_tier === 'pro') {
      return null;
    }
    const count = usageRecord?.tailor_count ?? 0;
    return {
      used: count,
      limit: FREE_TIER_MONTHLY_LIMIT,
      remaining: FREE_TIER_MONTHLY_LIMIT - count
    };
  }, [profile, usageRecord]);

  return {
    usageRecord,
    loading,
    error,
    canUseTailor,
    incrementUsage,
    getUsageDisplay,
    refetch: fetchUsage
  };
}
