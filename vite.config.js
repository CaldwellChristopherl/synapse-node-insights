import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const repoName = 'synapse-node-insights'; 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})
