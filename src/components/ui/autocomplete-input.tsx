'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { useAutofill } from '@/lib/hooks/useAutofill';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fieldName: string;
  context?: string;
  onValueSelect?: (value: string) => void;
}

export function AutocompleteInput({
  fieldName,
  context,
  value,
  onChange,
  onValueSelect,
  onBlur,
  className,
  ...props
}: AutocompleteInputProps) {
  const { suggestions, recordEntry } = useAutofill(fieldName, context);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes((value as string || '').toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setShowSuggestions(true);
    setHighlightedIndex(0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const event = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(event);
    onValueSelect?.(suggestion);
    recordEntry(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        if (filteredSuggestions[highlightedIndex]) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      if (value && typeof value === 'string' && value.trim().length > 0) {
        recordEntry(value);
      }
    }, 200);
    onBlur?.(e);
  };

  useEffect(() => {
    // Click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                'px-3 py-2 cursor-pointer text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                index === highlightedIndex && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
