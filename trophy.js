// trophy.js

// === Imports dynamiques (pas de "import 'three'" pour éviter l'erreur de module) ===
let THREE, OBJLoader;

// Modèle de base (normalisé) – on le charge UNE SEULE fois
let baseTrophy = null;

// Scènes / caméras / renderers / IDs d’animation
let splashScene = null;
let splashCamera = null;
let splashRenderer = null;
let splashAnimationId = null;

let headerScene = null;
let headerCamera = null;
let headerRenderer = null;
let headerAnimationId = null;

// =======================
// 1. Chargement de Three + OBJLoader
// =======================
async function loadThreeJS() {
  if (!THREE) {
    const threeModule = await import(
      "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js"
    );
    THREE = threeModule;

    const loaderModule = await import(
      "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js"
    );
    OBJLoader = loaderModule.OBJLoader;
  }
  return { THREE, OBJLoader };
}

// =======================
// 2. Chargement + normalisation du trophée (une seule fois)
// =======================
async function loadBaseTrophy() {
  await loadThreeJS();

  if (baseTrophy) return baseTrophy;

  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.load(
      "assets/white_mesh.obj",
      (obj) => {
        // Matériau doré uniforme
        obj.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: "#d4af37",
              metalness: 0.9,
              roughness: 0.1,
              emissive: "#d4af37",
              emissiveIntensity: 0.2
            });
          }
        });

        // --- Bounding box ---
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Centrer le modèle sur (0, 0, 0)
        obj.position.sub(center); // équivalent à obj.position.set(-center.x, -center.y, -center.z)

        // Normaliser l’échelle : taille max = 2 unités
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // hauteur approx 2 unités
        const scale = targetSize / maxDim;
        obj.scale.setScalar(scale);

        baseTrophy = obj;
        resolve(baseTrophy);
      },
      undefined,
      (err) => {
        console.error("Erreur de chargement OBJ :", err);
        reject(err);
      }
    );
  });
}

// =======================
// 3. Scène SPLASH plein écran
// =======================
async function initSplashScene() {
  const canvas = document.getElementById("trophy3d");
  if (!canvas) return;

  await loadThreeJS();

  // Scène
  splashScene = new THREE.Scene();

  // Caméra
  splashCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  splashCamera.position.set(0, 0, 6);
  splashCamera.lookAt(0, 0, 0);

  // Renderer
  splashRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  splashRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  splashRenderer.setSize(window.innerWidth, window.innerHeight);

  // Lumières
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(3, 4, 5);
  splashScene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  splashScene.add(ambient);

  // Charger le modèle de base puis le cloner pour cette scène
  const base = await loadBaseTrophy();
  const trophy = base.clone();
  splashScene.add(trophy);

  // Animation
  function animateSplash() {
    splashAnimationId = requestAnimationFrame(animateSplash);
    trophy.rotation.y += 0.003;
    splashRenderer.render(splashScene, splashCamera);
  }
  animateSplash();
}

// =======================
// 4. Scène HEADER (petite coupe dans la navbar)
// =======================
async function initHeaderScene() {
  const headerCanvas = document.getElementById("header-trophy3d");
  if (!headerCanvas) return;

  await loadThreeJS();

  headerScene = new THREE.Scene();

  const size = headerCanvas.clientWidth || 60;

  headerCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  headerCamera.position.set(0, 0, 4);
  headerCamera.lookAt(0, 0, 0);

  headerRenderer = new THREE.WebGLRenderer({
    canvas: headerCanvas,
    alpha: true,
    antialias: true
  });
  headerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  headerRenderer.setSize(size, size);

  // Lumières
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(2, 3, 4);
  headerScene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  headerScene.add(ambient);

  // Cloner le modèle normalisé
  const base = await loadBaseTrophy();
  const headerTrophy = base.clone();
  headerTrophy.rotation.y = Math.PI; // un peu tourné vers la droite
  headerScene.add(headerTrophy);

  function animateHeader() {
    headerAnimationId = requestAnimationFrame(animateHeader);
    headerTrophy.rotation.y += 0.005;
    headerRenderer.render(headerScene, headerCamera);
  }
  animateHeader();
}

// =======================
// 5. Gestion du redimensionnement
// =======================
window.addEventListener("resize", () => {
  // Splash plein écran
  if (splashRenderer && splashCamera) {
    splashCamera.aspect = window.innerWidth / window.innerHeight;
    splashCamera.updateProjectionMatrix();
    splashRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Header (carré)
  if (headerRenderer && headerCamera) {
    const headerCanvas = document.getElementById("header-trophy3d");
    if (headerCanvas) {
      const size = headerCanvas.clientWidth || 60;
      headerRenderer.setSize(size, size);
      headerCamera.aspect = 1;
      headerCamera.updateProjectionMatrix();
    }
  }
});

// =======================
// 6. Initialisation au chargement + gestion du splash
// =======================
document.addEventListener("DOMContentLoaded", () => {
  // Lancer le splash 3D
  initSplashScene();

  const splash = document.getElementById("splash");
  const splashSkip = document.querySelector(".splash-skip");

  async function hideSplash() {
    if (!splash) return;

    // Arrêter l'animation du splash pour économiser
    if (splashAnimationId) {
      cancelAnimationFrame(splashAnimationId);
      splashAnimationId = null;
    }

    splash.classList.add("hide");

    setTimeout(async () => {
      splash.style.display = "none";

      // Afficher le canvas header et lancer la petite coupe
      const headerCanvas = document.getElementById("header-trophy3d");
      if (headerCanvas) {
        headerCanvas.classList.add("show");
      }
      await initHeaderScene();
    }, 800);
  }

  if (splashSkip) {
    splashSkip.addEventListener("click", hideSplash);
  }

  if (splash) {
    splash.addEventListener("click", hideSplash);
  }

  document.body.style.overflow = "auto";

});
