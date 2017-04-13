import {TextFileLoader} from './painter/TextFileLoader'
import {InstancedGrid} from './painter/InstancedGrid'
import {QCurve} from './painter/QCurve'
import {QCurveObj} from './painter/QCurve'
import {StrokePath} from './painter/StrokePath'
import {Particle} from './painter/Particle'
import {VectorField} from './painter/VectorField'
import Preloader from "./preloader/Preloader"
import {MathUtils} from "./util/MathUtils"

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


var textureFilenames = ["7.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"];
var textureIX = 0;


function filesLoaded(files)
{
    fragshader = files[0];
    vertshader = files[1];
    makeMeshObj();
}
// emit particles from a bound, bottom of the bound is the horizon line?
// if camera is cetnered, then it should be centered in x pos
// if camera is not centered,

var renderScale = 1;
var zoom = 0.2 * renderScale ;
var basezoom = 1; // change this to change the amount of turbulance
var meshPositionY = 0/basezoom*zoom;

var w = 1000 * renderScale;
var h = 800 * renderScale;
var bottomy = h * 1.0;


function init() {

    container = document.getElementById( 'container' );

    //var w = window.innerWidth;
    //var h = window.innerHeight;
//    w = 6000;
//    h = 6000;

    // todo uncenter the camera
    //camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, - 500, 500 );
    camera = new THREE.OrthographicCamera( 0, w , h , 0, - 500, 500 );


//    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    //camera.position.z = 20;
    //camera.position.z = 50;



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
    renderer.setSize( w,h);
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

document.addEventListener('keydown',onDocumentKeyDown,false);
function onDocumentKeyDown(event) {
    console.log(event);
    if(event.key == 's') {
        //saveAsImage();
      //  savePixels();
         saveCanvas();
    }
    if(event.key == " ")
    {
        reset();
    }

}


function reset()
{
    console.log("reset");
    imageDataLoaded = false;

    // clear
    renderer.clear();

    // choose a texture and load it
    var loader = new THREE.TextureLoader();
    loader.setPath('textures/');
    textureIX = (textureIX + 1) % textureFilenames.length;
    var imageURL =   textureFilenames[textureIX];
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


}


/////////////////////////////////////////////////////////////////////////////////////////////

function savePixels()
{
    var gl = renderer.domElement.getContext('webgl');
    console.log(gl.drawingBufferWidth, gl.drawingBufferHeight);
    var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log(pixels); // Uint8Array
}

function saveCanvas()
{
    renderer.domElement.toBlob(function(blob) {
        saveAs(blob, "output.png");
    });
}

function saveAsImage() {
    var imgData, imgNode;
    try {
        var strDownloadMime = "image/octet-stream";

        var strMime = "image/png";
        imgData = renderer.domElement.toDataURL(strMime);

        document.write("<img src='"+imgData+"' alt='from canvas'/>");

        //saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");
    } catch (e) {
        console.log(e);
        return;
    }

}

var saveFile = function (strData, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); //remove the link when done
    } else {
        location.replace(uri);
    }
}

////////////////////////////////////////////////


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
var grid;

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
    nInstances = 200000; // max number of instances that can be render in one go
    bufferix = 0;

    grid = new InstancedGrid();
    grid.print();
    var nx = 2; // keep this as 2
    var nz = 5; // resolution
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
         //  wireframe: true

    } );

    var mesh = new THREE.Mesh( grid.geometry, material );
    mesh.frustumCulled = false;
    //var zoom = 0.5;
  //  mesh.position.y = meshPositionY;
  //  mesh.scale.set(zoom,zoom,zoom);
    scene.add( mesh );


    //add a test horizon line
    addTestLine();

    ready = true;
  //  drawTest();
}


function addTestLine()
{
    var material = new THREE.LineBasicMaterial({
        color: 0xff0000
    });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3( -1000*renderScale, 0, 0 ),
        new THREE.Vector3( 1000*renderScale, 0, 0 )
    );
    var line = new THREE.Line( geometry, material );
    scene.add( line );
}

function drawTest()
{
    // todo use canvas coordinates
    // particles are nomralised [0,1] -> remap to [-h,h]
    var nx =  Math.random()*0.99 ;
    var ny = Math.random()*0.99 ;
    // convert to the emission bound
    var canvasx = nx*w; // stretch the width
    var canvasy = ny*bottomy; // do

    var col = getPixel(imagedata,nx,ny);

    //var x =-1000+ nx*2000;
    //var y =-450+ ny*950;


    var thickness = 0.5 + Math.random()*7;
    var direction = (Math.random() < 0.5)?  -1 : 1;
    var nsteps = 30 + Math.random()*100;
    var alpha =  0.7 + 0.5*Math.random();
    var particle;

    // set a random seed
    var seed = MathUtils.GetRandomIntBetween(0,100000);

    // draw the shading (alpha black)
    var brightness = 0.5;
    MathUtils.SetSeed(seed); // rset seed
    particle = new Particle(field);
    var thicknessShade = Math.min( thickness  + 4, thickness  *1.2);
    particle.init( canvasx,canvasy, thicknessShade, direction);
    particle.strokePath.colour = new THREE.Vector3(col.r*brightness,col.g*brightness,col.b*brightness);
    particle.strokePath.alpha = alpha*0.2;
    for(var i =0; i< nsteps;++i)
    {
        particle.update(thicknessShade);
    }
    bufferix = particle.strokePath.constructPath(p0s,p1s,p2s,q0s,q1s,q2s,colours0,colours1,bufferix);



    // draw the colour
    MathUtils.SetSeed(seed); // rset seed
    particle = new Particle(field);
    particle.init(canvasx,canvasy, thickness, direction);
    particle.strokePath.colour = new THREE.Vector3(col.r,col.g,col.b);
    particle.strokePath.alpha =alpha;
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

    /*
    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
*/
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
        grid.setDrawCount(bufferix);
        //console.log(bufferix);
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