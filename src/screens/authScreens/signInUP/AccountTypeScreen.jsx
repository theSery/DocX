import { Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { AuthScreenLayout } from '../../../components/layout';
import { useAuthScreenStyles } from '../../../hooks';
// import { useAuthScreenStyles } from '../../hooks';


export function AccountTypeScreen({ navigation }) {


  return (
    <AuthScreenLayout
     withGradient
      gradientIsLight={false} 
      gradientHeight={'30%'}
      contentStyle={styles.screen}>
    {/* // <GradientBackground
    //   isLight={false}
    //   contentStyle={styles.screen}
    //   isReversed
    //   gradientHeight={'30%'}
    // > */}
      <StatusBar barStyle="light-content" />
      {/* <View style={styles.content}>
        <View style={styles.radiusContainer}>

        </View>
        <Text style={styles.title}>Account type</Text>
        <Text style={styles.subtitle}>Choose how you will use DocX.</Text>
      </View> */}
    </AuthScreenLayout>
    // <AuthScreenLayout style={styles.screen}>
    //   <View style={styles.content}>
    //     <Text style={styles.title}>Account type</Text>
    //     <Text style={styles.subtitle}>Choose how you will use DocX.</Text>
    //     <Pressable
    //       style={styles.primaryButton}
    //       onPress={() => navigation.navigate('SignInUp')}>
    //       <Text style={styles.primaryButtonText}>Continue</Text>
    //     </Pressable>
    //   </View>
    // </AuthScreenLayout>
  );
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 10,
    height: '70%',
    width: '100%',
    bottom: 0,
  },
  radiusContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
 borderRadius: 100,
    position: 'absolute',
    top: -50,
    left: 0,
    zIndex: 10,
    rotate: '180deg',
    // transform: [{ rotate: '-90deg' }],
  },
});