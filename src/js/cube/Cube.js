/**
 * Created by jose.hillers on 07/06/2016.
 */
import * as THREE from "three"

export default class Cube extends THREE.Mesh {

    constructor() {
        var geometry = new THREE.BoxGeometry(1, 2, 1);
        var loader = new THREE.TextureLoader();
        loader.setPath('textures/');
        var imageURL = 'checked-checkbox-512.png';
        var texture = loader.load(imageURL);
        var material = new THREE.MeshBasicMaterial({color: 0xffffff, map: texture, transparent:true});
        super(geometry, material);
    }
}
