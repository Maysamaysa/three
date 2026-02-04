import { useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Black_cat from '../assets/black_cat.glb'

function BlackCat() {
    const group = useRef<THREE.Group>(null)
    const { scene, animations } = useGLTF(Black_cat)
    const { actions, mixer } = useAnimations(animations, group)
    const { camera, size } = useThree()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    // Track mouse movement
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            // Convert screen coordinates to normalized device coordinates (-1 to +1)
            const x = (event.clientX / size.width) * 2 - 1
            const y = -(event.clientY / size.height) * 2 + 1
            setMousePosition({ x, y })
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [size])

    // Play all animations when component mounts
    useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            // Play the first animation or all animations
            Object.values(actions).forEach((action) => {
                action?.play()
            })
        }
    }, [actions])

    // Update animation mixer and rotation every frame
    useFrame((_state, delta) => {
        if (mixer) {
            mixer.update(delta)
        }

        if (group.current) {
            // Use raycaster to project mouse onto a plane at cat's Z position
            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(new THREE.Vector2(mousePosition.x, mousePosition.y), camera)

            // Create a plane at the cat's Z position
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1)
            const intersectPoint = new THREE.Vector3()
            raycaster.ray.intersectPlane(plane, intersectPoint)

            if (intersectPoint && group.current) {
                // Calculate the direction from cat to mouse
                const catPosition = new THREE.Vector3(3.5, 2.5, 1)
                const direction = new THREE.Vector3().subVectors(intersectPoint, catPosition)

                // Calculate rotation angles
                const angleY = Math.atan2(direction.x, direction.z)
                const angleX = Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z))

                // Smoothly interpolate to the target rotation
                const targetRotation = new THREE.Euler(-angleX * 0.3, angleY, 0)
                group.current.rotation.x += (targetRotation.x - group.current.rotation.x) * 0.1
                group.current.rotation.y += (targetRotation.y - group.current.rotation.y) * 0.1
            }
        }
    })

    return (
        <group ref={group} position={[3.5, 2.5, 1]}>
            <primitive
                object={scene}
                scale={1.5}
            />
        </group>
    )
}

export default BlackCat