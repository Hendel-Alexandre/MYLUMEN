import { useState, useEffect } from 'react';

interface AutofillSuggestion {
  value: string;
  frequency: number;
  lastUsed: Date;
}

/**
 * Hook for AI-powered autofill that learns from previous entries
 * Analyzes historical data to provide intelligent suggestions
 */
export function useAutofill(fieldName: string, context?: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [fieldName, context]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now - can be enhanced with API calls later
      const storageKey = `autofill_${fieldName}_${context || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const data: AutofillSuggestion[] = JSON.parse(stored);
        // Sort by frequency and recency
        const sorted = data
          .sort((a, b) => {
            const scoreA = a.frequency + (new Date(a.lastUsed).getTime() / 1000000000);
            const scoreB = b.frequency + (new Date(b.lastUsed).getTime() / 1000000000);
            return scoreB - scoreA;
          })
          .slice(0, 5)
          .map(s => s.value);
        
        setSuggestions(sorted);
      }
    } catch (error) {
      console.error('Failed to load autofill suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordEntry = (value: string) => {
    if (!value || value.trim().length === 0) return;

    try {
      const storageKey = `autofill_${fieldName}_${context || 'default'}`;
      const stored = localStorage.getItem(storageKey);
      let data: AutofillSuggestion[] = stored ? JSON.parse(stored) : [];

      // Update or add entry
      const existing = data.find(s => s.value === value);
      if (existing) {
        existing.frequency += 1;
        existing.lastUsed = new Date();
      } else {
        data.push({
          value,
          frequency: 1,
          lastUsed: new Date()
        });
      }

      // Keep only top 20 entries to avoid bloating storage
      data = data
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20);

      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to record autofill entry:', error);
    }
  };

  return {
    suggestions,
    loading,
    recordEntry
  };
}
