import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function resetToMain() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      }),
    );
  }
}

export function completeAuthToMain() {
  if (!navigationRef.isReady()) {
    return;
  }

  const hasMainRoute = navigationRef
    .getRootState()
    .routes.some(route => route.name === 'Main');

  if (hasMainRoute) {
    navigationRef.navigate('Main');
    return;
  }

  resetToMain();
}

export function resetToFaceId() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'FaceId' }],
      }),
    );
  }
}

export function navigateToPinVerification() {
  if (navigationRef.isReady()) {
    // Open FaceId stack directly on PinVerification — never mount FaceIdHome
    // (biometric runs only on FaceIdHome).
    navigationRef.navigate('FaceId', {
      state: {
        index: 0,
        routes: [{ name: 'PinVerification' }],
      },
    });
  }
}

export function navigateToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Auth');
  }
}
