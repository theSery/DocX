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

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Canvas: ({ children }) => React.createElement(View, null, children),
    Circle: View,
    Image: View,
    ImageShader: View,
    makeImageFromView: jest.fn(() => Promise.resolve(null)),
    mix: jest.fn((a, b, c) => c),
    vec: jest.fn((x, y) => ({ x, y })),
    dist: jest.fn(() => 0),
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
