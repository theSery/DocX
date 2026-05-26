import { Pressable, Text, View } from 'react-native';
import { useMainScreenStyles } from '../../../hooks';
import { ContentTiltes } from '../../../components/titleComponents/ContentTiltles';
import { Categories } from './components/Categories';
import Animated, { Easing, SharedTransition } from 'react-native-reanimated';
const customTransition = SharedTransition.duration(550).easing(Easing.bezier(0.25, 0.1, 0.25, 1.0));
export function HomeScreen({ navigation }) {
  const styles = useMainScreenStyles();
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{  }} sharedTransitionTag={`title-container`}    sharedTransitionStyle={customTransition}>
      <ContentTiltes title="Բաժիններ" subtitle="Ընտրեք բողոքարկվող փաստաթղթի տեսակը" />
      </Animated.View>

      <Categories navigation={navigation}/>
      {/* <Text style={styles.title}>DocX</Text>
      <Text style={styles.subtitle}>Your documents, organized</Text> */}
      {/* <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FillInDetails')}>
        <Text style={styles.primaryButtonText}>Fill in details</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('DocumentCreate')}>
        <Text style={styles.secondaryButtonText}>Create document</Text>
      </Pressable> */}
    </View>
  );
}
