import * as THREE from 'three'

//if ( !Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;
var camera, scene, renderer;
var orientations;
function init() {
   // container = document.getElementById( 'container' );

    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 500 );
    //camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    //camera.position.z = 20;
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();
    // geometry
    var instances = 10;
    var geometry = new THREE.InstancedBufferGeometry();
    // per mesh data
    var s = 40;
    var vertices = new THREE.BufferAttribute( new Float32Array( [
        // Front
        -s, s, 0,
        s, s, 0,
        -s, -s, 0,
        s, -s, 0
    ] ), 3 );
    geometry.addAttribute( 'position', vertices );
    var uvs = new THREE.BufferAttribute( new Float32Array( [
        //x	y	z
        // Front
        0, 0,
        1, 0,
        0, 1,
        1, 1
    ] ), 2 );
    geometry.addAttribute( 'uv', uvs );
    var indices = new Uint16Array( [
        0, 1, 2,
        2, 1, 3
    ] );
    geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    // per instance data
    var offsets = new THREE.InstancedBufferAttribute( new Float32Array( instances * 3 ), 3, 1 );
    var vector = new THREE.Vector4();
    for ( var i = 0, ul = offsets.count; i < ul; i++ ) {
        var x = Math.random() * 500 - 250;
        var y = Math.random() * 500 - 250;
        var z = 0;
        vector.set( x, y, z, 0 );

        // move out at least 5 units from center in current direction
        offsets.setXYZ( i, x + vector.x , y + vector.y, z + vector.z  );
    }
    geometry.addAttribute( 'offset', offsets ); // per mesh translation
    orientations = new THREE.InstancedBufferAttribute( new Float32Array( instances * 4 ), 4, 1 ).setDynamic( true );
    for ( var i = 0, ul = orientations.count; i < ul; i++ ) {
        vector.set( 1, 0, 0,0);
        vector.normalize();
        orientations.setXYZW( i, vector.x, vector.y, vector.z, vector.w );
    }
    geometry.addAttribute( 'orientation', orientations ); // per mesh orientation
    // material
    var texture = new THREE.TextureLoader().load( 'textures/checked-checkbox-512.png' );
    texture.anisotropy = renderer.getMaxAnisotropy();
    var material = new THREE.RawShaderMaterial( {
        uniforms: {
            map: { value: texture }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
       // side: THREE.DoubleSide,
        transparent: true
    } );
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    if ( renderer.extensions.get( 'ANGLE_instanced_arrays' ) === false ) {
        document.getElementById( "notSupported" ).style.display = "";
        return;
    }
    renderer.setClearColor( 0x101010 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild(renderer.domElement);
//    container.appendChild( renderer.domElement );
    //stats = new Stats();
    //container.appendChild( stats.dom );
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize( event ) {
    //camera.aspect = window.innerWidth / window.innerHeight;

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}
//
function animate() {
    requestAnimationFrame( animate );
    render();
    //stats.update();
}
var lastTime = 0;
var moveQ = ( new THREE.Quaternion( .5, .5, .5, 0.0 ) ).normalize();
var tmpQ = new THREE.Quaternion();
var currentQ = new THREE.Quaternion();
function render() {
    var time = performance.now();
    //var object = scene.children[0];
   // object.rotation.y = time * 0.00005;
    renderer.render( scene, camera );

    /*
    var delta = ( time - lastTime ) / 5000;
    tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
    for ( var i = 0, ul = orientations.count; i < ul; i++ ) {
        var index = i * 4;
        currentQ.set( orientations.array[index], orientations.array[index + 1], orientations.array[index + 2], orientations.array[index + 3] );
        currentQ.multiply( tmpQ );
        orientations.setXYZW( i, currentQ.x, currentQ.y, currentQ.z, currentQ.w );
    }
    orientations.needsUpdate = true;
    */
    lastTime = time;
}
init();
animate();