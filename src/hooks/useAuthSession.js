import { useCallback } from 'react';
import { authApi, clearAuthTokens, userApi } from '../api';
import { useAuth } from '../contexts';
import { clearUserCredentials } from '../utils/secureStorage';
import { completeAuthToMain, navigateToAuth, resetToMain } from '../navigation/navigationRef';
import { useAppDispatch } from '../store';
import {
  fetchPersonalData,
  resetPersonalData,
  setUserFlags,
} from '../store/slices/personalDataSlice';
import { useToast } from './useToast';

export function useAuthSession() {
  const { isSign, setIsSign, setIsFaceID } = useAuth();
  const { showToast } = useToast();
  const dispatch = useAppDispatch();

  const login = useCallback(async () => {
    dispatch(fetchPersonalData());
    try {
      const { data } = await userApi.getMe();
      dispatch(
        setUserFlags({
          hasSignature: Boolean(data?.hasSignature),
          isPhoneVerified: Boolean(data?.isPhoneVerified),
        }),
      );
    } catch {
      // Flags stay at defaults; splash/getMe on next launch will refresh them.
    }
    await setIsSign(true);
    await setIsFaceID(true);
    completeAuthToMain();
  }, [dispatch, setIsSign, setIsFaceID]);

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
      await clearAuthTokens();
   
      // dispatch(resetCategories());
      await setIsSign(false);
      await setIsFaceID(false);
      resetToMain();
      dispatch(resetPersonalData());
    }
  }, [dispatch, setIsSign, setIsFaceID, showToast]);

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
