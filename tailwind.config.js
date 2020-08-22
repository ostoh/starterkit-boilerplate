const { colors } = require('tailwindcss/defaultTheme');

module.exports = {
  important: true,
  purge: false,
  separator: '_',
  theme: {
    colors: {
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      red: colors.red,
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
    },
    extend: {
      width: {
        '1o2': '50%',
        '1o3': '33.33333%',
        '2o3': '66.66667%',
        '1o4': '25%',
        '2o4': '50%',
        '3o4': '75%',
        '1o5': '20%',
        '2o5': '40%',
        '3o5': '60%',
        '4o5': '80%',
        '1o6': '16.66667%',
        '2o6': '33.33333%',
        '3o6': '50%',
        '4o6': '66.66667%',
        '5o6': '83.33333%',
      },
    },
  },
  variants: {
    margin: ['responsive', 'first', 'last', 'even', 'odd', 'hover', 'focus'],
  },
};
