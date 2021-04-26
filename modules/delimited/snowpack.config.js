/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {

  "mount": {
    "src/main/web": "/delimited"
  },
  "buildOptions": {
    "sourcemap": true,
    "out": "./target/web-build"
  }
};