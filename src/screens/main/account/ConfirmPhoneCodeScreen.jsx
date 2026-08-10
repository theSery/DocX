import { ConfirmPhoneCodeForm } from '../../../components/ConfirmPhoneCodeForm';
import { useAppSelector } from '../../../store';
import {
  selectIsDeleteAccountConfirm,
  selectPersonalData,
} from '../../../store/slices/personalDataSlice';

export function ConfirmPhoneCodeScreen() {
  const personalData = useAppSelector(selectPersonalData);
  const phoneNumber = personalData?.phoneNumber ?? '';
  const isDeleteAccount = useAppSelector(selectIsDeleteAccountConfirm);

  return (
    <ConfirmPhoneCodeForm
      phoneNumber={phoneNumber}
      isDeleteAccount={isDeleteAccount}
    />
  );
}
