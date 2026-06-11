import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { templatesApi } from '../../../api';
import AuthButton from '../../../components/buttons/AuthButton';
import BackButton from '../../../components/buttons/BackButton';
import { AnimatedView } from '../../../components/animation/AnimatedView';
import { StepIndicator } from '../../../components/stepIndicator';
import { useThemedStyles } from '../../../hooks';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { FillAct, FillDates } from './components/fillDetails';
import { SafeAreaView } from 'react-native-safe-area-context';
import MainHeader from '../../../components/headers/MainHeader';

function buildSteps(templateFactGroups = []) {
  const actStep = { key: 'act', label: 'Մանրամասներ' };
  const factSteps = templateFactGroups.map((group, index) => ({
    key: `fact-${group.id ?? index}`,
    label: group.name,
  }));

  return [actStep, ...factSteps];
}

export function FillInDetailsScreen({ navigation, route }) {
  const styles = useThemedStyles(createStyles);
  const { templateId = 73 } = route.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [templateFactGroups, setTemplateFactGroups] = useState([]);
  const [selectedFacts, setSelectedFacts] = useState({});
  const [radioFacts, setRadioFacts] = useState({});
  const { control } = useForm({
    defaultValues: {
      actDate: null,
      actField: '',
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    templatesApi
      .getTemplateById(templateId, { signal: controller.signal })
      .then(response => {
        setTemplateFactGroups(response.data.templateFactGroups ?? []);
      })
      .catch(error => {
        if (error.type !== 'cancel') {
          console.log('template error:', error);
        }
      });

    return () => controller.abort();
  }, [templateId]);

  const steps = useMemo(() => buildSteps(templateFactGroups), [templateFactGroups]);
  const totalSteps = steps.length;
  const isLastStep = currentStep >= totalSteps - 1;
  const currentFactGroup = currentStep > 0 ? templateFactGroups[currentStep - 1] : null;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

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

    setSelectedFacts(prev => ({
      ...prev,
      [groupId]: fact.id,
    }));
  }, []);

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
        />
      );
    }

    return null;
  };

  const ListHeaderComponent = useMemo(
    () => (
      <>
        <ContentTiltes
          title="Էլ-փոստի հաստատում"
          subtitle="Մուտքագրեք Ձեր էլ-փոստին ուղարկված կոդը"
        />
        <StepIndicator steps={steps} currentStep={currentStep} />
      </>
    ),
    [steps, currentStep],
  );

  const ListFooterComponent = useMemo(
    () => (
      <AuthButton
        title="Հաջորդ"
        onPress={handleNext}
        disabled={isLastStep}
        style={styles.footerButton}
      />
    ),
    [handleNext, isLastStep, styles.footerButton],
  );

  return (
    <> 
     <MainHeader onPress={handleBack} />
    <FlatList
      style={styles.screen}
      data={listData}
      extraData={[currentStep, radioFacts, selectedFacts]}
      keyExtractor={item => item.key}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      renderItem={() => (
        <AnimatedView
          key={currentStep}
          entering="SlideInRight"
          exiting="SlideOutLeft"
          animationConfig={{ duration: 350 }}
        >
          <View style={styles.stepContent}>
       
            {renderStepContent()}
          </View>
        </AnimatedView>
      )}
      removeClippedSubviews={false}
    />
    </>
  );
}

const createStyles = colors =>
  StyleSheet.create({
    screen: {
      flex: 1,
      // backgroundColor: colors.background,
      // backgroundColor: 'red',
      // height: '90%',
      // width: '100%',
      // alignItems: 'center',
      // justifyContent: 'center',
      // padding: 10,
      // paddingBottom: 24,
    },
    contentContainer: {
      flexGrow: 1,
      padding: 10,
      paddingBottom: 24,
    },
    footerButton: {
      marginTop: 24,
    },
    stepContent: {
      gap: 16,
    },
  });
