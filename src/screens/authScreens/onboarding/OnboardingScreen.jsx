import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuth } from '../../../contexts';
import { setAndroidSystemBars } from '../../../utils/systemBars';
import onboardingData from './data';
import { CustomButton } from './components/CustomButton';
import { Pagination } from './components/Pagination';
import { RenderItem } from './components/RenderItem';
import { MainContainer } from './components/MainContainer';
import { useResponsiveLayout } from '../../../hooks';

export function OnboardingScreen({ navigation }) {
  const { completeOnboarding } = useAuth();
  const flatListRef = useAnimatedRef();
  const x = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMainContainer, setIsMainContainer] = useState(true);
  const [listHeight, setListHeight] = useState(0);
  const layout = useResponsiveLayout();
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      x.value = event.contentOffset.x;
    },
  });

  const handleComplete = useCallback(async () => {
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }, [completeOnboarding, navigation]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <RenderItem
        item={item}
        index={index}
        x={x}
        layout={layout}
        slideHeight={listHeight}
      />
    ),
    [layout, listHeight, x],
  );

  const handleListLayout = useCallback(event => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setListHeight(current => (current === nextHeight ? current : nextHeight));
  }, []);

  useEffect(() => {
    setAndroidSystemBars(isMainContainer);
  }, [isMainContainer]);

  const keyExtractor = useCallback(item => item.id.toString(), []);

  const handlePress = useCallback(() => {
    setIsMainContainer(false);
  }, []);

  return (
    <AuthScreenLayout
      withGradient
      gradientIsLight={!isMainContainer}
      contentStyle={[
        styles.layoutContent,
        layout.compact ? { marginTop: layout.topOffset } : null,
      ]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={!isMainContainer ? 'dark-content' : 'light-content'}
      />
      {isMainContainer ? (
        <MainContainer handlePress={handlePress} layout={layout} />
      ) : (
        <View style={styles.container} onLayout={layout.compact ? handleListLayout : undefined}>
          <Animated.FlatList
            ref={flatListRef}
            style={styles.list}
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
          <View
            style={[
              styles.bottomContainer,
              layout.compact
                ? {
                    bottom: layout.bottomOffset,
                    paddingVertical: layout.controlsPadding,
                  }
                : null,
            ]}>
            <CustomButton
              flatListRef={flatListRef}
              currentIndex={currentIndex}
              dataLength={onboardingData.length}
              x={x}
              onComplete={handleComplete}
              isBackButton={true}
            />
            <Pagination data={onboardingData} x={x} />
            <CustomButton
              flatListRef={flatListRef}
              currentIndex={currentIndex}
              dataLength={onboardingData.length}
              x={x}
              onComplete={handleComplete}
              isBackButton={false}
            />
          </View>
        </View>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  layoutContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginTop: '25%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  list: {
    flex: 1,
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
    zIndex: 2,
  },
});
