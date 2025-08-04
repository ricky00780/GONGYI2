/// <reference types="vite/client" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'reactflow/dist/style.css' {
  const content: string;
  export default content;
}