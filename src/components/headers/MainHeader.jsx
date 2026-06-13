import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
import BackButton from '../buttons/BackButton';
import darkLogo from '../../assets/images/darkLogo.webp';
const MainHeader = ({ onPress }) => {
  return (
<View style={styles.container}>
    <View style={styles.backButtonContainer}>
        {onPress ? (
            <BackButton onPress={onPress} />
        ) : <View style={{ width: 50, height: 50 }} />}
    </View>
    <View style={styles.logoContainer}>
        <Image source={darkLogo} style={styles.logo} resizeMode="contain" />
    </View>
    <View style={styles.backButtonContainer}></View>
</View>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButtonContainer: {
        width: '15%',
    },
    logoContainer: {
        width: '70%',
    },
    logo: {
        width: '100%',
        height: 40,
    },
});

export default MainHeader;