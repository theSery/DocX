
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Pressable } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
import BackButton from '../../buttons/BackButton';
import ligtBlueButton from '../../../assets/images/ligtBlueButton.webp';
import { Typography } from '../../typography';
import { palette } from '../../../theme';
import LogoutSvg from '../../icons/LogoutSvg';
const AccountHeader = ({ onPress, title, isBackButton }) => {
  return (
<View style={styles.container}>
    <View style={styles.backButtonContainer}>
        {/* <BackButton onPress={onPress} /> */}
    </View>
    <View style={styles.logoContainer}>
    <Typography variant="h2" style={{ color: palette.white, fontSize: !isBackButton ? 16 : 24 }}>{title}</Typography>
    </View>
    <View style={styles.backButtonContainer}>
    <Pressable onPress={onPress} activeOpacity={0.7} style={styles.logOut}>
    <Image source={ligtBlueButton} style={styles.image} resizeMode="contain" />
    <LogoutSvg fill={palette.white} width={20} height={20} />
    </Pressable>
    </View>
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
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',

      },
      logOut: {
        position: 'relative',
        width: '100%',
        height: 50,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
      },
});

export default AccountHeader;