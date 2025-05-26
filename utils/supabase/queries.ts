import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getMatch = cache(async (supabase: SupabaseClient) => {
  const { data: match, error } = await supabase
    .from('matches')
    .select(`*,
      white_player:profile!white_player_id(*),
      black_player:profile!black_player_id(*)`
    )
    .eq('url_hash', "vemr")
    .single()
  return  match
;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('active', true)
    .single();
  return profile;
});
