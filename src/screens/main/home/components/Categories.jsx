import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMainScreenStyles } from '../../../../hooks';
import Animated, { Easing, SharedTransition } from 'react-native-reanimated';
export const SPACING = 10;
export const ITEM_HEIGHT = Dimensions.get('window').height * 0.2;
const customTransition = SharedTransition.duration(550).easing(Easing.bezier(0.25, 0.1, 0.25, 1.0));
const categories = [
    {
        id: 1,
        name: 'Category 1',
        description: 'Category 1 description',
        image: require('../../../../assets/images/folders.webp'),
        backgroundColor: 'red',
    },

    {
        id: 2,
        name: 'Category 2',
        description: 'Category 2 description',
        image: require('../../../../assets/images/emailCheck.webp'),
        backgroundColor: 'blue',
    },
    {
        id: 3,
        name: 'Category 3',
        description: 'Category 3 description',
        image: require('../../../../assets/images/folders.webp'),
        backgroundColor: 'green',
    },
    {
        id: 4,
        name: 'Category 4',
        description: 'Category 4 description',
        image: require('../../../../assets/images/folders.webp'),
        backgroundColor: 'yellow',
    },
    {
        id: 5,
        name: 'Category 5',
        description: 'Category 5 description',
        image: require('../../../../assets/images/folders.webp'),
        backgroundColor: 'purple',
    },
    {
        id: 6,
        name: 'Category 6',
        description: 'Category 6 description',
        image: require('../../../../assets/images/folders.webp'),
        backgroundColor: 'orange',
    },
];
export function Categories({ navigation }) {
    //   const styles = useMainScreenStyles();
    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                contentContainerStyle={{ padding: SPACING }}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity style={{ marginBottom: SPACING, height: ITEM_HEIGHT }} onPress={() => navigation.navigate('Category', { item })}>
                            <View style={styles.categoryItemImage}>
{/* <Animated.View > */}
<Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: item.backgroundColor, borderRadius: 10 }]} sharedTransitionTag={`category-bg-${item.id}`}    sharedTransitionStyle={customTransition}/>
{/* </Animated.View> */}
                              

                                    <Animated.Text style={styles.categoryItemText} sharedTransitionTag={`category-text-${item.id}`}    sharedTransitionStyle={customTransition}>{item.name}</Animated.Text>
                                    <Text style={styles.categoryItemText}>{item.description}</Text>
                                    <Animated.Image
                                     source={item.image}
                                     sharedTransitionStyle={customTransition}
                                     style={styles.categoryItemImageIcon} sharedTransitionTag={`category-image-${item.id}`}/>
                                {/* </View> */}


                            </View>


                        </TouchableOpacity>
                    );
                }}
            />
            <Animated.View style={styles.bg} sharedTransitionTag={`general-bg`}    sharedTransitionStyle={customTransition}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'red',
    },
    categoryItemImage: {
        flex: 1,
        padding: SPACING,
        // backgroundColor: 'red',
        // width: '100%',
        // height: 100,
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
    },
    categoryItemText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    categoryItemImageIcon: {
        width: ITEM_HEIGHT * 0.8,
        height: ITEM_HEIGHT * 0.8,
        resizeMode: 'contain',
        position: 'absolute',
        bottom: 0,
        right: SPACING,
    },
    bg: {
        position: 'absolute',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: 'blue',
        transform: [{translateY: Dimensions.get('window').height }],
        borderRadius: 32,
    },
});