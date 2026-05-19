import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import foldersImage from '../../../../assets/images/folders.webp';
import whiteLogo from '../../../../assets/images/whiteLogo.webp';
import { Typography } from '../../../../components/typography';

export function MainContainer({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={whiteLogo} style={styles.logo} />
      <Image source={foldersImage} style={styles.image} />
      <Typography
        variant="h4"
        style={{ color: 'white', textAlign: 'center' }}>
        Ընդամենը 3 քայլ և Դուք կստեղծեք Ձեր դիմումները, բողոքներն ու այլ
        փաստաթղթերը
      </Typography>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation?.navigate('SignInUp');
        }}>
        <Typography variant="h5" style={{ color: '#1D3D81' }}>
          Ինչպե՞ս
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 24,
  },
  logo: {
    height: 58,
    width: 250,
  },
  image: {
    width: 280,
    height: 230,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 16,
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
