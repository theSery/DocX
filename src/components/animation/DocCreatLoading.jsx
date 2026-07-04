// import { useMemo } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import {
//   buildTypingAnimationHtml,
//   DEFAULT_TYPING_DURATION,
//   getPdfWebViewBaseUrl,
// } from '../../documents';
// import { colors } from '../../theme';
// import { HEIGHT, WIDTH } from '../../utils/dimensions';
// import exampleData from '../../../example.json';

// const DocCreatLoading = ({
//   templateText = exampleData.templateText,
//   duration = DEFAULT_TYPING_DURATION,
//   style,
// }) => {
//   const webViewSource = useMemo(
//     () => ({
//       html: buildTypingAnimationHtml(templateText ?? '', duration),
//       baseUrl: getPdfWebViewBaseUrl(),
//     }),
//     [templateText, duration],
//   );

//   return (
//     <View style={[styles.screen, style]}>
//       <View style={styles.previewContainer}>
//         <View style={styles.webview}>
//           <WebView
//             originWhitelist={['*']}
//             source={webViewSource}
//             style={styles.webviewInner}
//             scrollEnabled
//             showsVerticalScrollIndicator={false}
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default DocCreatLoading;

// const styles = StyleSheet.create({
//   screen: {
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     zIndex: 8000,
//     width: WIDTH,
//     height: HEIGHT,
//     opacity: 0.8,
//     paddingHorizontal: 10,
//   },
//   previewContainer: {
//     flex: 1,
//     height: HEIGHT,
//     width: '100%',
//     overflow: 'hidden',
//     backgroundColor: '#9DA6BA',
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: colors.border,
//     padding: 10,
//     marginTop: 16,
//   },
//   webview: {
//     height: HEIGHT,
//     flex: 1,
//     backgroundColor: 'white',
//     padding: 16,
//     overflow: 'hidden',
//   },
//   webviewInner: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
// });
