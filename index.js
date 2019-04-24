let HtmlWebpackPlugin;
const _ = require('lodash');

try {
  HtmlWebpackPlugin = require('html-webpack-plugin');
} catch (error) {
  throw new Error(`
    Must html-webpack-plugin >=3`)
}

class AssetsAttr {
  constructor(op){
    op = op || {};
    this.op = op;
  }

  apply(compiler) {
    this.registerHooks(compiler);
    
  }

  registerHooks(compiler){
    compiler.hooks.compilation.tap('AssetsAttr', (compilation) => {
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync('asstes', (data, cb) => {
          data.assetTags.scripts = this.alterAssetTagsAsync(data.assetTags.scripts);
          cb(null,data)
        })
      } else if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('asstes', (data, cb) => {
          data.body = this.alterAssetTagsAsync(data.body)
          console.log(data.body[0].attributes);
          
          cb(null,data)
        });
      } else {
        throw new Error(`
          if assets-attr-plugin version <4 
          register assets-attr-plugin after html-webpack-plugin
        `)
      }
      
    })
  }


  alterAssetTagsAsync(assets){
    // attrs : 所有的script
    // bundle: 打包的script
    // online: 添加script, 同时可设置属性
    let {  attrs = {}, bundle = {}, online=[]} = this.op;

    let append = [],
      prepend = [];

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
      if(elt.tagName==='script'){
        elt.attributes = {
          ...elt.attributes,
          ...attrs,
          ...bundle
        }
      }
      

      return elt;
    })

    let allScripts = _.concat(prepend, assets, append);

    return allScripts;
    
  }

}

module.exports = AssetsAttr
