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
    headerRow: {
      paddingTop: 10,
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

const HomeStackHeader = ({ onPress, title, subtitle, showSearch = true }) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MainHeader onPress={onPress} />
      </View>
      {(title || subtitle) && (
        <View style={styles.titleContainer}>
          {title ? (
            <Typography variant="h2" style={styles.loginTitle}>
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="h6" style={styles.subTitle}>
              {subtitle}
            </Typography>
          ) : null}
        </View>
      )}
      {showSearch ? <SearchComponent /> : null}
    </View>
  );
};

export default HomeStackHeader;
