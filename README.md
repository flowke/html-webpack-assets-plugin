![npm bundle size](https://img.shields.io/bundlephobia/min/html-webpack-assets-plugin.svg)
![npm](https://img.shields.io/npm/dw/html-webpack-assets-plugin.svg)
![NPM](https://img.shields.io/npm/l/html-webpack-assets-plugin.svg?logo=green)

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
  <div>
    <img width="100" height="100" title="Webpack Plugin" src="http://michael-ciniawsky.github.io/postcss-load-plugins/logo.svg">
  </div>
  <h1>html-webpack-assets-plugin</h1>
  <p>一个 `webpack` 插件, 用于在 `html-webpack-plugin` 将生成的 `html` 里, 对 script 标签进行操作, 可以往 `script` 标签添加属性 或 直接在 `html` 里插入本地 `js` 文件;</p>
</div>


<h2 align="center">安装</h2>

```bash
  npm i --save-dev html-webpack-assets-plugin
```

```bash
  yarn add --dev html-webpack-assets-plugin
```

## 兼容性

- webpack >=4
- html-webpack-plugin >=3


# 警告 :warning::warning::warning:
!!!注意: 如果使用 html-webpack-plugin@3.x.x 的版本,需要把 `html-webpack-plugin` 放在 `html-webpack-assets-plugin` 之前, 确保 `html-webpack-plugin` 先于 `assets-plugin` 注册.

<h2 align="center">使用</h2>

**配置示例**

**webpack.config.js**
```js
const AssetsPlugin = require('html-webpack-assets-plugin')

module.exports = {
  entry: 'src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    plugins: [
      new HtmlWebpackPlugin()
    ],
    new AssetsPlugin({
      // 可选, 给所有 script 添加属性
      attrs: {
        'data-all': 'all'
      },
      // 可选, 用于webpack 从入口打包而输出的 js 文件, 添加属性
      bundle: {
        'data-bundle': 'bundle'
      },

      //可选, 插入 script, assets 应该是远程地址, 因为不用有文件输出到打包目录
      online: [
        {
          append: true, // assets 列表的资源会添加到插入到后面, 默认false
          assets: [
            'http://a.b.com/aaa/index.js',
            'http://a.b.com/aaa/gc.js',
          ]
        },
        {
          assets: [
            'http://a.b.com/bbb/index.js',
            'http://a.b.com/bbb/gc.js',
          ]
        },
      ],
      // 可选
      // 插入script, src最终应该指向本地文件,
      // 本地资源会被复制到输出目录, 
      // 并对文件名添加 contentHash
      local: {
        root: './', // 本地资源的相对根目录目录, 默认为 当前工作目录,
        src: [
          './public/d3.js',
          './public/d100.js',
        ]
      }
    })
  ]
}
```

假设你有如下工作目录:
```
project
|---src
|---public
|   |---d3.js
|   |---d100.js
|---index.html
|---src
|   |---index.js
|---index.html
|---webpack.config.js
```

打包后 dist 的输出文件:

```
dist
|---index_bundle.js
|---d3.js
|---d100.js
```

搭配 html-webpack-plugin 后, 输出的 `html` 的 script 部分为:

````
...
<script data-all="all" src="http://a.b.com/bbb/index.js"></script>
<script data-all="all" src="http://a.b.com/bbb/gc.js"></script>
<script data-all="all" src="d3.js"></script>
<script data-all="all" src="d100.js"></script>
<script data-all="all" data-bundle="bundle" src="index_bundle.js"></script>
<script data-all="all" src="http://a.b.com/aaa/index.js"></script>
<script data-all="all" src="http://a.b.com/aaa/gc.js"></script>


...

````

### options

**attrs**

- 可选

为所有 script 添加 属性

```
{
  attrs: {
    'data-a': string
  },

}
```

**bundle**

- 可选

为 `webpack` 入口打包生成的 `script` 标签 添加属性

```
{
  bundle: {
    'data-bundle': 'bundle'
  }

}
```

**online**

- 可选

> 注意: 打包到输出目录

为 `webpack` 入口打包生成的 `script` 标签 添加属性

```
{
  online: [
    {
      append: true, // assets 列表的资源会添加到插入到后面, 默认false
      assets: [
        'http://a.b.com/aaa/index.js',
        'http://a.b.com/aaa/gc.js',
      ]
    },
    {
      assets: [
        'http://a.b.com/bbb/index.js',
        'http://a.b.com/bbb/gc.js',
      ]
    },
  ]

}
```

**local**

- root: 可选, 指定文件的根目录, 值相对路径则为当前的工作目录,
- src: 列出本地文件

为 `webpack` 入口打包生成的 `script` 标签 添加属性

```
{
  local: {
    root: <string>, // 可选, 默认: './', 
    src: Array<string>
  }

}
```

## License

[License](./LICENSE)