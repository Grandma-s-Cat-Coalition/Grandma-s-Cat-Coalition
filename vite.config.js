import{defineConfig}from'vite';import{readdirSync}from'node:fs';import{resolve,basename}from'node:path';
const input=Object.fromEntries(readdirSync('.').filter(f=>f.endsWith('.html')).map(f=>[basename(f,'.html'),resolve(f)]));
input.admin=resolve('admin/index.html');
export default defineConfig({build:{rollupOptions:{input}},server:{port:5173}});
