let HtmlWebpackPlugin;
const _ = require('lodash');
const sha256 = require('sha.js')('sha256');
const path = require('path');
const fs = require('fs');

let cwd = process.cwd();

try {
  HtmlWebpackPlugin = require('html-webpack-plugin');
} catch (error) {
  throw new Error(`
    Must html-webpack-plugin >=3`)
}

class AssetsAttr {
  constructor(op) {
    op = op || {};
    this.op = op;
  }

  apply(compiler) {
    this.registerHooks(compiler);
  }

  registerHooks(compiler) {
    compiler.hooks.compilation.tap('AssetsAttr', (compilation) => {
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('asstes', (data, cb) => {
          data.assetTags.scripts = this.alterAssetTagsAsync(data.assetTags.scripts, compilation);
          cb(null, data)
        })
      } else if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('asstes', (data, cb) => {
          data.body = this.alterAssetTagsAsync(data.body, compilation)
          cb(null, data)
        });
      } else {
        throw new Error(`
          if assets-attr-plugin version <4 
          register assets-attr-plugin after html-webpack-plugin
        `)
      }
    })
  }


  alterAssetTagsAsync(assets, compilation) {
    // attrs : 所有的script
    // bundle: 打包的script
    // online: 添加script, 同时可设置属性
    let {
      attrs = {},
      bundle = {},
      online = [],
      local = {
        root: './',
        src: []
      }
    } = this.op;

    let append = [],
      prepend = [];

    let configPublicPath = compilation.outputOptions.publicPath || '';
    let configOutputPath = compilation.outputOptions.path || '';
    let localRoot = local.root ? local.root : './';
    let localSrc = local.src ? local.src : [];
    let fileBase = path.resolve(cwd, localRoot);

    let localScripts = localSrc.map(url => {

      let ext = path.extname(url);
      let basename = path.basename(url, ext);
      let filePath = path.resolve(fileBase, url);

      let hash = sha256.update(fs.readFileSync(filePath, {
        encoding: 'utf8'
      })).digest('hex').slice(0, 8);

      compilation.assets[`${basename}-${hash}${ext}`] = {
        source: () => fileContent,
        size: () => fileContent.length
      }

      // 最终得到的publicPath
      url = configPublicPath + `${basename}-${hash}${ext}`;

      return {
        tagName: 'script',
        voidTag: false,
        attributes: {
          src: url,
          ...attrs,
        }
      }
    })

    online.forEach(group => {

      let tags = group.assets.map(elt => {
        return {
          tagName: 'script',
          voidTag: false,
          attributes: {
            src: elt,
            ...attrs,
            ...group.attrs,
          }
        }
      });

      if (group.append) {
        append.push(..._.flatten(tags));
      } else {
        prepend.push(..._.flatten(tags))
      }

    });


    assets = assets.map(elt => {
      if (elt.tagName === 'script') {
        elt.attributes = {
          ...elt.attributes,
          ...attrs,
          ...bundle
        }
      }


      return elt;
    })

    let allScripts = _.concat(prepend, localScripts, assets, append);

    return allScripts;

  }

}

module.exports = AssetsAttr
