import { StyleSheet, View } from 'react-native';
import { Dot } from './Dot';

export function Pagination({ data, x }) {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <Dot key={index} index={index} x={x} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
