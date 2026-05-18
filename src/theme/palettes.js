export const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  subtleText: '#475569',
  border: '#cbd5e1',
  primary: '#1D4ED8',
  accent: '#0f766e',
  input: '#f1f5f9',
};

export const darkColors = {
  background: '#020617',
  surface: '#0f172a',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  subtleText: '#cbd5e1',
  border: '#334155',
  primary: '#3b82f6',
  accent: '#14b8a6',
  input: '#1e293b',
};

export function getPalette(scheme) {
  return scheme === 'dark' ? darkColors : lightColors;
}
