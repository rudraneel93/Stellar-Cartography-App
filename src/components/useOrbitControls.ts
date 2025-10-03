// This file provides a minimal OrbitControls implementation for three.js in React (ESM)
import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function useOrbitControls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
  useEffect(() => {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.target.set(0, 0, 0);
    controls.update();
    return () => {
      controls.dispose();
    };
  }, [camera, renderer]);
}
