<!-- 專案名稱 -->

# `專案名稱`

### 框架版本資訊

<!-- 相關核心框架 -->

- JavaScript ES6

### 開發中套件版本

<!-- 需要Follow版本的套件們 -->

- [webpack-cli](https://github.com/webpack/webpack-cli) : `^3.3.11`

<!-- 其他需求 -->

### ESlint 設定

`extends: ['airbnb-base', 'plugin:prettier/recommended']`

### Branch 切分

- master -> 穩定主線
- dev -> 開發主線，debug 後進 master

### Tag 版本號資訊

- v0.0.0 [主版本號].[次版本號].[修訂版本號]
- 主版本號：軟體有重大更新的時候遞增，重大更新通常是指功能與介面都有大幅度變動的時候
- 次版本號：軟體發佈新功能，但是並不會大幅影響到整個軟體的時候遞增
- 修訂版本號：通常是在軟體有 bug，發布 bug 的修正版時遞增

### 安裝

```
yarn install
```

### 開發

```
yarn dev
```

### 編譯

```
yarn build
```

### beta

```
yarn beta
```

### 部署

```
yarn deploy
```
