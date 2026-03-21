import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sphere } from '@react-three/drei'
import type { Phase } from './EntanglementModule'
import { MiniBlochSphere } from '../../../models/MiniBlochSphere'

interface EntanglementSceneProps {
    phase: Phase
    step: number
    isEntangled: boolean
    isMeasured: boolean
    outcome: 0 | 1 | null
    qubitA: { x: number }
    setQubitA: (v: { x: number }) => void
    qubitB: { x: number }
    setQubitB: (v: { x: number }) => void
}

function DraggableQubit({ isLeft, isEntangled, isMeasured, outcome, colorOffset, posObj, setPosObj }: any) {
    const groupRef = useRef<THREE.Group>(null)
    const { viewport, camera, mouse } = useThree()
    const [isDragging, setIsDragging] = useState(false)

    const handlePointerDown = (e: any) => {
        e.stopPropagation()
        setIsDragging(true)
        document.body.style.cursor = 'grabbing'
    }

    const handlePointerUp = (e: any) => {
        e.stopPropagation()
        setIsDragging(false)
        document.body.style.cursor = 'auto'
    }

    useFrame((_state, delta) => {
        if (!groupRef.current) return

        if (isDragging) {
            // Raycast drag on Z=0 plane
            const vector = new THREE.Vector3(mouse.x, mouse.y, 0)
            vector.unproject(camera)
            const dir = vector.sub(camera.position).normalize()
            const distance = -camera.position.z / dir.z
            const pos = camera.position.clone().add(dir.multiplyScalar(distance))

            const limitX = (viewport.width / 2) - 1
            let clampedX = Math.max(-limitX, Math.min(limitX, pos.x))
            
            if (isLeft) clampedX = Math.min(clampedX, -0.5)
            else clampedX = Math.max(clampedX, 0.5)

            groupRef.current.position.x = clampedX
            // Sync up parent so tether knows
            setPosObj({ x: clampedX })
        } else {
            // Smoothly seek target position (useful on reset)
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, posObj.x, 10 * delta)
        }
    })

    return (
        <group 
            ref={groupRef} 
            position={[posObj.x, 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerUp}
            onPointerOver={() => { if (!isMeasured) document.body.style.cursor = 'grab'; }}
        >
            <MiniBlochSphere 
                isMeasured={isMeasured}
                outcome={outcome}
                isEntangled={isEntangled}
                seedOffset={colorOffset}
                isLeft={isLeft}
            />
        </group>
    )
}

function TetherLine({ getPosA, getPosB, isEntangled, isMeasured }: any) {
    const lineRef = useRef<THREE.Line>(null)
    
    useFrame((state) => {
        if (!lineRef.current) return
        const material = lineRef.current.material as THREE.LineBasicMaterial
        
        if (isMeasured) {
            material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.1)
        } else if (isEntangled) {
            material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4
        } else {
            material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.2)
        }
        
        if (isEntangled && !isMeasured) {
            const time = state.clock.elapsedTime
            const startY = Math.sin(time * 3) * 0.3
            const endY = Math.sin(time * 3 + Math.PI) * 0.3
            
            // Only update line geometry visually since we know the approximate sine wave Y offset
            const geom = lineRef.current.geometry
            const positions = geom.attributes.position.array
            positions[0] = getPosA().x
            positions[1] = startY
            positions[2] = 0
            positions[3] = getPosB().x
            positions[4] = endY
            positions[5] = 0
            geom.attributes.position.needsUpdate = true
        }
    })

    return (
        <line ref={lineRef as any}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array(6), 3]}
                    count={2}
                    array={new Float32Array(6)}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#FFB7C5" transparent opacity={0} linewidth={3} />
        </line>
    )
}



export default function EntanglementScene({ 
    phase, isEntangled, isMeasured, outcome, qubitA, setQubitA, qubitB, setQubitB 
}: EntanglementSceneProps) {

    // Simple logic for the detective game 


    useEffect(() => {
        const handleSnap = () => {
             // Let UI drive it OR just visualize 
        }
        window.addEventListener('detective_snap', handleSnap)
        return () => window.removeEventListener('detective_snap', handleSnap)
    }, [])

    return (
        <group>
            {(phase === 'concept' || phase === 'collapse' || phase === 'sandbox') && (
                <>
                    <DraggableQubit 
                        isLeft={true} 
                        isEntangled={isEntangled}
                        isMeasured={isMeasured}
                        outcome={outcome}
                        colorOffset={0}
                        posObj={qubitA}
                        setPosObj={setQubitA}
                    />
                    
                    <DraggableQubit 
                        isLeft={false} 
                        isEntangled={isEntangled}
                        isMeasured={isMeasured}
                        outcome={outcome}
                        colorOffset={Math.PI} 
                        posObj={qubitB}
                        setPosObj={setQubitB}
                    />

                    <TetherLine 
                        getPosA={() => qubitA} 
                        getPosB={() => qubitB} 
                        isEntangled={isEntangled}
                        isMeasured={isMeasured}
                    />
                </>
            )}

            {(phase === 'quiz' || phase === 'complete') && (
                <group>
                    {/* Placeholder for the minigame visual. Will implement fully in overlay. */}
                    <Sphere args={[1]} position={[-3, 0, 0]} material-color="#444" material-wireframe />
                    <Sphere args={[1]} position={[0, 0, 0]} material-color="#444" material-wireframe />
                    <Sphere args={[1]} position={[3, 0, 0]} material-color="#444" material-wireframe />
                </group>
            )}
        </group>
    )
}
