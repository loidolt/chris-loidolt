<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let modelPath: string;

  let container: HTMLDivElement;
  let error = false;
  let loading = true;

  onMount(async () => {
    if (!browser) return;

    try {
      // Dynamically import Three.js to avoid SSR issues
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      // Setup scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0e14);

      // Setup camera
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      // Setup controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          scene.add(gltf.scene);

          // Center the model
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const center = box.getCenter(new THREE.Vector3());
          gltf.scene.position.sub(center);

          // Adjust camera to fit model
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2;

          loading = false;
        },
        undefined,
        (err) => {
          console.error('Error loading model:', err);
          error = true;
          loading = false;
        }
      );

      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // Handle resize
      function handleResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    } catch (err) {
      console.error('Error initializing 3D viewer:', err);
      error = true;
      loading = false;
    }
  });
</script>

<div class="w-full aspect-square relative" bind:this={container}>
  {#if loading}
    <div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--bg-surface)">
      <div class="text-sm" style="color: var(--text-muted)">Loading 3D model...</div>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-0 flex items-center justify-center" style="background-color: var(--bg-surface)">
      <div class="text-sm text-center p-4">
        <div style="color: var(--error-color)" class="mb-2">Error loading 3D model</div>
        <div style="color: var(--text-muted)" class="text-xs">Check console for details</div>
      </div>
    </div>
  {/if}
</div>

<div class="mt-4 text-xs text-center" style="color: var(--text-muted)">
  [click and drag to rotate | scroll to zoom]
</div>
