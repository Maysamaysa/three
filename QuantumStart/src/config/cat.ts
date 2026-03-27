import * as THREE from 'three'
import type { CatPosition, QubitState } from '../context/CatContext'

export const COLOR = {
    idle: new THREE.Color('#ffffff'),
    blue: new THREE.Color('#5DA7DB'),
    amber: new THREE.Color('#C4955A'),
    pink: new THREE.Color('#FFB7C5'),
}

// World-space positions for each layout slot (camera at z=8, fov=50)
// Frustum at z=0: half-width ≈ 3.73, half-height ≈ 2.1 (16:9)
export const SLOT: Record<CatPosition, { pos: THREE.Vector3; scale: number }> = {
    center: { pos: new THREE.Vector3(0, -0.4, 0), scale: 2.5 },
    corner: { pos: new THREE.Vector3(2.6, 1.8, 0), scale: 2 },
    hidden: { pos: new THREE.Vector3(0, 0, 0), scale: 0 },
}

export const TILT_CONFIG = {
    npc: {
        ySensitivity: 0.001,
        xSensitivity: 0.001,
        lerpSpeed: 0.05,
    },
    hero: {
        ySensitivity: -0.0008,
        xSensitivity: 0.0008, // Negative in hero to match user's original logic
        lerpSpeed: 0.05,
    }
}

export const BUBBLE_LINES: Record<QubitState, { hero: string[]; npc: string[] }> = {
    idle: {
        hero: [
            "psst… the universe has a secret.",
            "I'm in superposition. Don't observe me.",
            "Three clicks and I'll tell you everything.",
        ],
        npc: [
            "Select a module to begin our journey.",
            "The quantum world is full of surprises.",
            "Ready to learn something spooky?",
        ],
    },
    blue: {
        hero: [
            "Let's collapse this wave function together.",
            "Intuition is just math you haven't met yet.",
        ],
        npc: [
            "Intuition is the first step to mastery.",
            "Simple, yet profound, isn't it?",
        ],
    },
    amber: {
        hero: [
            "Good. You want the equations. The cat approves.",
            "Dirac notation awaits. Don't blink.",
        ],
        npc: [
            "Precision is key in quantum mechanics.",
            "Dirac notation is a powerful language.",
        ],
    },
}
