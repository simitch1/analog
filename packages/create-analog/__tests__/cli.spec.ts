import { join } from 'node:path';
import type { ExecaSyncReturnValue, SyncOptions } from 'execa';
import { commandSync } from 'execa';
import { mkdirpSync, readdirSync, remove, writeFileSync } from 'fs-extra';
import { afterEach, beforeAll, expect, test } from 'vitest';

const CLI_PATH = join(__dirname, '..');

const projectName = 'test-app';
const genPath = join(__dirname, projectName);

const run = (
  args: string[],
  options: SyncOptions<string> = {}
): ExecaSyncReturnValue<string> => {
  return commandSync(`node ${CLI_PATH} ${args.join(' ')}`, options);
};

// Helper to create a non-empty directory
const createNonEmptyDir = () => {
  // Create the temporary directory
  mkdirpSync(genPath);

  // Create a package.json file
  const pkgJson = join(genPath, 'package.json');
  writeFileSync(pkgJson, '{ "foo": "bar" }');
};

// Angular 15 starter template
let templateFiles = readdirSync(join(CLI_PATH, 'template-angular-v15'));
templateFiles.push('.git');
// _gitignore is renamed to .gitignore
templateFiles = templateFiles
  .map((filePath) => (filePath === '_gitignore' ? '.gitignore' : filePath))
  .sort();

beforeAll(() => remove(genPath));
afterEach(() => remove(genPath));

test('prompts for the project name if none supplied', () => {
  const { stdout, exitCode } = run([]);
  expect(stdout).toContain('Project name:');
});

test('prompts for the framework if none supplied when target dir is current directory', () => {
  mkdirpSync(genPath);
  const { stdout } = run(['.'], { cwd: genPath });
  expect(stdout).toContain('Select a template:');
});

test('prompts for the framework if none supplied', () => {
  const { stdout } = run([projectName]);
  expect(stdout).toContain('Select a template:');
});

test('prompts for the framework on not supplying a value for --template', () => {
  const { stdout } = run([projectName, '--template']);
  expect(stdout).toContain('Select a template:');
});

test('prompts for the framework on supplying an invalid template', () => {
  const { stdout } = run([projectName, '--template', 'unknown']);
  expect(stdout).toContain(
    `"unknown" isn't a valid template. Please choose from below:`
  );
});

test('asks to overwrite non-empty target directory', () => {
  createNonEmptyDir();
  const { stdout } = run([projectName], { cwd: __dirname });
  expect(stdout).toContain(`Target directory "${projectName}" is not empty.`);
});

test('asks to overwrite non-empty current directory', () => {
  createNonEmptyDir();
  const { stdout } = run(['.'], { cwd: genPath });
  expect(stdout).toContain(`Current directory is not empty.`);
});

test('successfully scaffolds a project based on angular starter template', () => {
  const { stdout } = run([projectName, '--template', 'angular-v15'], {
    cwd: __dirname,
  });
  const generatedFiles = readdirSync(genPath).sort();

  // Assertions
  expect(stdout).toContain(`Scaffolding project in ${genPath}`);
  expect(templateFiles).toEqual(generatedFiles);
});

test('works with the -t alias', () => {
  const { stdout } = run([projectName, '-t', 'angular-v15'], {
    cwd: __dirname,
  });
  const generatedFiles = readdirSync(genPath).sort();

  // Assertions
  expect(stdout).toContain(`Scaffolding project in ${genPath}`);
  expect(templateFiles).toEqual(generatedFiles);
});
