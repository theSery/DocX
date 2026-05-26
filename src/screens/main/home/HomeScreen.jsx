import { Pressable, ScrollView, Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';

export function HomeScreen({ navigation }) {
  const styles = useMainScreenStyles();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
      <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable>
    </ScrollView>
  );
}
