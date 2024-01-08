import type { StorybookConfig } from "@storybook/react-webpack5";
import * as path from "path";
import MiniCssExtractPlugin = require("mini-css-extract-plugin");
const jaguarConfig = require("../webpack.config");

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
  ],
  staticDirs: ["../dist", "../msw"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    /* Replacing the storybook CSS config with the CSS rules from the webpack.config file */
    // @ts-ignore
    config.module.rules = config.module.rules.filter(f => f.test?.toString() !== "/\\.css$/");
    const jaguarCssRule = jaguarConfig.module.rules.find(f => f.test?.toString() === "/\\.css$/");
    config.module.rules = [...config.module.rules, jaguarCssRule];

    config.resolve = {
      ...config.resolve,
      modules: [
          ...(config.resolve.modules || []),
        path.resolve(__dirname, "..")
      ],
    };

    config.plugins = [
      ...config.plugins,
        new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css",
          ignoreOrder: true,
        }),
    ];

    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {loader: "babel-loader"},
          {
            loader: "ts-loader",
            options: {
              configFile: "../tsconfig.json",
            },
          },
        ],
      },
    ];

    return config;
  },
};
export default config;
