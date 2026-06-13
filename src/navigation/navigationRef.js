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

export function navigateToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Auth');
  }
}
