import { StyleSheet } from 'react-native';
import { Typography } from '../typography';
import { useIsCompactScreen, useThemedStyles } from '../../hooks';

export function ContentTiltes({ title, subtitle, isSearch = false, isMarginBottom = false }) {
  const styles = useThemedStyles(createStyles);
  const isCompactScreen = useIsCompactScreen();
  return (
    <>
      <Typography
        variant="h2"
        style={[styles.loginTitle, isCompactScreen && styles.loginTitleCompact, isMarginBottom && styles.loginTitleMarginBottom]}
      >
        {title}
      </Typography>
      <Typography
        variant="h6"
        style={[
          styles.subTitle,
          isCompactScreen && styles.subTitleCompact,
          isSearch && styles.searchSubTitle,
          isSearch && isCompactScreen && styles.searchSubTitleCompact,
        ]}
      >
        {subtitle}
      </Typography>
    </>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  loginTitle: {
    letterSpacing: 2,
    marginTop: 20,
  },
  loginTitleCompact: {
    letterSpacing: 0.9,
    marginTop: 8,
  },
  subTitle: {
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 0.4,
  },
  subTitleCompact: {
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  searchSubTitle: {
    marginBottom: -10,
  },
  searchSubTitleCompact: {
    marginBottom: -6,
  },
  loginTitleMarginBottom: {
    marginBottom: 10,
  },
});
