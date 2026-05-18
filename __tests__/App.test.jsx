/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-splash-view', () => ({
  hideSplash: jest.fn(),
  showSplash: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
  const { View: MockView } = require('react-native');
  return {
    GestureHandlerRootView: MockView,
  };
});

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
