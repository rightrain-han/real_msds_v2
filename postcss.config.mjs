// <CHANGE> @tailwindcss/postcss를 표준 tailwindcss와 autoprefixer로 교체
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
