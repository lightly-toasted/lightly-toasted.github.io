import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

const message = document.getElementById('message');


const githubProfile = document.getElementById('github');
githubProfile.addEventListener('click', () => {
	githubProfile.textContent = 'double click!'
	setTimeout(() => {
		githubProfile.textContent = '@lightly-toasted'
	}, 1000)
	return false;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
});

let tiers = [
	{ name: 'Eww!', color: 'darkgray', threshold: 200 },
	{ name: 'Yucky', color: 'gray', threshold: 150 },
	{ name: 'Meh.', color: 'darkseagreen', threshold: 100 },
	{ name: 'Hmm...', color: 'darkolivegreen', threshold: 50 },
	{ name: 'Good', color: 'limegreen', threshold: 25 },
	{ name: 'Tasty!', color: 'greenyellow', threshold: 10 },
	{ name: 'Awesome', color: 'crimson', threshold: 2 },
	{ name: 'LEGENDARY', color: 'goldenrod', threshold: 1 },
	{ name: 'PERFECT', color: 'gold', threshold: 0 }
]


document.body.appendChild( renderer.domElement );
renderer.setClearColor(0x000000, 0)

const directionalLight = new THREE.AmbientLight(0xffffff, 3.6);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

camera.position.z = 5;

var loader = new GLTFLoader();

loader.load('model.glb', gltf => {
    const toaster = gltf.scene;
    toaster.scale.set(3, 3, 3);
    toaster.position.y = -.5;
	toaster.rotation.set(0.4, 37, 0)
    scene.add(toaster);
	const burntTexture = toaster.children[0].children[0].children[3]
    burntTexture.visible = false
	
	document.body.addEventListener('mousedown', onStart);
	document.body.addEventListener('mouseup', onEnd);
	document.body.addEventListener('touchstart', onStart);
	document.body.addEventListener('touchend', onEnd);

	const mixer = new THREE.AnimationMixer( toaster );
	const actionStart = mixer.clipAction(gltf.animations[0]);
    const actionEnd = mixer.clipAction(gltf.animations[1]);

	let time = 0
	let burntAt = 0
	let holdInterval;

    function onStart() {
		burntTexture.visible = false
		message.style.color = 'white'
		time = 0
		burntAt = Math.round(Math.random() * 5) + 5
		
		clearInterval(holdInterval)
		holdInterval = setInterval(() => {
			time++
			message.textContent = `${time / 100} / ${burntAt}`
		}, 10)
        actionEnd.stop();
        actionStart.play();
        actionStart.clampWhenFinished = true;
        actionStart.loop = THREE.LoopOnce;
    }

    function onEnd() {
		const diff = burntAt * 100 - time
		if (time < 100) message.textContent = 'hold...';
		else if (diff >= 0) {
			const resultTier = tiers.find(tier => diff >= tier.threshold);
			message.style.color = resultTier.color;
			message.textContent = `${resultTier.name} (-${diff / 100}s)`;
		} else {
			message.textContent = `Burnt! (+${-diff / 100}s)`;
			message.style.color = 'black';
			burntTexture.visible = true
		}
		clearInterval(holdInterval)
		actionStart.stop();
		actionEnd.play();
		actionEnd.clampWhenFinished = true;
		actionEnd.loop = THREE.LoopOnce;
	}

	const clock = new THREE.Clock();
	function animate() {
		requestAnimationFrame(animate);

		const delta = clock.getDelta();
		mixer.update(delta)

		renderer.render(scene, camera);
	}

	animate();
} );