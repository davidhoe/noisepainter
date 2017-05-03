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


var textureFilenames = [];
for(var i=1;i<=41;++i)
{
    textureFilenames.push( "colourful" + "/" + ((i < 10) ?"0":"") + i + ".jpg");
}
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


var ExportMode = {
    "png": "png",
    "jpg": "jpg"
};
var exportMode = ExportMode.png;


//var renderScale = 5.4;
var renderScale,bw,bh,bottomy;

var Mode = {
    "skyline": "skyline",
    "maps": "maps"
};
var mode = Mode.maps;

//renderScale = 7.2;
renderScale = 1.0;

if(mode == Mode.skyline)
{
    bw = 1000;
    bh = bw*(3/4);
    bottomy = bh *0.6;
}
else{
    // "maps"
  //  renderScale = 7.2;
    bh = 1000;
    bw = bh*(3/4);
    bottomy = bh * 1.0;
}

var w = bw * renderScale;
var h = bh * renderScale;


var noiseOffsetX, noiseOffsetY ;
function init() {
    randomiseField();

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

   var div = document.getElementById("canvasContainer");
    div.appendChild(renderer.domElement );
    // document.body.appendChild( renderer.domElement );
    renderer.clear();

/*
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
     document.body.appendChild( stats.domElement );
*/
    window.addEventListener( 'resize', onWindowResize, false );
    renderer.domElement.addEventListener( 'mousemove', onMouseMove, true );
    renderer.domElement.addEventListener( 'mousedown', onMouseDown, true );
    renderer.domElement.addEventListener( 'mouseup', onMouseUp, true );


    createGui();

    reset();

}
var ismousedown =false;
var mousex = 0;
var mousey = 0;




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
        // next teuxtre
        textureIX = (textureIX + 1) % textureFilenames.length;
        reset();
    }
    if(event.key == "r")
    {
        randomiseField();
        // refresh noise field
        reset();
    }

}
var gui;
var originalPoints = [];
for(var i = 0; i< 4;++i)
{
    originalPoints.push({"x":0, "y":0});
}
var points = originalPoints.slice(0);
var rectModel = {
    xOffset: 0.5,  //
    yOffset: 0.5,
    xScale: 1,
    yScale: 1,
    imageFilename: "image"
};
updatePoints(); // inital points should be a normalised rect
console.log(points);



//////////////////////////////////////////////////////////////////////////////////////////////
// colour map sampling options
var particleOptions = {
    directionForward: true

}

function createGui()
{
     gui = new dat.GUI();

    // My sample abject
    var obj = {
        flipX: function() {flipX();},
        flipY: function() {flipY();},
        rotate: function(){rotate();},
        resetPoints: function(){resetPoints();}

    };

    // Number field with slider
    gui.add(rectModel, "xOffset").min(0).max(1).step(0.01).onChange(function(val) {
        //    console.log("changed " + val);
            updatePoints();
        }
    ).listen();
    gui.add(rectModel, "yOffset").min(0).max(1).step(0.01).onChange(function(val) {
          //  console.log("changed " + val);
            updatePoints();
        }
    ).listen();
    gui.add(rectModel, "xScale").min(0).max(1).step(0.01).onChange(function(val) {
           // console.log("changed " + val);
            updatePoints();
        }
    ).listen();
    gui.add(rectModel, "yScale").min(0).max(1).step(0.01).onChange(function(val) {
            //console.log("changed " + val);
            updatePoints();
        }
    ).listen();
// Checkbox field
    gui.add(obj, "flipX");
    gui.add(obj, "flipY");
    gui.add(obj, "rotate");
    gui.add(obj, "resetPoints");
    gui.add(rectModel, "imageFilename").listen();
    gui.add(particleOptions, "directionForward").listen();

}

function flipX()
{
    console.log("flip x");
    var temp = points.slice(0);
    points[0] = temp[1];
    points[1] = temp[0];
    points[2] = temp[3];
    points[3] = temp[2];
    console.log(points);
}

function flipY()
{
    console.log("flipY");
    var temp = points.slice(0);
    points[0] = temp[3];
    points[1] = temp[2];
    points[2] = temp[1];
    points[3] = temp[0];
    console.log(points);

}

function rotate()
{
    var temp = points.slice(0);
    points[0] = temp[1];
    points[1] = temp[2];
    points[2] = temp[3];
    points[3] = temp[0];
    console.log(points);

}

function resetPoints()
{
    rectModel.xOffset =  0.5;
    rectModel.yOffset =  0.5;
    rectModel.xScale =  1;
    rectModel.yScale =  1;

    updatePoints();
    points = originalPoints.slice(0);
    console.log(points);
}

function updatePoints()
{
    var w = rectModel.xScale;
    var h = rectModel.yScale;
    var x = (rectModel.xOffset - 0.5)*(1-w) - 0.5*w +0.5;
    var y = (rectModel.yOffset - 0.5)*(1-h) - 0.5*h + 0.5;

    originalPoints[0].x = x;
    originalPoints[0].y = y;
    originalPoints[1].x = x + w;
    originalPoints[1].y = y;
    originalPoints[2].x = x + w;
    originalPoints[2].y = y + h;
    originalPoints[3].x = x ;
    originalPoints[3].y = y + h;
    console.log(originalPoints);

}

function getPoint(x,y)
{
    var p0 = points[0];
    var p1 = points[1];
    var p2 = points[2];
    var p3 = points[3];

    var x0 = p0.x + x*(p1.x - p0.x);
    var y0 = p0.y + x*(p1.y - p0.y);
    var x1 = p2.x + x*(p2.x - p3.x);
    var y1 = p2.y + x*(p2.y - p3.y);

    var tx = x0 + y*(x1- x0);
    var ty = y0 + y*(y1- y0);
    return {"y":ty,"x":tx};
}

//////////////////////////////////////////////////////////////////////////////////////////////


function randomiseField()
{
    noiseOffsetX = MathUtils.GetRandomFloat(0,100);
    noiseOffsetY = MathUtils.GetRandomFloat(0,100);

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

    var imageURL =   textureFilenames[textureIX];
//    var imageURL = 'grad.png';
    console.log("imageURL "+ imageURL);
    rectModel.imageFilename = imageURL; // show filename for debugin

    var _this = this;
    var texture = loader.load(imageURL,
        function ( texture ) {
            // do something with the texture on complete
           // console.log("texture", texture);
            imagedata = getImageData(texture.image );
           // console.log("imagedata", imagedata);
            imageDataLoaded = true;
            //test();
        }
    );


}


/////////////////////////////////////////////////////////////////////////////////////////////

function saveCanvas()
{
    if(exportMode == ExportMode.png) {
         renderer.domElement.toBlob(function(blob) {
         saveAs(blob, "output" + MathUtils.GenerateUUID() + ".png");
         });
    }
    else {

        renderer.domElement.toBlob(function (blob) {
            saveAs(blob, "output" + MathUtils.GenerateUUID() + ".jpg");
        }, "image/jpeg");
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
    var x = Math.floor( nx *(imagedata.width - 1));
    var y = Math.floor( ny *(imagedata.height-1));
    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;
    return { r: data[ position ] /255.0, g: data[ position + 1 ]/255.0, b: data[ position + 2 ]/255.0, a: data[ position + 3 ]/255.0 };
}

var imagedata = null;
var imageDataLoaded = false;
//var preloader = new Preloader();


//load();
function load() {
//preloader.load(() => {
//    this.scene.add(this.cube);
    //this.render();
    // var imgTexture = THREE.ImageUtils.loadTexture( "environment/floor.jpg" );
    var loader = new THREE.TextureLoader();
    loader.setPath('textures/');
    var imageURL = '01.jpg';
//    var imageURL = 'grad.png';

    var _this = this;
    var texture = loader.load(imageURL,
        function (texture) {
            // do something with the texture on complete
            console.log("texture", texture);
            imagedata = getImageData(texture.image);
            console.log("imagedata", imagedata);
            imageDataLoaded = true;
            //test();
        }
    );

}

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
    mesh.scale.set(renderScale,renderScale);
    scene.add( mesh );


    //add a test horizon line
    //addTestLine();

    ready = true;
  //  drawParticle();
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

Math.clamp = function(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

function onMouseMove(event){
    mousex = (event.clientX);
    mousey = (event.clientY);

    console.log(mousex,mousey);
    //mouseY = (event.clientY - window.innerHeight/2) / window.innerHeight/2;
}


function onMouseUp(event){
    ismousedown = false;
    console.log("onMouseUp");
}

function onMouseDown(event){
    ismousedown = true;
    console.log("onMouseDown");
    nsteps = 20 + Math.random()*160;
}
var nsteps = 20;

function drawParticleUpdate()
{
    if(ismousedown)
    {
        var n = 50;
        var nx = mousex/w +  Math.random()*0.02 ;
        var ny = mousey/h +  Math.random()*0.02 ;
        console.log(mousex/w, mousex/h);
        var direction =  particleOptions.directionForward ? 1: -1;// (Math.random() < 0.5)?  -1 : 1;
        var thickness = 0.5 + Math.random()*1.5;
         var alpha =  0.3 + 0.7*Math.random();

        for (var i = 0; i < n; ++i) {
            drawParticle(nx,ny, direction, nsteps, thickness, alpha);
        }
    }

    //drawRandomParticles(400);
}

function drawRandomParticles(n)
{
    for (var i = 0; i < n; ++i) {
        // particles are nomralised [0,1] -> remap to [-h,h]
        var nx =  Math.random()*0.99 ;
        var ny = Math.random()*0.99 ;
        var direction = (Math.random() < 0.5)?  -1 : 1;
        var thickness = 0.5 + Math.random()*1.5;
        var nsteps = 30 + Math.random()*100;
        var alpha =  0.3 + 0.7*Math.random();
        drawParticle(nx,ny, direction, nsteps, thickness, alpha);
    }
}

// draw particle at nx,ny
function drawParticle(nx,ny, direction, nsteps, thickness, alpha)
{
    // todo use canvas coordinates
    // convert to the emission bound
    var canvasx = nx*bw; // stretch the width
    var canvasy = bh - ny*( bottomy); // do

    //get slight random position
    var randomColPositionAmount= 0.01;
    var colx = Math.clamp( MathUtils.GetRandomFloat(nx- randomColPositionAmount,nx + randomColPositionAmount) ,0,0.999);
    var coly = Math.clamp( MathUtils.GetRandomFloat(ny- randomColPositionAmount,ny + randomColPositionAmount) ,0,0.999);
    var transformedPoint = getPoint(colx,coly);
    colx = transformedPoint.x;
    coly = transformedPoint.y;

    var col = getPixel(imagedata, colx,coly);

    //var x =-1000+ nx*2000;
    //var y =-450+ ny*950;


    var particle;

    // set a random seed
    var seed = MathUtils.GetRandomIntBetween(0,100000);

    // draw the shading (alpha black)
    var brightness = 0.5;
    MathUtils.SetSeed(seed); // rset seed
    particle = new Particle(field);

    var thicknessShade = Math.min( thickness  + 4, thickness  *1.2);
    particle.init( canvasx,canvasy, thicknessShade, direction);
    particle.noiseOffsetX = noiseOffsetX;
    particle.noiseOffsetY = noiseOffsetY;

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
    particle.noiseOffsetX = noiseOffsetX;
    particle.noiseOffsetY = noiseOffsetY;
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

        drawParticleUpdate();
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