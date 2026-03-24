import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//... Other imports and code

const controls = new OrbitControls(camera, renderer.domElement);

// Existing code

const handleResize = () => {
    const width = containerRef.current?.clientWidth || window.innerWidth;
    const height = containerRef.current?.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener('resize', handleResize);

// Existing animation loop and code

