import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Squidmodel from '../assets/squid.glb'

function Squid() {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Squidmodel)
    const { actions, mixer } = useAnimations(animations, group)

    // Use refs to store mouse position (persists across renders)
    const mouseX = useRef(0)
    const mouseY = useRef(0)
    const target = useRef(new THREE.Vector3())

    // Play all animations when component mounts
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            Object.values(actions).forEach((action) => {
                action?.play()
            })
        }
    }, [actions])

    // Set up mouse tracking event listener
    useEffect(() => {
        const windowHalfX = window.innerWidth / 2
        const windowHalfY = window.innerHeight / 2

        const handleMouseMove = (event: MouseEvent) => {
            mouseX.current = event.clientX - windowHalfX
            mouseY.current = event.clientY - windowHalfY
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Update animation mixer and look at mouse
    useFrame((_state, delta) => {
        if (mixer) {
            mixer.update(delta)
        }

        // Smoothly interpolate target position
        target.current.x = (mouseX.current) + 1000
        target.current.y = -mouseY.current
        target.current.z = 1000

        // Make the cat look at the target
        scene.lookAt(target.current)
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            <primitive
                object={scene}
                scale={1}
            />
        </group>
    )
}

export default Squid
