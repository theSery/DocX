import { SignatureComponents } from '../../../components/account/SignatureComponents';

export function SignatureScreen({ navigation, route }) {
  const { fromDocumentFlow, templateText, templateName, templateId, templateSolution } =
    route.params ?? {};

  const handleSaveSuccess = fromDocumentFlow
    ? () =>
        navigation.navigate('Home', {
          screen: 'DocumentCreate',
          params: {
            templateText,
            templateName,
            templateId,
            templateSolution,
          },
        })
    :   () => {    navigation.navigate('AccountMain')}
    

  return <SignatureComponents onSaveSuccess={handleSaveSuccess} fromDocumentFlow={fromDocumentFlow} />;
}
