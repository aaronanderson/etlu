//const fs = require("fs").promises;
const sass = require('sass')

module.exports = function (snowpackConfig, pluginOptions) {
  return {
    name: 'lit-css-plugin',
    resolve: {
      input: ['.scss'],
      output: ['.js'],
    },
    async load({ filePath }) {
      console.log("lit-scss-plugin", filePath);
      //const fileContents = await fs.readFile(filePath, 'utf-8');
      const result = sass.renderSync({
        file: filePath,
          includePaths: ["node_modules"]
        });
      return `export default ${JSON.stringify(result.css.toString())}`;
    }

  };
}
