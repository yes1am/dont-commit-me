# Don't Commit Me

Prevent from committing sensitive words  
*防止提交敏感信息*

## Usage

```shell
npm i --save-dev hooks dont-commit-me
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
