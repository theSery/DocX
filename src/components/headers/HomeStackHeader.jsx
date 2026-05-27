import React from 'react';
import { StyleSheet, View } from 'react-native';
import MainHeader from './MainHeader';
import { useThemedStyles } from '../../hooks';
import { SearchComponent } from '../titleComponents/SearchComponent';
import { Typography } from '../typography';

export const HOME_STACK_HEADER_HEIGHT = 200;

const createStyles = colors =>
  StyleSheet.create({
    container: {
      height: HOME_STACK_HEADER_HEIGHT,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    titleContainer: {
    marginTop: 10,
    },
    loginTitle: {
      letterSpacing: 2,
    },
    subTitle: {
      color: colors.textSecondary,
      letterSpacing: 0.4,
    },
 
  });

const HomeStackHeader = ({ onPress }) => {

  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: 10 }]}>
        <MainHeader onPress={onPress} />
      </View>
      <View style={styles.titleContainer}>
      <Typography variant="h2" style={styles.loginTitle}>
        Բաժիններ
      </Typography>
      <Typography variant="h6" style={[ styles.searchSubTitle]}>
        Ընտրեք բողոքարկվող փաստաթղթի տեսակը
      </Typography>
    </View>
      <SearchComponent />
    </View>
  );
};

export default HomeStackHeader;
