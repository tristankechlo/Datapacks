import { join, dirname, resolve, relative, extname, sep } from 'path';
import { settings } from '../settings.js';
import { globSync } from 'glob';
import fs from 'fs';

const root = resolve(dirname('.'));
const dist = join(root, 'dist');

const JSON_FILES = ['.json', '.mcmeta'];
const TEXT_FILES = [...JSON_FILES, '.txt', '.md'];

const BASE_TYPES = ['boolean', 'bigint', 'number', 'string'];

if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

packLoop: for (const pack of settings) {
  // set missing options
  pack.minifyJSON = (typeof pack.minifyJSON === 'boolean') ? pack.minifyJSON : true;

  // folder name, where to copy all temporary files
  let srcFolder = join(root, pack.name);
  if (!fs.existsSync(srcFolder)) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Can not find src folder \x1b[30m${srcFolder}\x1b[0m, skipping datapack \x1b[30m${pack.name}\x1b[0m.`);
    continue packLoop;
  }

  // make sure tempOutFolder exists
  let tempOutFolder = join(dist, pack.name);
  try {
    fs.mkdirSync(tempOutFolder);
  } catch (error) {
    console.error(error.message ?? error);
    console.error(`\x1b[31m[ERROR]\x1b[0m Can not generate output folder \x1b[30m${tempOutFolder}\x1b[0m, skipping datapack \x1b[30m${pack.name}\x1b[0m.`);
    continue packLoop;
  }

  // locate all files
  let files = globSync(`${srcFolder}/**/*`, { nodir: true });
  files = files.map((f) => relative(srcFolder, f));

  // copy all files to ./dist
  for (let i = 0; i < files.length; i++) {
    let targetFile = files[i];
    try {
      // ensure needed folders exists
      mkdir(resolve(tempOutFolder, dirname(targetFile)));
      // read file
      let [content, extension] = readFile(join(srcFolder, targetFile));

      // replace all replacements
      if (TEXT_FILES.includes(extension)) {
        content = doStringReplacements(content, pack.replace, targetFile);
      }

      // minify Json files
      if (pack.minifyJSON === true && JSON_FILES.includes(extension)) {
        content = JSON.stringify(JSON.parse(content));
      }

      // write ouput file in tempOutFolder
      fs.writeFileSync(join(tempOutFolder, targetFile), content);
    } catch (error) {
      console.error(error.message ?? error);
      console.error(`\x1b[31m[ERROR]\x1b[0m Error while handling file \x1b[30m${join(srcFolder, targetFile)}\x1b[0m, skipping datapack \x1b[30m${pack.name}\x1b[0m.`);
      continue packLoop;
    }
  }

  // add all files to a zip-file
  let filename = `${pack.name}-${pack.mc}.txt`;
  fs.writeFileSync(join(dist, filename), files.map((f) => '.' + sep + f).join('\n'));
  console.log(`\x1b[32m[SUCCESS]\x1b[0m Created datapack \x1b[36m${filename}\x1b[0m from folder \x1b[30m./${pack.name}/\x1b[0m`);
}

function mkdir(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

function readFile(path) {
  let extension = extname(path);
  // if file is a text file, read as utf8 so we can do string replacements
  let options = { encoding: TEXT_FILES.includes(extension) ? 'utf8' : undefined };
  let content = fs.readFileSync(path, options);
  return [content, extension];
}

/**
 * @param {string} content the actual content where replacements will be applied to
 * @param {object} replacements key-value-pairs of things that need to be replaced
 * @param {string} targetFile the file currently loaded
 * @returns 
 */
function doStringReplacements(content, replacements, targetFile) {
  for (let [key, value] of Object.entries(replacements)) {
    key = `@@${key}@@`;
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value === 'symbol') {
      value = `"${value.description}"`;
    } else if (typeof value === 'function') {
      value = JSON.stringify(value(targetFile));
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    } else if (!BASE_TYPES.includes(typeof value)) {
      continue;
    }

    content = content.replaceAll(key, value);
  }
  return content;
}

