import * as THREE from 'three';

/**
 * 3D Background Scene with Three.js
 * Creates an animated geometric background with particles
 */
export class Scene3D {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.geometries = [];
        this.particles = null;
        this.animationId = null;

        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Add lights
        this.addLights();

        // Add geometric shapes
        this.addGeometries();

        // Add particle system
        this.addParticles();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation
        this.animate();
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Point lights with colors
        const pointLight1 = new THREE.PointLight(0x6366f1, 2, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 100);
        pointLight2.position.set(-10, -10, 10);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x06b6d4, 2, 100);
        pointLight3.position.set(0, 10, -10);
        this.scene.add(pointLight3);
    }

    addGeometries() {
        // Create various geometric shapes
        const shapes = [
            { geometry: new THREE.TorusGeometry(3, 1, 16, 100), position: [-15, 0, -10] },
            { geometry: new THREE.OctahedronGeometry(3), position: [15, 5, -15] },
            { geometry: new THREE.IcosahedronGeometry(2.5), position: [-10, -8, -12] },
            { geometry: new THREE.TetrahedronGeometry(3), position: [12, -5, -18] },
            { geometry: new THREE.TorusKnotGeometry(2, 0.5, 100, 16), position: [0, 8, -20] }
        ];

        shapes.forEach(({ geometry, position }) => {
            const material = new THREE.MeshStandardMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.3,
                emissive: 0x6366f1,
                emissiveIntensity: 0.2
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...position);

            // Random rotation speeds
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };

            this.geometries.push(mesh);
            this.scene.add(mesh);
        });
    }

    addParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);

        // Generate random positions for particles
        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }

        particlesGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(posArray, 3)
        );

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.15,
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotate geometries
        this.geometries.forEach(mesh => {
            mesh.rotation.x += mesh.userData.rotationSpeed.x;
            mesh.rotation.y += mesh.userData.rotationSpeed.y;
            mesh.rotation.z += mesh.userData.rotationSpeed.z;
        });

        // Rotate particles slowly
        if (this.particles) {
            this.particles.rotation.y += 0.0005;
            this.particles.rotation.x += 0.0002;
        }

        // Subtle camera movement
        const time = Date.now() * 0.0001;
        this.camera.position.x = Math.sin(time) * 2;
        this.camera.position.y = Math.cos(time) * 2;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Clean up geometries
        this.geometries.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });

        // Clean up particles
        if (this.particles) {
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }

        this.renderer.dispose();
    }
}
