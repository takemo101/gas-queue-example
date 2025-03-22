import { config } from '@dotenvx/dotenvx';
import esbuild from 'esbuild';
import { GasPlugin } from 'esbuild-gas-plugin';
import { copy } from 'esbuild-plugin-copy';

config();

esbuild
  .build({
    entryPoints: ['./src/main.ts'],
    bundle: true,
    minify: true,
    define: {
      'process.env.QUEUE_SHEET_ID': JSON.stringify(process.env.QUEUE_SHEET_ID),
    },
    outfile: './dist/main.js',
    plugins: [
      GasPlugin,
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./static/**/*.*'],
          to: ['./dist'],
        },
      }),
    ],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
