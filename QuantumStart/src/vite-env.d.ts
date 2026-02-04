/// <reference types="vite/client" />

// Type declarations for 3D model files
declare module '*.glb' {
    const src: string
    export default src
}

declare module '*.gltf' {
    const src: string
    export default src
}
