/**
 * Created by jose.hillers on 06/06/2016.
 */
import * as THREE from "three"
import Cube from "./cube/Cube"
import Preloader from "./preloader/Preloader"

export default class App {

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.preloader = new Preloader();
        this.cube = new Cube();
        this.init();
    }

    init() {

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.camera.position.z = 5;

        this.preloader.load(() => {
            this.scene.add(this.cube);
            this.render();
        });
    }

    render() {
        this.cube.rotation.x += 0.03;
        this.cube.rotation.y += 0.03;

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}