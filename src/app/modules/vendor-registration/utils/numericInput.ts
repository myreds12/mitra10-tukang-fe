import React from 'react';

/**
 * Blocks non-numeric keys from being pressed in numeric input fields.
 * Allows navigation, editing, control keys (Ctrl/Cmd + C, V, X, A, Z), and function keys.
 */
export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow navigation / control keys
  if (
    [
      'Backspace',
      'Tab',
      'Enter',
      'Escape',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ].includes(e.key) ||
    (e.key.startsWith('F') && e.key.length > 1) ||
    ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase()))
  ) {
    return;
  }

  // Block anything that is not a digit (0-9)
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Sanitizes input to only digits, with optional maximum length.
 */
export const sanitizeNumeric = (val: any, maxLength?: number): string => {
  if (val === null || val === undefined) return '';
  const digits = String(val).replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};
