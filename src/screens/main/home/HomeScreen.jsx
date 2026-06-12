import { useEffect } from 'react';
import { View } from 'react-native';

import { CategoriesList } from './components/CategoriesList';
import { useGlobalStyles } from '../../../hooks';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  fetchPersonalData,
  selectPersonalDataStatus,
} from '../../../store/slices/personalDataSlice';

export function HomeScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.categories);
  // const personalDataStatus = useAppSelector(selectPersonalDataStatus);
  // const styles = useGlobalStyles();

  // useEffect(() => {
  //   if (personalDataStatus === 'idle') {
  //     dispatch(fetchPersonalData());
  //   }
  // }, [dispatch, personalDataStatus]);

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
