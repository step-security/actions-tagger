import type { JestConfigWithTsJest } from 'ts-jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import { readFileSync } from 'node:fs';
const { compilerOptions } = JSON.parse(
  readFileSync('./tsconfig.json', 'utf8')
) as { compilerOptions: { paths: Record<string, string[]> } };

// https://jestjs.io/docs/en/configuration
const config: JestConfigWithTsJest = {
  bail: process.env.CI === 'true' ? 0 : 1,
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tests/tsconfig.json',
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  cache: process.env.CI !== 'true', // disable caching in CI environments
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

const githubActionsReporters: JestConfigWithTsJest['reporters'] = [
  ['github-actions', { silent: false }],
  'summary',
];
if (process.env.GITHUB_ACTIONS === 'true') {
  config.reporters = githubActionsReporters;
}

export default config;
