import { View } from 'react-native';
import LottieView from 'lottie-react-native';

const LottieAnimation = ({ source, autoPlay = true, loop = true, timing , duration , style }) => {
    return (
            <LottieView
                source={source}
                autoPlay={autoPlay}
                loop={loop}
                style={style}
            />
    );
};

export default LottieAnimation;