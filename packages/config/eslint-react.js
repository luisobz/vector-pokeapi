import base from "./eslint-base.js";
import reactPlugin from "eslint-plugin-react";
export default [
  ...base,
  reactPlugin.configs.flat.recommended,
  { settings: { react: { version: "detect" } } }
];
