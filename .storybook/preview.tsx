import * as React from "react";
import type { Preview } from "@storybook/react";
import {library} from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";
import {far} from "@fortawesome/free-regular-svg-icons";
library.add(fas);
library.add(far);

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  args: {
    backgroundColor: "inherit",
    width: 1200,
    height: 800,
  },
  argTypes: {
    backgroundColor: {
      control: "color",
    },
    width: {
      control: {type: "range", min: 300, max: 1700, step: 10},
    },
    height: {
      control: {type: "range", min: 300, max: 1100, step: 10},
    },
  },
  decorators: [
    (Story, {args}) => {
      return (
          <div style={{width: `${args.width}px`, height: `${args.height}px`}}>
            <Story />
          </div>
      );
    },
  ],
};

export default preview;
