import { createDefaultPreset } from "ts-jest";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.development",
});

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/

const settings = {
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 10000,
  transform: {
    ...tsJestTransformCfg,
  },
};

export default settings;
