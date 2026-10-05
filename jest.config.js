import { createDefaultPreset } from "ts-jest";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.development",
});

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>"],
  transform: {
    ...tsJestTransformCfg,
  },
};
