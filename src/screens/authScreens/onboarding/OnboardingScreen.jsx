import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import GradientBackground from '../../../components/GradientBackground';
import { useAuth } from '../../../contexts';
import onboardingData from './data';
import { CustomButton } from './components/CustomButton';
import { Pagination } from './components/Pagination';
import { RenderItem } from './components/RenderItem';

export function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAuth();
  const flatListRef = useAnimatedRef();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      flatListIndex.value = viewableItems[0].index;
    }
  }).current;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const handleComplete = useCallback(async () => {
    await completeOnboarding();
    navigation.navigate('AccountType');
  }, [completeOnboarding, navigation]);

  const renderItem = useCallback(
    ({ item, index }) => <RenderItem item={item} index={index} x={x} />,
    [x],
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <GradientBackground isLight={false}>
      <View style={styles.container}>
        <Animated.FlatList
          ref={flatListRef}
          onScroll={onScroll}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEventThrottle={16}
          horizontal
          bounces={false}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            minimumViewTime: 300,
            viewAreaCoveragePercentThreshold: 10,
          }}
        />
        <View style={styles.bottomContainer}>
          <Pagination data={onboardingData} x={x} />
          <CustomButton
            flatListRef={flatListRef}
            flatListIndex={flatListIndex}
            dataLength={onboardingData.length}
            x={x}
            onComplete={handleComplete}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    paddingVertical: 30,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
});
