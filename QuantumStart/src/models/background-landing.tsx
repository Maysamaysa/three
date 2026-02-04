import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import backgroundLanding from '../assets/background-landing.glb'

const BackgroundLanding = () => {
    const background = useGLTF(backgroundLanding)
    const meshRef = useRef<THREE.Group>(null)

    // Optional: Add slow rotation animation
    useFrame((_state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.3
        }
    })

    return (
        <primitive
            ref={meshRef}
            object={background.scene}
            position={[0, 0, 0]}
            scale={2.5}
        />
    )
}

export default BackgroundLanding