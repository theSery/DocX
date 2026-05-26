import { View } from 'react-native';
import LottieView from 'lottie-react-native';

const LottieAnimation = ({ source, autoPlay = true, loop = true, timing = 1000, duration = 1000, style }) => {
    return (
        <View>
            <LottieView
                source={source}
                autoPlay={autoPlay}
                loop={loop}
                style={style}
                timing={timing}
                duration={duration}
            />
        </View>
    );
};

export default LottieAnimation;