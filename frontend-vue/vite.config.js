import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
const name = 'goppermission-ui';
// https://vitejs.dev/config/
export default defineConfig({
  base: name,
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "@import \"@/styles/main.scss\";"
      },
      less: {
        modifyVars: {},
        javascriptEnabled: true,
      },
    }
  },
  server: {
    port: 9008,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    proxy: {
      '/tech': {
        // target: "https://tech.seasungame.com/",  //目标代理接口地址
        target: "https://gop.seasungame.com/",
        secure: false,
        changeOrigin: true,  //开启代理，在本地创建一个虚拟服务器
        ws: true
      },
      '/api/getuserinfo': {
        // target: "https://tech.seasungame.com/",  //目标代理接口地址
        target: "https://gop.seasungame.com/",
        secure: false,
        changeOrigin: true,  //开启代理，在本地创建一个虚拟服务器
        ws: true
      },
      '/api': {
        // target: "http://localhost:8010/",  //目标代理接口地址
        target: "https://gop.seasungame.com/",
        secure: false,
        changeOrigin: true,  //开启代理，在本地创建一个虚拟服务器
        ws: true
      },
      // 代理至ommsweb网关
      // '^/api/.*': {
      //   target: 'http://localhost:8000',
      //   secure: false,
      //   changeOrigin: true,
      //   ws: true,
      //   rewrite: (path) => path.replace(/^\/api/, 'api_gop_permission'),
      //   // rewrite: (path) => path.replace(/^\/api/, 'jwt_gop_permission/private'),
      // },
    }
  }
})
