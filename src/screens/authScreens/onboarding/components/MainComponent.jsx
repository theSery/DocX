import { View, Image, StyleSheet } from 'react-native';
import GradientBackground from '../../../../components/GradientBackground';
import { Typography } from '../../../../components/typography';
import foldersImage from '../../../../assets/images/folders.webp';
export function MainComponent() {
  return(
    <GradientBackground isLight={false}>
        <View style={styles.container}>
        <Image source={foldersImage} style={styles.image} />
        <Typography variant="h4" style={styles.text}>Ընդամենը 3 քայլ և Դուք կստեղծեք Ձեր դիմումները, բողոքներն ու այլ փաստաթղթերը</Typography>
      </View>
    </GradientBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '90%',
  },
  image: {
    width: 280,
    height: 250,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});