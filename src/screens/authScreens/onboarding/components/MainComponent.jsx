import { View, Text } from 'react-native';
import GradientBackground from '../../../../components/GradientBackground';

export function MainComponent() {
  return(
    <GradientBackground isLight={false}>
      <View>
        <Text>Main Component</Text>
      </View>
    </GradientBackground>
  );
}