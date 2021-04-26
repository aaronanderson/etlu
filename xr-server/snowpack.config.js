/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {

  "mount": {
    "src/main/web": "/"
  },
  "buildOptions": {
    "sourcemap": true,
    "out": "./target/web-build"
  },
    "packageOptions": {
  	"external": ["etlu-modules"]
  },
  "plugins": [
    [
      "./lit-scss-plugin.js",
      {}
    ]
  ]
};
