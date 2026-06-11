/// <reference types="vite/client" />

// Support for Vite's ?raw imports (used to load the commented demo JSON file)
declare module '*?raw' {
  const content: string;
  export default content;
}
