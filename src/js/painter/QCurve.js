import * as THREE from 'three'

/**
 * Created by David on 14/12/2016.
 */
export class QCurve
{
    constructor()
    {
        this.p0 = new THREE.Vector3(0,0,0);
        this.p1 = new THREE.Vector3(0,0,0);
        this.p2 = new THREE.Vector3(0,0,0);
        this.p3 = new THREE.Vector3(0,0,0);
    }

    getPoint(r, p = null)
    {
        var r0 = (1-r)*(1-r);
        var r1 = 2*(1-r)*r;
        var r2 = r*r;
        var x = r0*this.p0.x + r1*this.p1.x + r2*this.p2.x;
        var y = r0*this.p0.y + r1*this.p1.y + r2*this.p2.y;
        var z = r0*this.p0.z + r1*this.p1.z + r2*this.p2.z;
        if(p == null) {
            p = new THREE.Vector3(x,y,z);
        }
        else{
            p.set(x,y,z);
        }
        return p;
    }

    getGradient(r, p = null)
    {
        var r0 = 2*(1-r);
        var r1 = 2*r;
        var x = r0*(this.p1.x  - this.p0.x) + r1*(this.p2.x  - this.p1.x);
        var y = r0*(this.p1.y  - this.p0.y) + r1*(this.p2.y  - this.p1.y);
        var z = r0*(this.p1.z  - this.p0.z) + r1*(this.p2.z  - this.p1.z);
        if(p == null) {
            p = new THREE.Vector3(x,y,z);
        }
        else{
            p.set(x,y,z);
        }
        //p.normalize();
        return p;
    }

    getPointsAlongCurve(n, points)
    {
        var r;
        for(var i =0; i< n;++i)
        {
            r = i/(n-1);
            points[i] = getPoint(r);
        }
    }
}

/**
 * three js object
 */
export class QCurveObj
{
    constructor(curve, nPoints = 10 , cubeSize = 0.5)
    {
        // lines mesh
        //
        var material = new THREE.LineBasicMaterial({
            color: 0x0000ff
        });
        this.curve = curve;
        this.nPoints = nPoints;
        this.geometry = new THREE.Geometry();
        for(var i = 0; i<this.nPoints;++i)
        {
            this.geometry.vertices.push( new THREE.Vector3(0, 0, 0));
        }

        this.line = new THREE.Line( this.geometry, material );

        // control points
        var cubemat =  new THREE.MeshNormalMaterial();
        var cubegeom =  new THREE.CubeGeometry( cubeSize, cubeSize, cubeSize );
        this.cube0 = new THREE.Mesh(cubegeom,cubemat);
        this.cube1 = new THREE.Mesh(cubegeom,cubemat);
        this.cube2 = new THREE.Mesh(cubegeom,cubemat);

        this.update();

    }

    addToScene(scene)
    {
        scene.add(this.line);
        scene.add(this.cube0);
        scene.add(this.cube1);
        scene.add(this.cube2);
    }

    update()
    {
        var r;
        for(var i = 0; i<this.nPoints;++i)
        {
            r = i / (this.nPoints - 1);
            this.curve.getPoint(r, this.geometry.vertices[i]);

        }
        //this.geometry.vertices[0].x += 0.1;
        this.geometry.verticesNeedUpdate = true;

        this.cube0.position.copy(this.curve.p0);
        this.cube1.position.copy(this.curve.p1);
        this.cube2.position.copy(this.curve.p2);

    }
}