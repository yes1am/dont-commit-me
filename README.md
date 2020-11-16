# Don't Commit Me

Prevent from committing sensitive words  
*防止提交敏感词*

## Usage

```shell
npm i --save-dev husky dont-commit-me
```

add config to your package.json
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "dont-commit-me <sensitive word1>,<sensitive word2>,..."
    }
  }
}

// for example: dont commit if file includes google or youtube
{
  "husky": {
    "hooks": {
      "pre-commit": "dont-commit-me google,youtube, ..."
    }
  }
}
```

## Development

```shell
npm i

node bin/dont-commit-me.js <sensitive word1>,<sensitive word2>,...
```

## Publish

```shell
npm version major | minor | patch

git push               // push code

git push origin --tags // trigger CI & publish
```

