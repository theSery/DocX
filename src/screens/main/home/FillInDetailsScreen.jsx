import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { templatesApi, userApi } from '../../../api';
import AuthButton from '../../../components/buttons/AuthButton';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import { StepIndicator } from '../../../components/stepIndicator';
import { useThemedStyles } from '../../../hooks';
import { FillAct, FillDates } from './components/fillDetails';
import MainHeader from '../../../components/headers/MainHeader';
import { Typography } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  resetDocumentFill,
  syncFactSelections,
} from '../../../store/slices/documentFillSlice';
import { TAB_BAR_BOTTOM_OFFSET } from '../../../utils/dimensions';
import { palette } from '../../../theme';
import {
  fetchPersonalData,
  selectPersonalData,
  selectPersonalDataStatus,
} from '../../../store/slices/personalDataSlice';
import {
  isPersonalDataCompleteForTemplate,
  isPassportDataCompleteForTemplate,
} from '../../../utils/personalDataValidation';

function buildSteps(templateFactGroups = []) {
  const actStep = { key: 'act', label: 'Մանրամասներ' };
  const factSteps = templateFactGroups.map((group, index) => ({
    key: `fact-${group.id ?? index}`,
    label: group.name,
  }));

  return [actStep, ...factSteps];
}

function hasAnyFactSelection(templateFactGroups, selectedFacts, radioFacts) {
  const hasCheckboxSelection = Object.values(selectedFacts).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value != null;
  });

  if (hasCheckboxSelection) {
    return true;
  }

  return Object.values(radioFacts).some(value => value != null);
}

export function FillInDetailsScreen({ navigation, route }) {
  const styles = useThemedStyles(createStyles);
  const dispatch = useAppDispatch();
  const { templateId = 73, templateForm, templateSolution } = route.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [templateFactGroups, setTemplateFactGroups] = useState([]);
  const [templateText, setTemplateText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedFacts, setSelectedFacts] = useState({});
  const [radioFacts, setRadioFacts] = useState({});
  const [stepError, setStepError] = useState('');
  const [isCheckingSignature, setIsCheckingSignature] = useState(false);


  const templateVariables = useMemo(
    () =>
      [...(templateForm?.variables ?? [])].sort(
        (a, b) => (a.sequence ?? 0) - (b.sequence ?? 0),
      ),
    [templateForm],
  );

  const defaultValues = useMemo(
    () =>
      templateVariables.reduce((acc, variable) => {
        acc[variable.name] = variable.dataType === 'date' ? null : '';
        return acc;
      }, {}),
    [templateVariables],
  );

  const { control, handleSubmit } = useForm({
    defaultValues,
    reValidateMode: 'onChange',
  });
  const personalData = useAppSelector(selectPersonalData);
  const personalDataStatus = useAppSelector(selectPersonalDataStatus);

  useEffect(() => {
    if (personalDataStatus === 'idle') {
      dispatch(fetchPersonalData());
    }
  }, [dispatch, personalDataStatus]);

  useEffect(() => {
    dispatch(resetDocumentFill());

    return () => {
      dispatch(resetDocumentFill());
    };
  }, [dispatch, templateId]);

  useEffect(() => {
    const controller = new AbortController();

    templatesApi
      .getTemplateById(templateId, { signal: controller.signal })
      .then(response => {
        setTemplateFactGroups(response.data.templateFactGroups ?? []);
        setTemplateText(response.data.templateText ?? '');
        setTemplateName(response.data.name ?? response.data.title ?? '');
      })
      .catch(error => {
        if (error.type !== 'cancel') {
          console.log('template error:', error);
        }
      });

    return () => controller.abort();
  }, [templateId]);
  useEffect(() => {
    if (templateFactGroups.length === 0) {
      return;
    }

    dispatch(
      syncFactSelections({
        templateFactGroups,
        selectedFacts,
        radioFacts,
      }),
    );
  }, [dispatch, templateFactGroups, selectedFacts, radioFacts]);

  useEffect(() => {
    setStepError('');
  }, [currentStep, selectedFacts, radioFacts]);

  const steps = useMemo(() => buildSteps(templateFactGroups), [templateFactGroups]);
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const currentFactGroup = currentStep > 0 ? templateFactGroups[currentStep - 1] : null;

  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      handleSubmit(() => {
        setStepError('');
        setCurrentStep(prev => prev + 1);
      })();
      return;
    }

    if (isLastStep) {
      if (!hasAnyFactSelection(templateFactGroups, selectedFacts, radioFacts)) {
        setStepError('Ընտրեք առնվազն մեկ տարբերակ');
        return;
      }

      if (
        !isPersonalDataCompleteForTemplate(personalData) ||
        !isPassportDataCompleteForTemplate(personalData)
      ) {
        setStepError('');
        navigation.navigate('CompletePersonalData', {
          templateText,
          templateName,
          templateId,
          templateSolution,
        });
        return;
      }

      setStepError('');
      setIsCheckingSignature(true);
      try {
        const { data } = await userApi.getVariables();
        const hasSignature = data?.hasSignature ?? data?.data?.hasSignature;

        if (!hasSignature) {
          navigation.navigate('Account', {
            screen: 'Signature',
            params: {
              templateText,
              templateName,
              templateId,
              templateSolution,
              fromDocumentFlow: true,
            },
          });
          return;
        }
      } catch (error) {
        console.log('signature check error:', error);
      } finally {
        setIsCheckingSignature(false);
      }

      navigation.navigate('DocumentCreate', {
        templateText,
        templateName,
        templateId,
        templateSolution,
      });
      return;
    }

    setStepError('');
    setCurrentStep(prev => prev + 1);
  }, [
    currentStep,
    isLastStep,
    handleSubmit,
    templateFactGroups,
    selectedFacts,
    radioFacts,
    personalData,
    navigation,
    templateText,
    templateName,
    templateId,
    templateSolution,
  ]);

  const handleStepPress = useCallback(
    stepIndex => {
      if (stepIndex === currentStep) {
        return;
      }

      if (stepIndex < currentStep) {
        setStepError('');
        setCurrentStep(stepIndex);
        return;
      }

      // Moving forward from the first step requires the form to be valid.
      if (currentStep === 0) {
        handleSubmit(() => {
          setStepError('');
          setCurrentStep(stepIndex);
        })();
        return;
      }

      setStepError('');
      setCurrentStep(stepIndex);
    },
    [currentStep, handleSubmit],
  );

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      return;
    }

    navigation.goBack();
  }, [currentStep, navigation]);

  const handleSelectFact = useCallback((fact, groupId) => {
    if (!groupId) {
      return;
    }

    setSelectedFacts(prev => {
      const current = prev[groupId] ?? [];
      const selectedIds = Array.isArray(current) ? current : [current];
      const isSelected = selectedIds.includes(fact.id);

      if (isSelected) {
        return {
          ...prev,
          [groupId]: selectedIds.filter(id => id !== fact.id),
        };
      }

      return {
        ...prev,
        [groupId]: [...selectedIds, fact.id],
      };
    });
  }, []);

  const headerContent = useMemo(() => {
    if (currentStep === 0) {
      return {
        title: 'Տվյալներ',
        subtitle: 'Լրացրեք անհրաժեշտ տվյալները՝',
      };
    }

    const factGroup = currentFactGroup?.factGroup;

    return {
      title: factGroup?.name ?? '',
      subtitle: factGroup?.description ?? '',
    };
  }, [currentStep, currentFactGroup]);

  const listData = useMemo(() => [{ key: `step-${currentStep}` }], [currentStep]);

  const renderStepContent = () => {
    if (currentStep === 0) {
      return <FillAct control={control} variables={templateVariables} />;
    }

    if (currentFactGroup) {
      return (
        <FillDates
          factGroup={currentFactGroup.factGroup}
          setRadioFacts={setRadioFacts}
          factsCheck={radioFacts}
          selectedFacts={selectedFacts}
          onSelectFact={handleSelectFact}
          errorMessage={stepError}
        />
      );
    }

    return null;
  };

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <Typography variant="h2" style={styles.headerTitle}>
          {headerContent.title}
        </Typography>
        <Typography variant="h6" tone="secondary" style={styles.headerSubtitle}>
          {headerContent.subtitle}
        </Typography>
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepPress={handleStepPress}
        />
      </>
    ),
    [
      steps,
      currentStep,
      handleStepPress,
      headerContent,
      styles.headerTitle,
      styles.headerSubtitle,
    ],
  );
  return (
    <>
      <View style={[styles.screen, ]}>
      <MainHeader onPress={handleBack} />
        <FlatList
          style={styles.list}
          data={listData}
          extraData={[currentStep, radioFacts, selectedFacts]}
          keyExtractor={item => item.key}
          ListHeaderComponent={ListHeaderComponent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contentContainer,
          ]}
          renderItem={() => (
            <AnimatedView
              key={currentStep}
              entering="SlideInRight"
              exiting="SlideOutLeft"
              animationConfig={{ duration: 350 }}
            >
              <View style={styles.stepContent}>{renderStepContent()}</View>
            </AnimatedView>
          )}
          removeClippedSubviews={false}
        />
        <AuthButton
          title={isLastStep ? 'Կազմել բողոք' : 'Առաջ'}
          onPress={handleNext}
          disabled={isCheckingSignature}
          isLoading={isCheckingSignature}
          endIcon={
            !isLastStep ? <ArrowSvg width={14} height={14} fill={palette.white} /> : null
          }
          style={[styles.footerButton, { bottom: TAB_BAR_BOTTOM_OFFSET }]}
        />
      </View>
    </>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 10,
    },
    list: {
      flex: 1,
    },
    contentContainer: {
      padding: 10,
    },
    headerTitle: {
      fontSize: 18,
      lineHeight: 24,
      marginBottom: 10,
      marginTop: 20,
    },
    headerSubtitle: {
      fontSize: 14,
      marginBottom: 20,
    },
    footerButton: {
      position: 'absolute',
      left: 10,
      right: 10,
    },
    stepContent: {
      gap: 16,
    },

  });
