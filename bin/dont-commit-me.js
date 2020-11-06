#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const minimatch = require('minimatch');
const process = require('process')
const chalk = require('chalk');

let sensitiveWords = process.argv[2];

if(!sensitiveWords) {
  console.log(chalk.bgYellow('[dont-commit-me]: 没有敏感词，跳过检查'))
  return;
}

// 敏感词
const SENSITIVE_WORDS = sensitiveWords.split(',');

// 获取执行 commit 的目录
const root = process.cwd();

// 默认忽略的文件
const DEFAULT_IGNORES = ['.git', 'package.json'];

// https://github.com/jonschlinkert/parse-gitignore/blob/master/index.js#L10-L14
const parseGitignore = () => {
  let gitignores = [];
  if(fs.existsSync(path.resolve(root, '.gitignore'))) {
    gitignores = fs
    .readFileSync(path.resolve(root, '.gitignore'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && l.charAt(0) !== '#');
  }
  
  return DEFAULT_IGNORES.concat(gitignores);
};

const ignores = parseGitignore();

const readDir = (dir) => {
  const results = [];
  let files = fs.readdirSync(path.resolve(dir, '.'), 'utf-8');

  // 过滤掉 ignore 中的文件
  files = files.filter((file) => !(ignores.some((ignore) => minimatch(file, ignore))));

  files.forEach((file) => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      results.push(filePath);
    } else if (stat.isDirectory()) {
      results.push(...readDir(filePath));
    }
  });

  return results;
};

const main = () => {
  const errorFiles = [];
  const files = readDir(path.resolve(root, '.'));
  files.forEach((file) => {
    const fileContent = fs.readFileSync(file, 'utf-8');
    SENSITIVE_WORDS.forEach((word) => {
      if (fileContent.includes(word)) {
        errorFiles.push({
          file,
          word,
        });
      }
    });
  });

  if (errorFiles.length) {
    console.log(chalk.bgYellow('[dont-commit-me]: 检测出存在敏感词!'))
    console.table(errorFiles)
    // 非 0 退出码表示异常，阻止提交
    process.exit(1);
  }
  console.log(chalk.bgYellow('[dont-commit-me]: 无敏感词!'))
};

main();