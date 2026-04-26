import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setTrades(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrades();
    const channel = supabase
      .channel('trades-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => fetchTrades())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchTrades]);

  const addTrade = useCallback(async (tradeData) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
      .from('trades')
      .insert([{ ...tradeData, user_id: user.id }])
      .select()
      .single();
    if (!err) setTrades(prev => [data, ...prev]);
    return { data, error: err };
  }, []);

  const updateTrade = useCallback(async (id, updates) => {
    const { data, error: err } = await supabase
      .from('trades').update(updates).eq('id', id).select().single();
    if (!err) setTrades(prev => prev.map(t => t.id === id ? data : t));
    return { data, error: err };
  }, []);

  const deleteTrade = useCallback(async (id) => {
    const { error: err } = await supabase.from('trades').delete().eq('id', id);
    if (!err) setTrades(prev => prev.filter(t => t.id !== id));
    return { error: err };
  }, []);

  return { trades, loading, error, refresh: fetchTrades, addTrade, updateTrade, deleteTrade };
}
