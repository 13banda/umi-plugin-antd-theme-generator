/** @format */

// - https://umijs.org/plugin/develop.html
import { IApi } from 'umi';
import { join } from 'path';
import serveStatic from 'serve-static';
import rimraf from 'rimraf';
import { existsSync, mkdirSync } from 'fs';

const buildCss = require('antd-pro-merge-less');
const winPath = require('slash2');

interface themeConfig {
  theme: 'dark' | 'light';
  fileName: string;
  modifyVars: { [key: string]: string };
}

export default function(
  api: IApi,
  options: {
    theme: themeConfig[];
    min: boolean;
  },
) {
  const { cwd, absOutputPath, absNodeModulesPath } = api.paths;
  const outputPath = winPath(join(cwd, absOutputPath));
  const themeTemp = winPath(join(absNodeModulesPath, '.plugin-theme'));
  // 增加中间件
  api.addMiddewares(() => {
    return serveStatic(themeTemp);
  });

  api.addHTMLHeadScripts(() => [
    `window.umi_plugin_ant_themeVar = ${JSON.stringify(options.theme)}`,
  ]);

  // 编译完成之后
  api.onBuildComplete(error => {
    if (error) {
      return;
    }
    api.logger.info('💄  build theme');

    try {
      if (existsSync(winPath(join(outputPath, 'theme')))) {
        rimraf.sync(winPath(join(outputPath, 'theme')));
      }
      mkdirSync(winPath(join(outputPath, 'theme')));
    } catch (error) {
      // console.log(error);
    }

    buildCss(
      cwd,
      options.theme.map(
        theme => ({
          ...theme,
          fileName: winPath(join(outputPath, 'theme', theme.fileName)),
        }),
        {
          min: true,
          ...options,
        },
      ),
    )
      .then(() => {
        api.logger.log('🎊  build theme success');
      })
      .catch(e => {
        console.log(e);
      });
  });

  // dev 之后
  api.onDevCompileDone(() => {
    api.logger.info('cache in :' + themeTemp);
    api.logger.info('💄  build theme');
    // 建立相关的临时文件夹
    try {
      if (existsSync(themeTemp)) {
        rimraf.sync(themeTemp);
      }
      if (existsSync(winPath(join(themeTemp, 'theme')))) {
        rimraf.sync(winPath(join(themeTemp, 'theme')));
      }

      mkdirSync(themeTemp);

      mkdirSync(winPath(join(themeTemp, 'theme')));
    } catch (error) {
      // console.log(error);
    }

    buildCss(
      cwd,
      options.theme.map(theme => ({
        ...theme,
        fileName: winPath(join(themeTemp, 'theme', theme.fileName)),
      })),
      {
        ...options,
      },
    )
      .then(() => {
        api.logger.log('🎊  build theme success');
      })
      .catch(e => {
        console.log(e);
      });
  });
}
