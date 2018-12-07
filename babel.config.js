
module.exports = function (api) {
  api.cache(false);
  const presets = ['@babel/preset-env'];
  const plugins = [ 
    ["@babel/plugin-transform-react-jsx", {
      "pragma": "Nobi.createElement", // default pragma is React.createElement
    }],
   ];
  return {
    presets,
    plugins
  };
}

