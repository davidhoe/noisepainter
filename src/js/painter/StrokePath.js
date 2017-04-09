import * as THREE from 'three'

/**
 * 2d path that is constructed with piecewise segments from a set of points
 */
export class StrokePath
{
    constructor()
    {
        this.points = [];
        this.thicknesses = [];
        this.colour = new THREE.Vector3(Math.random(),Math.random(),Math.random());
    }

    addPoint(p, thickness)
    {
        this.points.push(p);
        this.thicknesses.push(thickness);
    }


    constructPath(p0s,p1s,p2s,q0s,q1s,q2s,colours0, colours1, ix)
    {
        // test
        var col = this.colour;
        // create the basePoints
        var n = this.points.length;
        var cps = [];
        var cqs = [];

        for(var i =0; i < n;++i) {
            var c0 = this.points[Math.max(0,i - 1)];
            var c1 = this.points[i ];
            var c2 = this.points[Math.min(n-1, i + 1)];
            var thickness = this.thicknesses[i]/2;

            var delta = new THREE.Vector3(c2.x - c0.x,c2.y - c0.y,0);
            // normalise it
            var len = Math.sqrt( delta.x*delta.x + delta.y*delta.y);
            delta.x /= len;
            delta.y /= len;
            // get the right angle of it
            var temp = delta.x;
            delta.x = delta.y;
            delta.y = -temp;

            var cp =  new THREE.Vector3(c1.x - delta.x*thickness,c1.y - delta.y*thickness,0);
            var cq =  new THREE.Vector3(c1.x + delta.x*thickness,c1.y + delta.y*thickness,0);
            cps.push(cp);
            cqs.push(cq);
        }

        // identify peicewise segments
        for(var i =0; i< n-2;++i)
        {
            var c0 = cps[i+0];
            var c1 = cps[i+1];
            var c2 = cps[i+2];
            var r0 = (i==0) ? 0: 0.5;
            var r1 = (i==n-3) ? 0.5: 0.5;
            var p0 = new THREE.Vector3(c0.x + (c1.x-c0.x)*r0,  c0.y + (c1.y-c0.y)*r0 );
            var p2 = new THREE.Vector3(c1.x + (c2.x-c1.x)*r1,  c1.y + (c2.y-c1.y)*r1 );
            //console.log(p0,c1,p2);

            p0s.setXY(ix, p0.x,p0.y);
            p1s.setXY(ix, c1.x,c1.y);
            p2s.setXY(ix, p2.x,p2.y);

            var cq0 = cqs[i+0];
            var cq1 = cqs[i+1];
            var cq2 = cqs[i+2];
            var q0 = new THREE.Vector3(cq0.x + (cq1.x-cq0.x)*r0,  cq0.y + (cq1.y-cq0.y)*r0 );
            var q2 = new THREE.Vector3(cq1.x + (cq2.x-cq1.x)*r1,  cq1.y + (cq2.y-cq1.y)*r1 );
         //   console.log(q0,c1,q2);

            q0s.setXY(ix, q0.x,q0.y);
            q1s.setXY(ix, cq1.x,cq1.y);
            q2s.setXY(ix, q2.x,q2.y);
            colours0.setXYZ(ix, col.x,col.y,col.z);
            colours1.setXYZ(ix, col.x,col.y,col.z);

            ix += 1;
            if(i==n-3)
            {
                var mid = new THREE.Vector3((c2.x + cq2.x)/2, (c2.y + cq2.y)/2);
                // add end round cap
                p0s.setXY(ix, p2.x,p2.y);
                p1s.setXY(ix, c2.x,c2.y);
                p2s.setXY(ix, mid.x,mid.y);

                q0s.setXY(ix, q2.x,q2.y);
                q1s.setXY(ix, cq2.x,cq2.y);
                q2s.setXY(ix, mid.x,mid.y);
                colours0.setXYZ(ix, col.x,col.y,col.z);
                colours1.setXYZ(ix, col.x,col.y,col.z);
                //console.log(col.x,col.y,col.z);

                ix += 1;
            }

        }
        return ix;
    }
}