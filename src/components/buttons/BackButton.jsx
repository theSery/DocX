import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/AntDesign';
import leftIcon from '../../assets/images/leftIcon.webp';
const BackButton = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} >
    <Image source={leftIcon} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
});

export default BackButton;