import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { templatesApi } from '../../../api';
import AuthButton from '../../../components/buttons/AuthButton';
import ArrowSvg from '../../../components/icons/ArrowSvg';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import { StepIndicator } from '../../../components/stepIndicator';
import { useAuthSession, useThemedStyles } from '../../../hooks';
import { FillAct, FillDates } from './components/fillDetails';
import MainHeader from '../../../components/headers/MainHeader';
import { FormFlatList, Typography } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  resetDocumentFill,
  syncFactSelections,
} from '../../../store/slices/documentFillSlice';
import {
  AUTH_BUTTON_HEIGHT,
  TAB_BAR_BOTTOM_OFFSET,
} from '../../../utils/dimensions';
import { FONT_FAMILY, palette } from '../../../theme';
import {
  fetchPersonalData,
  selectHasNotificationAddress,
  selectHasSignature,
  selectIsEmailVerified,
  selectIsPhoneVerified,
  selectPersonalData,
  selectPersonalDataStatus,
} from '../../../store/slices/personalDataSlice';
import {
  isPersonalDataCompleteForTemplate,
  isPassportDataCompleteForTemplate,
} from '../../../utils/personalDataValidation';
import { isDateDataType } from '../../../utils/variableDataTypes';
import { normalizeTemplateFactGroups } from '../../../utils/templateFactGroups';

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
  const { isAuthenticated, openAuth } = useAuthSession();
  const {
    templateId,
    templateForm,
    templateSolution,
    templateFactGroups: routeFactGroups,
    templateName: routeTemplateName,
    categoryName,
  } = route.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const pendingStepRef = useRef(null);
  const [templateFactGroups, setTemplateFactGroups] = useState(() =>
    normalizeTemplateFactGroups(routeFactGroups),
  );
  const [templateText, setTemplateText] = useState('');
  const [templateName, setTemplateName] = useState(routeTemplateName ?? '');
  const [selectedFacts, setSelectedFacts] = useState({});
  const [radioFacts, setRadioFacts] = useState({});
  const [stepError, setStepError] = useState('');

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
        acc[variable.name] = isDateDataType(variable.dataType) ? null : '';
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
  const hasSignature = useAppSelector(selectHasSignature);
  const isPhoneVerified = useAppSelector(selectIsPhoneVerified);
  const isEmailVerified = useAppSelector(selectIsEmailVerified);
  const hasNotificationAddress = useAppSelector(selectHasNotificationAddress);

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
        const factGroups = normalizeTemplateFactGroups(
          response.data.templateFactGroups,
        );

        if (factGroups.length > 0) {
          setTemplateFactGroups(factGroups);
        }

        setTemplateText(response.data.templateText ?? '');
        setTemplateName(
          response.data.name ?? response.data.title ?? routeTemplateName ?? '',
        );
      })
      .catch(error => {
        // The endpoint requires a token; anonymous users keep the fact groups
        // that came from the public category hierarchy.
        if (error.type !== 'cancel') {
          console.log('template error:', error);
        }
      });

    return () => controller.abort();
  }, [templateId, routeTemplateName, isAuthenticated]);
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

  // Apply step change after direction so the outgoing view gets the correct exit animation.
  useLayoutEffect(() => {
    if (pendingStepRef.current == null) {
      return;
    }

    const nextStep = pendingStepRef.current;
    pendingStepRef.current = null;
    setCurrentStep(nextStep);
  }, [stepDirection]);

  const steps = useMemo(() => buildSteps(templateFactGroups), [templateFactGroups]);
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const currentFactGroup = currentStep > 0 ? templateFactGroups[currentStep - 1] : null;
  const isGoingForward = stepDirection >= 0;

  const goToStep = useCallback(
    (nextStep, direction) => {
      if (nextStep === currentStep) {
        return;
      }

      setStepError('');
      pendingStepRef.current = nextStep;

      if (direction === stepDirection) {
        // Direction unchanged — layout effect on stepDirection won't re-run; apply immediately.
        pendingStepRef.current = null;
        setCurrentStep(nextStep);
        return;
      }

      setStepDirection(direction);
    },
    [currentStep, stepDirection],
  );

  const handleNext = useCallback(async () => {
    if (currentStep === 0) {
      handleSubmit(() => {
        goToStep(currentStep + 1, 1);
      })();
      return;
    }

    if (isLastStep) {
      if (!isAuthenticated) {
        openAuth();
        return;
      }

      if (!hasAnyFactSelection(templateFactGroups, selectedFacts, radioFacts)) {
        setStepError('Ընտրեք առնվազն մեկ տարբերակ');
        return;
      }

      if (
        !isPersonalDataCompleteForTemplate(personalData) ||
        !isPassportDataCompleteForTemplate(personalData, hasNotificationAddress) ||
        !isPhoneVerified ||
        !isEmailVerified
      ) {
        setStepError('');
        navigation.navigate('CompletePersonalData', {
          templateText,
          templateName,
          templateId,
          templateSolution,
          categoryName,
        });
        return;
      }

      setStepError('');

      if (!hasSignature) {
        navigation.navigate('Account', {
          screen: 'Signature',
          params: {
            templateText,
            templateName,
            templateId,
            templateSolution,
            categoryName,
            fromDocumentFlow: true,
          },
        });
        return;
      }

      navigation.navigate('DocumentCreate', {
        templateText,
        templateName,
        templateId,
        templateSolution,
        categoryName,
      });
      return;
    }

    goToStep(currentStep + 1, 1);
  }, [
    goToStep,
    isAuthenticated,
    openAuth,
    currentStep,
    isLastStep,
    handleSubmit,
    templateFactGroups,
    selectedFacts,
    radioFacts,
    personalData,
    isPhoneVerified,
    isEmailVerified,
    hasNotificationAddress,
    hasSignature,
    navigation,
    templateText,
    templateName,
    templateId,
    templateSolution,
    categoryName,
  ]);

  const handleStepPress = useCallback(
    stepIndex => {
      if (stepIndex === currentStep) {
        return;
      }

      const direction = stepIndex < currentStep ? -1 : 1;

      if (stepIndex < currentStep) {
        goToStep(stepIndex, direction);
        return;
      }

      // Moving forward from the first step requires the form to be valid.
      if (currentStep === 0) {
        handleSubmit(() => {
          goToStep(stepIndex, direction);
        })();
        return;
      }

      goToStep(stepIndex, direction);
    },
    [currentStep, goToStep, handleSubmit],
  );

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1, -1);
      return;
    }

    navigation.goBack();
  }, [currentStep, goToStep, navigation]);

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

    return {
      title: currentFactGroup?.name ?? '',
      subtitle: currentFactGroup?.description ?? '',
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
          factGroup={currentFactGroup}
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
        <View style={styles.headerTextBlock}>
          <Typography
            variant="h2"
            style={styles.headerTitle}
            // numberOfLines={1}
          >
            {headerContent.title}
          </Typography>
          <Typography
            variant="h6"
            tone="secondary"
            style={styles.headerSubtitle}
            numberOfLines={2}
          >
            {headerContent.subtitle}
          </Typography>
        </View>
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
      styles.headerTextBlock,
      styles.headerTitle,
      styles.headerSubtitle,
    ],
  );
  return (
    <>
      <View style={styles.screen}>
        <MainHeader onPress={handleBack} />
        <FormFlatList
          style={styles.list}
          data={listData}
          extraData={[currentStep, stepDirection, radioFacts, selectedFacts]}
          keyExtractor={item => item.key}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          renderItem={() => (
            <AnimatedView
              key={currentStep}
              entering={isGoingForward ? 'SlideInRight' : 'SlideInLeft'}
              exiting={isGoingForward ? 'SlideOutLeft' : 'SlideOutRight'}
              animationConfig={{ duration: 350 }}
            >
              <View style={styles.stepContent}>{renderStepContent()}</View>
            </AnimatedView>
          )}
          removeClippedSubviews={false}
        />
      </View>
      <AuthButton
        title={isLastStep ? 'Կազմել բողոք' : 'Առաջ'}
        onPress={handleNext}
        endIcon={
          !isLastStep ? <ArrowSvg width={14} height={14} fill={palette.white} /> : null
        }
        style={[styles.footerButton, { bottom: TAB_BAR_BOTTOM_OFFSET + 10 }]}
      />
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
      marginTop: 5,
    },
    contentContainer: {
      padding: 10,
      paddingBottom: TAB_BAR_BOTTOM_OFFSET + AUTH_BUTTON_HEIGHT + 30,
    },
    headerTitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILY.bold,
      lineHeight: 24,
      marginBottom: 5,
    },
    headerSubtitle: {
      fontSize: 14,
    },
    footerButton: {
      position: 'absolute',
      left: 10,
      right: 10,
 
    },
    stepContent: {
      gap: 16,
    },
    headerTextBlock: {
      height: 92,
justifyContent: 'flex-start',  
alignItems: 'flex-start',  
  },
  });
