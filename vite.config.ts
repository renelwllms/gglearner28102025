import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from '@arco-plugins/vite-plugin-svgr';
import vitePluginForArco from '@arco-plugins/vite-react';
import setting from './src/settings.json';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {},
    }),
    vitePluginForArco({
      theme: '@arco-themes/react-arco-pro',
      // modifyVars: {
      //   'arcoblue-6': setting.themeColor,
      // },
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  assetsInclude:['**/*.woff','**/*.woff2','**/*.ttf','**/*.eot'],
});
