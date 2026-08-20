import { useRoute } from '@react-navigation/native';
import { ConfirmPhoneCodeForm } from '../../../components/ConfirmPhoneCodeForm';
import { useAppSelector } from '../../../store';
import { selectPersonalData } from '../../../store/slices/personalDataSlice';
import { useTemporaryFocusStatusBar } from '../../../hooks';

export function ConfirmPhoneCodeScreen() {
  const route = useRoute();
  const personalData = useAppSelector(selectPersonalData);
  const phoneNumber = personalData?.phoneNumber ?? '';
  const isDeleteAccount = route.params?.purpose === 'delete_account';

  // MainHeader sits on a light surface; restore account-stack light icons on leave.
  useTemporaryFocusStatusBar();

  return (
    <ConfirmPhoneCodeForm
      phoneNumber={phoneNumber}
      isDeleteAccount={isDeleteAccount}
    />
  );
}
