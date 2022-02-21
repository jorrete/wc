import type { PluginOption, ResolvedConfig } from 'vite';
import type { FilterPattern } from '@rollup/pluginutils';
import type { ParserPlugin } from '@babel/parser';

import resolve from 'resolve';
import { transformAsync } from '@babel/core';

import type { CreateFilter } from '@rollup/pluginutils';

import { createFilter } from '@rollup/pluginutils';

export type RollupFilter = ReturnType<CreateFilter>;

// Allows to ignore query parameters, as in Vue SFC virtual modules.
export function parseId(url: string) {
  return { id: url.split('?', 2)[0] };
}

export interface WcPluginOptions {
  path: string,
  /**
  * RegExp or glob to match files to be transformed
  */
  include?: FilterPattern;

  /**
  * RegExp or glob to match files to NOT be transformed
  */
  exclude?: FilterPattern;
}

const ID: string = 'wc/jsx-runtime';
const PATH: string = 'wc';

// Taken from https://github.com/vitejs/vite/blob/main/packages/plugin-react/src/index.ts
export default function wcPlugin({
  path,
  include,
  exclude,
}: WcPluginOptions = { path: PATH }): PluginOption[] {
  let config: ResolvedConfig;

  const shouldTransform = createFilter(
    include || [/\.[tj]sx?$/],
    exclude || [/node_modules/],
  );

  const jsxPlugin: PluginOption = {
    name: 'vite:wc-jsx',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          // include: [path],
        },
      };
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    resolveId(id: string) {
      return id === ID ? id : null;
    },
    load(id: string) {
      if (id !== ID) {
        return;
      }

      const runtimePath = resolve.sync(path, {
        basedir: config.root,
      });
      const exports = ['jsx', 'jsxs', 'Fragment'];

      return [
        `import * as jsxRuntime from ${JSON.stringify(runtimePath)}`,
        // We can't use `export * from` or else any callsite that uses
        // this module will be compiled to `jsxRuntime.exports.jsx`
        // instead of the more concise `jsx` alias.
        ...exports.map(name => `export const ${name} = jsxRuntime.${name}`),
      ].join('\n');
    },
    async transform(code, url) {
      // Ignore query parameters, as in Vue SFC virtual modules.
      const { id } = parseId(url);

      if (!shouldTransform(id)) return;

      const parserPlugins = [
        'importMeta',
        // This plugin is applied before esbuild transforms the code,
        // so we need to enable some stage 3 syntax that is supported in
        // TypeScript and some environments already.
        'topLevelAwait',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        !id.endsWith('.ts') && 'jsx',
        /\.tsx?$/.test(id) && 'typescript',
      ].filter(Boolean) as ParserPlugin[];

      const result = await transformAsync(code, {
        babelrc: false,
        configFile: false,
        ast: true,
        root: config.root,
        filename: id,
        parserOpts: {
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
          decoratorsBeforeExport: true,
        },
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            {
              runtime: 'automatic',
              importSource: 'wc',
            },
          ],
        ],
        sourceMaps: true,
        inputSourceMap: false as any,
      });

      // NOTE: Since no config file is being loaded, this path wouldn't occur.
      if (!result) return;

      return {
        code: result.code || code,
        map: result.map,
      };
    },
  };

  return [
    {
      name: 'wc:config',
      config() {
        return {
          resolve: {
            alias: {
              /* 'react-dom/test-utils': 'wc/test-utils',
              'react-dom': 'wc/compat',
              react: 'wc/compat', */
            },
          },
        };
      },
    },
    jsxPlugin,
  ];
}
