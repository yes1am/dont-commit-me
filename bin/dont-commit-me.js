#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const minimatch = require('minimatch');
const process = require('process')
const chalk = require('chalk');

const { exec } = require('shelljs');

let sensitiveWords = process.argv[2];

if(!sensitiveWords) {
  console.log(chalk.bgYellow('[dont-commit-me]: 缺少敏感词，请配置敏感词'))
  process.exit(1);
}

// 敏感词
const SENSITIVE_WORDS = sensitiveWords.split(',');

// 获取执行 commit 的目录
const root = process.cwd();

// 默认忽略的文件
const DEFAULT_IGNORES = ['.git', 'package.json', 'node_modules'];

const readDir = (dir) => {
  const results = [];
  let files = fs.readdirSync(path.resolve(dir, '.'), 'utf-8');

  // 过滤默认 ignore 中的文件
  files = files.filter((file) => !(DEFAULT_IGNORES.some((ignore) => minimatch(file, ignore))));

  // 检查是否是 gitignore 的文件, 如果有结果，那么该文件是被 ignore 的文件. 那就可以不检查敏感词了。
  files = files.filter((file) => {
    // https://git-scm.com/docs/git-check-ignore
    // no-index 的意思是，尽管某个文件已经被 tracked 了, 理论上应该不在 .gitignore 里面
    // 但是我依然想检查这个文件是否在 gitignore 里，如果它在 gitignore 里面，stdout 不为空，那么最终不会检查该文件。

    // 在这个场景中，尽管它现在在 gitignore 里面，我们也应该检查里面有没有敏感词，因为不用 no-index 参数
    const output = exec(`git check-ignore ${path.resolve(dir, file)} -v`, {
      silent: true  // 不打印结果
    });
    return !output.stdout
  });

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