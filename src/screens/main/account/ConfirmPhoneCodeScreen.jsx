import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { StatusBar } from 'react-native';
import { ConfirmPhoneCodeForm } from '../../../components/ConfirmPhoneCodeForm';
import { useAppSelector } from '../../../store';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';

export function ConfirmPhoneCodeScreen() {
  const route = useRoute();
  const personalData = useAppSelector(selectPersonalData);
  const phoneNumber = personalData?.phoneNumber ?? '';
  const isDeleteAccount = route.params?.purpose === 'delete_account';

  // MainHeader sits on a light surface; restore account-stack light icons on leave.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content', true);
      return () => {
        StatusBar.setBarStyle('light-content', true);
      };
    }, []),
  );

  return (
    <ConfirmPhoneCodeForm
      phoneNumber={phoneNumber}
      isDeleteAccount={isDeleteAccount}
    />
  );
}
