import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { templatesApi } from '../../../api';
import AuthButton from '../../../components/buttons/AuthButton';
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
import { fetchPersonalData, selectPersonalDataStatus } from '../../../store/slices/personalDataSlice';

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
  const { templateId = 73 } = route.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [templateFactGroups, setTemplateFactGroups] = useState([]);
  const [templateText, setTemplateText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedFacts, setSelectedFacts] = useState({});
  const [radioFacts, setRadioFacts] = useState({});
  const [stepError, setStepError] = useState('');
  const { control, handleSubmit } = useForm({
    defaultValues: {
      Act_date: null,
      Act_number: '',
    },
    reValidateMode: 'onChange',
  });
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

  const handleNext = useCallback(() => {
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

      setStepError('');
      navigation.navigate('DocumentCreate', {
        templateText,
        templateName,
        templateId,
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
    navigation,
    templateText,
    templateName,
    templateId,
  ]);

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
        if (selectedIds.length <= 1) {
          return prev;
        }

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
      return <FillAct control={control} />;
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
        <Typography variant="h6" style={styles.headerSubtitle}>
          {headerContent.subtitle}
        </Typography>
        <StepIndicator steps={steps} currentStep={currentStep} />
      </>
    ),
    [steps, currentStep, headerContent, styles.headerTitle, styles.headerSubtitle],
  );

  return (
    <>
      <MainHeader onPress={handleBack} />
      <View style={styles.screen}>
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
