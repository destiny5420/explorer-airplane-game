const postcssPresetEnv = require('postcss-preset-env')
const autoprefixer = require('autoprefixer')({
  grid: true,
  overrideBrowserslist: ['> 1%', 'last 5 versions', 'Firefox >= 45', 'ios >= 8', 'ie >= 10'],
})

module.exports = {
  plugins: [postcssPresetEnv, autoprefixer],
}
