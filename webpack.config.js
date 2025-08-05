const path = require("path");

const common = {
  devtool: false,
  resolve: {
    extensions: [".js", ".tsx", ".json", ".ts"],
  },
};

const electronMain = {
  target: "electron-main",
  entry: path.join(__dirname, "main", "index.ts"),
  output: {
    path: path.join(__dirname, "static"),
    filename: "main.build.js",
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  ...common,
};

const electronRenderer = {
  target: "electron-renderer",
  entry: path.join(__dirname, "renderer", "index.tsx"),
  output: {
    path: path.join(__dirname, "static"),
    filename: "renderer.build.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  ...common,
};


module.exports = [electronMain, electronRenderer];
