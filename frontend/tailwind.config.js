export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#17202a',
        mist: '#f5f7fa',
        school: {
          green: '#087f5b',
          blue: '#2563eb',
          amber: '#b7791f',
          rose: '#be123c'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
};
