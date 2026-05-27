import { StyleSheet } from 'react-native';
import { Typography } from '../typography';
import { palette } from '../../theme';

export function ContentTiltes({ title, subtitle, isSearch = false }) {
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

const styles = StyleSheet.create({
  loginTitle: {
    letterSpacing: 2,
    marginTop: 20,
  },
  subTitle: {
    color: palette.gray,
    marginBottom: 30,
    letterSpacing: 0.4,
  },
  searchSubTitle: {
    marginBottom: -10,
  },
});
