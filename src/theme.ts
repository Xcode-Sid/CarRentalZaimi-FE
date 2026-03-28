import { createTheme, type MantineColorsTuple } from '@mantine/core';

const teal: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#2DD4A8',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
];

const green: MantineColorsTuple = [
  '#ebfbee',
  '#d3f9d8',
  '#b2f2bb',
  '#8ce99a',
  '#69db7c',
  '#51cf66',
  '#40c057',
  '#37b24d',
  '#2f9e44',
  '#2b8a3e',
];

const gold: MantineColorsTuple = [
  '#fff9eb',
  '#fff0c5',
  '#ffe69e',
  '#ffd970',
  '#F5B544',
  '#e8a630',
  '#d09522',
  '#b88418',
  '#9f7310',
  '#7a590d',
];

export const theme = createTheme({
  primaryColor: 'teal',
  colors: {
    teal,
    green,
    gold,
    dark: [
      '#F0F6FC',
      '#E6EDF3',
      '#C9D1D9',
      '#8B949E',
      '#484F58',
      '#30363D',
      '#21262D',
      '#1C2128',
      '#161B22',
      '#0D1117',
    ],
  },
  fontFamily: "'Inter', sans-serif",
  headings: { fontFamily: "'Inter', sans-serif" },
  defaultRadius: 'md',
  other: {
    accentCta: '#2DD4A8',
    highlight: '#2DD4A8',
    gold: '#F5B544',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    lightBg: '#F8FAFC',
    lightSurface: '#FFFFFF',
    lightText: '#1E293B',
    lightTextSecondary: '#64748B',
    lightBorder: '#E2E8F0',
  },
});
