import { SignatureComponents } from '../../../components/account/SignatureComponents';
import { useThemedFocusStatusBar } from '../../../hooks';

export function SignatureScreen({ navigation, route }) {
  useThemedFocusStatusBar({ inverted: true });
  const {
    fromDocumentFlow,
    templateText,
    templateName,
    templateId,
    templateSolution,
    categoryName,
  } = route.params ?? {};

  const handleSaveSuccess = fromDocumentFlow
    ? () =>
        navigation.navigate('Home', {
          screen: 'DocumentCreate',
          params: {
            templateText,
            templateName,
            templateId,
            templateSolution,
            categoryName,
          },
        })
    : () => {
        navigation.navigate('AccountMain');
      };

  return <SignatureComponents onSaveSuccess={handleSaveSuccess} fromDocumentFlow={fromDocumentFlow} />;
}
