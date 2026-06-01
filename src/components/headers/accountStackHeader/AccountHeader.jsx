
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
import BackButton from '../../buttons/BackButton';
import whiteLogo from '../../../assets/images/whiteLogo.webp';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
const AccountHeader = ({ onPress, title }) => {
  return (
<View style={styles.container}>
    <View style={styles.backButtonContainer}>
        {/* <BackButton onPress={onPress} /> */}
    </View>
    <View style={styles.logoContainer}>
    <Typography variant="h2" style={{ color: palette.white }}>{title}</Typography>
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
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: 40,
    },
});

export default AccountHeader;