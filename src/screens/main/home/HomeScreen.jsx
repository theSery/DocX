import { View } from 'react-native';
import { CategoriesList } from './components/CategoriesList';
import { useSelector } from 'react-redux';
import { useMainScreenStyles } from '../../../hooks';

export function HomeScreen({ navigation }) {
  const {items} = useSelector((state) => state.categories);
  const styles = useMainScreenStyles();
  return (
    <View style={styles.container}>
      <CategoriesList
        navigation={navigation}
        categories={items}
        collapsibleHeader={false}
      />
    </View>
  );
}
