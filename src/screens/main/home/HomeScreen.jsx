import OnboardingBackground from '../../../components/OnboardingBackground';

export function HomeScreen({ navigation }) {
  return (
    <OnboardingBackground />
    // <View style={styles.container}>
    //   <Text style={styles.title}>DocX</Text>
    //   <Text style={styles.subtitle}>Your documents, organized</Text>
    //   <Pressable
    //     style={styles.primaryButton}
    //     onPress={() => navigation.navigate('FillInDetails')}>
    //     <Text style={styles.primaryButtonText}>Fill in details</Text>
    //   </Pressable>
    //   <Pressable
    //     style={styles.secondaryButton}
    //     onPress={() => navigation.navigate('DocumentCreate')}>
    //     <Text style={styles.secondaryButtonText}>Create document</Text>
    //   </Pressable>
    // </View>
  );
}
