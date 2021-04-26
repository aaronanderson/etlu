/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {

  "mount": {
    "src/main/web": "/core"
  },
  "buildOptions": {
    "sourcemap": true,
    "out": "./target/web-build"
  }
};