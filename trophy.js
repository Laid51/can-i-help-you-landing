// Import Three.js dynamiquement pour éviter les problèmes de résolution de module
let THREE, OBJLoader;
let trophyObject = null;
let splashRenderer = null;
let headerRenderer = null;
let splashCamera = null;
let headerCamera = null;
let splashScene = null;
let headerScene = null;
let splashAnimationId = null;
let headerAnimationId = null;

// Charger Three.js de manière asynchrone
async function loadThreeJS() {
    if (!THREE) {
        const threeModule = await import("https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js");
        THREE = threeModule;
        const OBJLoaderModule = await import("https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js");
        OBJLoader = OBJLoaderModule.OBJLoader;
    }
    return { THREE, OBJLoader };
}

// Initialiser la scène splash (plein écran)
async function initSplashScene() {
    await loadThreeJS();
    const canvas = document.getElementById("trophy3d");
    if (!canvas) return;

    splashScene = new THREE.Scene();
    
    // --- Camera centrée ---
    splashCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    splashCamera.position.set(0, 0, 5);
    splashCamera.lookAt(0, 0, 0);

    // Renderer
    splashRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    splashRenderer.setSize(window.innerWidth, window.innerHeight);
    splashRenderer.setPixelRatio(window.devicePixelRatio);

    // Lumières
    splashScene.add(new THREE.DirectionalLight(0xffffff, 1.2).position.set(2, 3, 5));
    splashScene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Charger l'OBJ
    const loader = new OBJLoader();
    loader.load(
        "assets/white_mesh.obj",
        (obj) => {
            trophyObject = obj.clone();

            // Couleur dorée
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

            splashScene.add(obj);

            // --- Calcul du centrage ---
            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());

            // Centrer VRAIMENT le modèle en (0,0,0)
            obj.position.x = -center.x;
            obj.position.y = -center.y;
            obj.position.z = -center.z;

            // Échelle responsive
            const maxDim = Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y);
            const scale = (window.innerHeight * 0.45) / maxDim;
            obj.scale.set(scale, scale, scale);

            // --- Position verticale finale : exactement au centre ---
            obj.position.y = 0;

            // --- Caméra centrée ---
            splashCamera.lookAt(0, 0, 0);

            // Animation
            function animateSplash() {
                requestAnimationFrame(animateSplash);
                obj.rotation.y += 0.003;
                splashRenderer.render(splashScene, splashCamera);
            }
            animateSplash();
        },
        undefined,
        (err) => console.error("Erreur OBJ:", err)
    );
}


// Initialiser la scène dans l'en-tête (petite coupe)
async function initHeaderScene() {
    await loadThreeJS();
    const headerCanvas = document.getElementById("header-trophy3d");
    if (!headerCanvas) return;

    headerScene = new THREE.Scene();
    
    // Taille du canvas selon l'écran
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;
    const canvasSize = isSmallMobile ? 35 : (isMobile ? 40 : 60);
    
    // Camera pour en-tête (centrée)
    headerCamera = new THREE.PerspectiveCamera(50, canvasSize / canvasSize, 0.1, 1000);
    headerCamera.position.set(0, 0, 2);
    headerCamera.lookAt(0, 1.2, 0);

    // Renderer pour en-tête
    headerRenderer = new THREE.WebGLRenderer({ canvas: headerCanvas, alpha: true, antialias: true });
    headerRenderer.setSize(canvasSize, canvasSize);
    headerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limiter pour les performances

    // Lights pour en-tête
    const headerLight = new THREE.DirectionalLight(0xffffff, 1);
    headerLight.position.set(1, 2, 3);
    headerScene.add(headerLight);

    const headerAmbient = new THREE.AmbientLight(0xffffff, 0.5);
    headerScene.add(headerAmbient);

    // Charger le modèle pour l'en-tête
    if (trophyObject) {
        const headerObj = trophyObject.clone();
        
        // Calculer le bounding box pour centrer
        const box = new THREE.Box3().setFromObject(headerObj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Centrer le modèle
        headerObj.position.x = -center.x;
        headerObj.position.y = -center.y;
        headerObj.position.z = -center.z;
        
        // Ajuster l'échelle
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = isSmallMobile ? 35 : (isMobile ? 40 : 60);
        const scale = (targetSize * 0.8) / maxDimension;
        headerObj.scale.set(scale, scale, scale);
        
        headerObj.rotation.y = Math.PI;

        // Appliquer couleur dorée
        headerObj.traverse((child) => {
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

        headerScene.add(headerObj);

        // Animation de rotation lente pour en-tête
        function animateHeader() {
            if (headerRenderer && headerScene && headerCamera) {
                requestAnimationFrame(animateHeader);
                headerObj.rotation.y += 0.005; // Rotation plus lente
                headerRenderer.render(headerScene, headerCamera);
            }
        }
        animateHeader();
    } else {
        // Si le modèle n'est pas encore chargé, le charger
        const loader = new OBJLoader();
        loader.load(
            "assets/white_mesh.obj",
            (obj) => {
                trophyObject = obj;
                const headerObj = obj.clone();
                
                // Calculer le bounding box pour centrer
                const box = new THREE.Box3().setFromObject(headerObj);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Centrer le modèle
                headerObj.position.x = -center.x;
                headerObj.position.y = -center.y;
                headerObj.position.z = -center.z;
                
                // Ajuster l'échelle
                const isMobile = window.innerWidth < 768;
                const isSmallMobile = window.innerWidth < 480;
                const maxDimension = Math.max(size.x, size.y, size.z);
                const targetSize = isSmallMobile ? 35 : (isMobile ? 40 : 60);
                const scale = (targetSize * 0.8) / maxDimension;
                headerObj.scale.set(scale, scale, scale);
                
                headerObj.rotation.y = Math.PI;

                headerObj.traverse((child) => {
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

                headerScene.add(headerObj);

                function animateHeader() {
                    if (headerRenderer && headerScene && headerCamera) {
                        requestAnimationFrame(animateHeader);
                        headerObj.rotation.y += 0.005;
                        headerRenderer.render(headerScene, headerCamera);
                    }
                }
                animateHeader();
            }
        );
    }
}

// Gérer le redimensionnement
window.addEventListener("resize", () => {
    if (splashRenderer && splashCamera) {
        splashCamera.aspect = window.innerWidth / window.innerHeight;
        splashCamera.updateProjectionMatrix();
        splashRenderer.setSize(window.innerWidth, window.innerHeight);
        
        // Ajuster l'échelle du modèle si nécessaire
        if (splashScene && splashScene.children.length > 0) {
            const obj = splashScene.children.find(child => child.type === 'Group' || child.isMesh);
            if (obj) {
                // Recalculer le bounding box
                const box = new THREE.Box3().setFromObject(obj);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());
                const isMobile = window.innerWidth < 768;
                const maxDimension = Math.max(size.x, size.y, size.z);
                const targetSize = isMobile ? window.innerHeight * 0.45 : window.innerHeight * 0.55;
                const scale = targetSize / maxDimension;
                obj.scale.set(scale, scale, scale);
                
                // Maintenir le décalage vertical pour remonter le modèle
                const verticalOffset = isMobile ? 1.5 : 2.0;
                obj.position.y = 1.2;  // plus haut → centre parfaitement

                
                // Mettre à jour le lookAt de la caméra
                splashCamera.lookAt(0, verticalOffset, 0);
            }
        }
    }
    
    if (headerRenderer && headerCamera) {
        headerCamera.aspect = 60 / 60;
        headerCamera.updateProjectionMatrix();
    }
});

// Initialiser au chargement
document.addEventListener("DOMContentLoaded", () => {
    initSplashScene();
    
    // Gérer le clic sur le splash
    const splash = document.getElementById("splash");
    const splashSkip = document.querySelector(".splash-skip");
    
    async function hideSplash() {
        splash.classList.add("hide");
        setTimeout(async () => {
            splash.style.display = "none";
            // Initialiser la scène de l'en-tête après avoir masqué le splash
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
});
