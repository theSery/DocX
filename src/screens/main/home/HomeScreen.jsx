import { View } from 'react-native';
import { useSelector } from 'react-redux';

import { CategoriesList } from './components/CategoriesList';
import { useGlobalStyles } from '../../../hooks';

export function HomeScreen({ navigation }) {
  const { items } = useSelector(state => state.categories);
  const styles = useGlobalStyles();

  return (
    <View style={{ flex: 1 }}>
      <CategoriesList
        navigation={navigation}
        categories={items}
        collapsibleHeader={false}
      />
    </View>
  );
}
