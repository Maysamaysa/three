import { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import catmodel from '../assets/cat.glb'

const Cat = () => {
    const cat = useGLTF(catmodel)
    const catRef = useRef<THREE.Group>(null)
    const { camera, size } = useThree()
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isWiggling, setIsWiggling] = useState(false)
    const wiggleTime = useRef(0)
    const targetPosition = useRef(new THREE.Vector3(0, 0, 3))

    // Handle click to trigger wiggle
    const handleClick = () => {
        setIsWiggling(true)
        wiggleTime.current = 0
        setTimeout(() => setIsWiggling(false), 500) // Wiggle for 500ms
    }

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

    // Update target position and animate cat
    useFrame((_state, delta) => {
        if (catRef.current) {
            // Use raycaster to project mouse onto a plane at cat's Z position
            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(new THREE.Vector2(mousePosition.x, mousePosition.y), camera)

            // Create a plane at the cat's Z position
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -3)
            const intersectPoint = new THREE.Vector3()
            raycaster.ray.intersectPlane(plane, intersectPoint)

            if (intersectPoint) {
                targetPosition.current.copy(intersectPoint)
                targetPosition.current.z = 3 // Keep cat at fixed depth
            }

            // Smoothly move the cat towards the target position
            catRef.current.position.lerp(targetPosition.current, 0.1)

            // Make the cat look at a point slightly ahead based on movement direction
            const lookAheadPoint = targetPosition.current.clone()
            lookAheadPoint.z -= 1
            catRef.current.lookAt(lookAheadPoint)

            // Adjust rotation to face forward (compensate for model orientation)
            catRef.current.rotation.y += Math.PI

            // Apply wiggle animation when clicked
            if (isWiggling) {
                wiggleTime.current += delta
                // Use sine waves for a bouncy wiggle effect
                const wiggleFactor = Math.sin(wiggleTime.current * 30) * 0.2
                catRef.current.rotation.z = wiggleFactor
                catRef.current.scale.set(
                    0.4 + Math.abs(wiggleFactor) * 0.1,
                    0.4 + Math.abs(wiggleFactor) * 0.1,
                    0.4 + Math.abs(wiggleFactor) * 0.1
                )
            } else {
                // Reset scale and rotation when not wiggling
                catRef.current.rotation.z = 0
                catRef.current.scale.set(0.4, 0.4, 0.4)
            }
        }
    })

    return (
        <primitive
            ref={catRef}
            object={cat.scene}
            position={[0, 0, 3]}
            scale={0.4}
            onClick={handleClick}
        />
    )
}

export default Cat