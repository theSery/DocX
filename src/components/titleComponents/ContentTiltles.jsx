import { StyleSheet } from 'react-native';
import { Typography } from '../typography';
import { palette } from '../../theme';
import { useThemedStyles } from '../../hooks';

export function ContentTiltes({ title, subtitle, isSearch = false }) {
  const styles = useThemedStyles(createStyles);
  return (
    <>
      <Typography variant="h2" style={styles.loginTitle}>
        {title}
      </Typography>
      <Typography variant="h6" style={[styles.subTitle, isSearch && styles.searchSubTitle]}>
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
  subTitle: {
    color: colors.text,
    marginBottom: 30,
    letterSpacing: 0.4,
  },
  searchSubTitle: {
    marginBottom: -10,
  },
});
