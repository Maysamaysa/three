import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated gradient sphere background
export function GradientSphere() {
    const meshRef = useRef<THREE.Mesh>(null)

    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_color1: { value: new THREE.Color('#F8F9FF') }, // Lily White
            u_color2: { value: new THREE.Color('#5DA7DB') }, // State Blue
            u_color3: { value: new THREE.Color('#FFB7C5') }, // Lotus Pink
        }),
        []
    )

    useFrame((state) => {
        if (meshRef.current) {
            uniforms.u_time.value = state.clock.elapsedTime
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.05
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
        }
    })

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    const fragmentShader = `
        uniform float u_time;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            vec2 uv = vUv;
            
            // Create animated gradient
            float t = u_time * 0.15;
            float noise = sin(vPosition.x * 1.5 + t) * cos(vPosition.y * 1.5 - t * 0.8) * 0.5 + 0.5;
            
            // Mix colors based on position and time
            vec3 color = mix(u_color1, u_color2, uv.y + noise * 0.2);
            color = mix(color, u_color3, noise * 0.4);
            
            // Add subtle ripple effect (Lotus Pond)
            float ripple = sin(length(vPosition.xz) * 3.0 - u_time) * 0.02;
            color += ripple;
            
            // Add some glass-like glow
            float glow = smoothstep(0.0, 1.0, 1.0 - length(vPosition) * 0.2);
            color += glow * 0.15;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `

    return (
        <mesh ref={meshRef} scale={20}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                side={THREE.BackSide}
                transparent
                opacity={0.55}
                depthWrite={false}
            />
        </mesh>
    )
}


// Floating particles (Lotus Petals/Pollen)
export function Particles() {
    const pointsRef = useRef<THREE.Points>(null)

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array(800 * 3)
        const colors = new Float32Array(800 * 3)

        for (let i = 0; i < 800; i++) {
            const radius = 5 + Math.random() * 15
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = radius * Math.cos(phi)

            // Theme colors: Blue, Pink, Green
            const colorChoice = Math.random()
            if (colorChoice < 0.4) {
                // Lotus Pink
                colors[i * 3] = 1.0
                colors[i * 3 + 1] = 0.717
                colors[i * 3 + 2] = 0.772
            } else if (colorChoice < 0.7) {
                // Glass Green
                colors[i * 3] = 0.757
                colors[i * 3 + 1] = 0.882
                colors[i * 3 + 2] = 0.757
            } else {
                // State Blue
                colors[i * 3] = 0.365
                colors[i * 3 + 1] = 0.655
                colors[i * 3 + 2] = 0.859
            }
        }


        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        return geo
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
            pointsRef.current.rotation.x = state.clock.elapsedTime * 0.03
        }
    })

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    )
}

// Main procedural background component
export default function ProceduralBackground() {
    return (
        <>
            <GradientSphere />
            <Particles />
        </>
    )
}
