import { useRoute } from '@react-navigation/native';
import { ConfirmPhoneCodeForm } from '../../../components/ConfirmPhoneCodeForm';

export function ConfirmPhoneCodeScreenHome() {
  const route = useRoute();
  const phoneNumber = route.params?.phoneNumber ?? '';

  return <ConfirmPhoneCodeForm phoneNumber={phoneNumber} />;
}
