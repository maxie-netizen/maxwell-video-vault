import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUsernameValidation(username: string, currentUsername?: string) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't check if username is empty, too short, or same as current
    if (!username || username.length < 4 || username === currentUsername) {
      setIsAvailable(null);
      setError(null);
      setIsChecking(false);
      return;
    }

    // Debounce the check
    const timer = setTimeout(async () => {
      setIsChecking(true);
      setError(null);

      try {
        const { data, error } = await supabase.rpc('check_username_availability', {
          username_to_check: username
        });

        if (error) throw error;
        setIsAvailable(data);
      } catch (err) {
        console.error('Error checking username:', err);
        setError('Failed to check username availability');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, currentUsername]);

  const getValidationMessage = () => {
    if (!username) return null;
    if (username.length < 4) return 'Username must be at least 4 characters';
    if (username === currentUsername) return null;
    if (isChecking) return 'Checking availability...';
    if (error) return error;
    if (isAvailable === false) return 'Username is already taken';
    if (isAvailable === true) return 'Username is available';
    return null;
  };

  const getValidationColor = () => {
    if (!username || username.length < 4 || username === currentUsername) return 'default';
    if (isChecking) return 'default';
    if (error || isAvailable === false) return 'destructive';
    if (isAvailable === true) return 'success';
    return 'default';
  };

  return {
    isAvailable,
    isChecking,
    error,
    isValid: username.length >= 4 && isAvailable === true,
    message: getValidationMessage(),
    color: getValidationColor()
  };
}