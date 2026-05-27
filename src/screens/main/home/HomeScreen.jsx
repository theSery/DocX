import { View } from 'react-native';
import { CategoriesList } from './components/CategoriesList';
import { useSelector } from 'react-redux';

export function HomeScreen({ navigation }) {
  const {items} = useSelector((state) => state.categories);

  return (
    <View style={{ flex: 1 }}>
      <CategoriesList navigation={navigation} categories={items}/>
    </View>
  );
}
