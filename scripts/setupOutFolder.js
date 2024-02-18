import { join, dirname, resolve, relative } from 'path';
import { outputFolder } from '../settings.js';
import { exit } from 'process';
import fs from 'fs';

const root = resolve(dirname('.'));
const dist = resolve(root, outputFolder);
const distString = "./" + relative(root, dist) + "/";

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
  console.log(`\x1b[32m[SUCCESS]\x1b[0m Created output folder \x1b[30m${distString}\x1b[0m`);
  exit();
}

let paths = fs.readdirSync(dist, { recursive: false, withFileTypes: true, encoding: 'utf8' });
paths.forEach((path) => {
  let fullPath = join(dist, path.name);
  fs.rmSync(fullPath, { recursive: true });
});

console.log(`\x1b[32m[SUCCESS]\x1b[0m Cleared output folder \x1b[30m${distString}\x1b[0m`);
