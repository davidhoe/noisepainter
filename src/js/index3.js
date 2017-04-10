import {TextFileLoader} from './painter/TextFileLoader'
import {InstancedGrid} from './painter/InstancedGrid'
import {QCurve} from './painter/QCurve'
import {QCurveObj} from './painter/QCurve'
import {StrokePath} from './painter/StrokePath'
import {Particle} from './painter/Particle'
import {VectorField} from './painter/VectorField'
import Preloader from "./preloader/Preloader"


import * as THREE from 'three'
import * as Stats from 'stats-js'

/**
 * Created by David on 14/12/2016.
 */
//if ( !Detector.webgl ) Detector.addGetWebGLMessage();

///////////////////////

var container, stats;
var controls;

var camera, scene, renderer;
//var orientations;
//var offsets;
//var lengths;
//var speeds;


var fragshader;
var vertshader;
TextFileLoader.Instance().loadFiles(["shaders/fragShader.glsl","shaders/vertShader.glsl"], filesLoaded);

function filesLoaded(files)
{
    fragshader = files[0];
    vertshader = files[1];
    makeMeshObj();
}


function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 500 );

//    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    //camera.position.z = 20;
    camera.position.z = 50;




    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true  });
    scene = new THREE.Scene();

    // mouse orbit control
    /*
     controls = new THREE.OrbitControls( camera, renderer.domElement );
     controls.enableDamping = true;
     controls.dampingFactor = 0.25;
     controls.enableZoom = false;*/

    /*
    controls = new THREE.TrackballControls(camera);

    controls.rotateSpeed = 10.0;
    controls.zoomSpeed = 10.2;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
*/

    if ( renderer.extensions.get( 'ANGLE_instanced_arrays' ) === false ) {
        document.getElementById( "notSupported" ).style.display = "";
        return;
    }

    renderer.setClearColor( 0xFFFFFF );
    renderer.autoClear = false;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.clear();

/*
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
     document.body.appendChild( stats.domElement );
*/
    window.addEventListener( 'resize', onWindowResize, false );
}

function getImageData( image ) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );
    return context.getImageData( 0, 0, image.width, image.height );
}

function getPixel( imagedata, nx, ny ) {
    var x = Math.round( nx *imagedata.width);
    var y = Math.round( ny *imagedata.height);
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ] /255.0, g: data[ position + 1 ]/255.0, b: data[ position + 2 ]/255.0, a: data[ position + 3 ]/255.0 };
}

var imagedata = null;
var imageDataLoaded = false;
var preloader = new Preloader();
preloader.load(() => {
//    this.scene.add(this.cube);
    //this.render();
   // var imgTexture = THREE.ImageUtils.loadTexture( "environment/floor.jpg" );
    var loader = new THREE.TextureLoader();
    loader.setPath('textures/');
    var imageURL = '7.jpg';
//    var imageURL = 'grad.png';

    var _this = this;
    var texture = loader.load(imageURL,
        function ( texture ) {
            // do something with the texture on complete
            console.log("texture", texture);
            imagedata = getImageData(texture.image );
            console.log("imagedata", imagedata);
            imageDataLoaded = true;
            //test();
        }
    );

});

var field = new VectorField();
var p0s;
var p1s;
var p2s;
var q0s;
var q1s;
var q2s;
var colours0;
var colours1;
var startRs;
var endRs;
var nInstances;

var basepath;
var pathobj;
var ready = false;
var bufferix;

function makeMeshObj()
{
    //
    basepath = new QCurve();
    basepath.p1.x = 200;
    basepath.p1.y = 0;
    basepath.p2.x = 200;
    basepath.p2.y = 100;

    pathobj = new QCurveObj(basepath, 10);
   // pathobj.addToScene(scene);

    // geometry
    nInstances = 100000; // max number of instances that can be render in one go
    bufferix = 0;

    var grid = new InstancedGrid();
    grid.print();
    var nx = 2;
    var nz = 10;
    var zLen = 25;
    //grid.createTube(nx,nz,1,1,zLen);
    //grid.createRectTube(7,5,100,40);
    grid.createFlatGrid(nx,nz,1,1);
    grid.createIndices(nx,nz);
    grid.createUVGrid(nx,nz);


    // per instance data
    //  offsets = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( false );
    p0s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    p1s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    p2s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    q0s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    q1s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    q2s = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 3 ), 3, 1 ).setDynamic( true);
    colours0 = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 4 ), 4, 1 ).setDynamic( true);
    colours1 = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 4 ), 4, 1 ).setDynamic( true);

    // remove this
    // startRs = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 1 ), 1, 1 ).setDynamic( true);
    // endRs = new THREE.InstancedBufferAttribute( new Float32Array( nInstances * 1 ), 1, 1 ).setDynamic( true);

    //grid.geometry.addAttribute( 'offset', offsets ); // per mesh translation
    grid.geometry.addAttribute( 'p0', p0s);
    grid.geometry.addAttribute( 'p1', p1s);
    grid.geometry.addAttribute( 'p2', p2s);
    grid.geometry.addAttribute( 'q0', q0s);
    grid.geometry.addAttribute( 'q1', q1s);
    grid.geometry.addAttribute( 'q2', q2s);
    grid.geometry.addAttribute( 'colour0', colours0);
    grid.geometry.addAttribute( 'colour1', colours1);


    // grid.geometry.addAttribute( 'startR', startRs);
    //  grid.geometry.addAttribute( 'endR', endRs);

    var material = new THREE.RawShaderMaterial( {

        uniforms: {
            //map: { type: "t", value: texture }
        },
        vertexShader: vertshader,
        //fragmentShader: FragShader,
        fragmentShader: fragshader,
        //side: THREE.DoubleSide,
        transparent: true,
        //   wireframe: true

    } );

    var mesh = new THREE.Mesh( grid.geometry, material );
    mesh.frustumCulled = false;
    var zoom = 2;
    mesh.position.x = 1000;
    mesh.scale.set(zoom,zoom,zoom);
    scene.add( mesh );

    ready = true;
  //  drawTest();
}

function drawTest()
{
    var nx =  Math.random()*0.99;
    var ny = Math.random()*0.99;
    var col = getPixel(imagedata,nx,ny);

    //var x =-1000+ nx*2000;
    //var y =-450+ ny*950;


    var thickness = 2 + Math.random()*4;
    var particle = new Particle(field);
    var direction = (Math.random() < 0.5)?  -1 : 1;
    particle.init(nx,ny, thickness, direction);
    particle.strokePath.colour = new THREE.Vector3(col.r,col.g,col.b);
    particle.strokePath.alpha = 0.2 + 0.5*Math.random();
    var nsteps = 5 + Math.random()*10;
    for(var i =0; i< nsteps;++i)
    {
        particle.update(thickness);
    }
    bufferix = particle.strokePath.constructPath(p0s,p1s,p2s,q0s,q1s,q2s,colours0,colours1,bufferix);

    /*
     // test a couple of curves
     var i = 0;
     p0s.setXY(i, 0,0);
     p1s.setXY(i, 102,0);
     p2s.setXY(i, 202,25);
     q0s.setXY(i, 0,0 + 50);
     q1s.setXY(i, 102,0 + 50);
     q2s.setXY(i, 202,25);
     */



}

function onWindowResize( event ) {

    // camera.aspect = window.innerWidth / window.innerHeight;

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;


    camera.updateProjectionMatrix();

    //controls.handleResize();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    if(ready && imageDataLoaded) {
        bufferix = 0;
       // console.log("imageDataLoaded", imageDataLoaded);

        for (var i = 0; i < 500; ++i) {
            drawTest();
        }
        // update
        p0s.needsUpdate = true;
        p1s.needsUpdate = true;
        p2s.needsUpdate = true;
        q0s.needsUpdate = true;
        q1s.needsUpdate = true;
        q2s.needsUpdate = true;
        colours0.needsUpdate  =true;
        colours1.needsUpdate  =true;

        render();

    }
   // stats.update();

    //controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

}

var lastTime = 0;

var moveQ = ( new THREE.Quaternion( .5, .5, .5, 0.0 ) ).normalize();
var tmpQ = new THREE.Quaternion();
var currentQ = new THREE.Quaternion();
function render() {

    var time = performance.now();

    if(ready) {
        //var object = scene.children[0];
        var x;
        var age;
        var introDuration = 0.2;
        var outroDuration = 0.2;
        var r;

        //   endRs.needsUpdate = true;
        //  startRs.needsUpdate = true;
    }
    //renderer.autoClear = false;
    renderer.render( scene, camera );

    // pathobj.update();
    lastTime = time;
}

init();
animate();