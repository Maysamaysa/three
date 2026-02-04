import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animated gradient sphere background
export function GradientSphere() {
    const meshRef = useRef<THREE.Mesh>(null)

    const uniforms = useMemo(
        () => ({
            u_time: { value: 0 },
            u_color1: { value: new THREE.Color('#6366f1') }, // Indigo
            u_color2: { value: new THREE.Color('#8b5cf6') }, // Purple
            u_color3: { value: new THREE.Color('#ec4899') }, // Pink
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
            float t = u_time * 0.2;
            float noise = sin(vPosition.x * 2.0 + t) * cos(vPosition.y * 2.0 - t) * 0.5 + 0.5;
            
            // Mix colors based on position and time
            vec3 color = mix(u_color1, u_color2, uv.y + noise * 0.3);
            color = mix(color, u_color3, noise * 0.5);
            
            // Add some glow
            float glow = smoothstep(0.0, 1.0, 1.0 - length(vPosition) * 0.3);
            color += glow * 0.2;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `

    return (
        <mesh ref={meshRef} scale={15}>
            <sphereGeometry args={[1, 64, 64]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

// Floating particles
export function Particles() {
    const pointsRef = useRef<THREE.Points>(null)

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array(1000 * 3)
        const colors = new Float32Array(1000 * 3)

        for (let i = 0; i < 1000; i++) {
            // Random positions in a sphere
            const radius = 10 + Math.random() * 5
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = radius * Math.cos(phi)

            // Random colors (purple/blue/pink)
            const colorChoice = Math.random()
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.6
                colors[i * 3 + 1] = 0.4
                colors[i * 3 + 2] = 1.0
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0.8
                colors[i * 3 + 1] = 0.3
                colors[i * 3 + 2] = 0.9
            } else {
                colors[i * 3] = 0.9
                colors[i * 3 + 1] = 0.3
                colors[i * 3 + 2] = 0.6
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
