import { useCallback } from 'react';
import { authApi } from '../api';
import { useAuth } from '../contexts';
import { clearUserCredentials } from '../utils/secureStorage';
import { navigateToAuth, resetToMain } from '../navigation/navigationRef';
import { useToast } from './useToast';

export function useAuthSession() {
  const { isSign, setIsSign, setIsFaceID } = useAuth();
  const { showToast } = useToast();

  const login = useCallback(async () => {
    await setIsSign(true);
    await setIsFaceID(true);
    resetToMain();
  }, [setIsSign, setIsFaceID]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      showToast({
        title: 'Ելք ձախողվեց',
        body: error?.message || 'Տեղի ունեցավ սխալ։ Փորձեք կրկին։',
        type: 'error',
      });
    } finally {
      await clearUserCredentials();
      await setIsSign(false);
      await setIsFaceID(false);
      resetToMain();
    }
  }, [setIsSign, setIsFaceID, showToast]);

  const completeReauth = useCallback(async () => {
    await setIsSign(true);
    await setIsFaceID(true);
    resetToMain();
  }, [setIsSign, setIsFaceID]);

  const openAuth = useCallback(() => {
    navigateToAuth();
  }, []);

  return {
    isAuthenticated: isSign,
    login,
    logout,
    completeReauth,
    openAuth,
  };
}
