import * as THREE from 'three'

// define a grid mesh
// has uvs
//

export class InstancedGrid{
    constructor()
    {
        this.geometry = new THREE.InstancedBufferGeometry();
       // this.instances = 20000;// default
    }

    setDrawCount(n)
    {
        this.geometry.maxInstancedCount = n;
    }



    /**
     * create mesh data along the x,z plane
     */
    createFlatGrid(nx,nz, xLen, zLen)
    {
        var n = nx * nz;
        var points = new Float32Array( n* 3);

        var ix = 0;
        //var p;
        var rx,rz;
        for(var j =0; j< nz;++j)
        {
            rz = j / (nz - 1);

            for(var i =0; i< nx;++i)
            {
                rx = i / (nx - 1);
                // point
                points[3*ix+0] = rx*xLen;  // x
                points[3*ix+1] = 0;     // y
                points[3*ix+2] = rz*zLen;  // z
                ix++;
            }
        }

        var pointsAtt = new THREE.BufferAttribute(points, 3);
        this.geometry.addAttribute( 'position', pointsAtt );
    }

    // 3 points = triangle
    // 4 points = square
    // more points looks like a circle
    // tube runs down the z axis
    createTube(nx,nz, xRadius, yRadius, zLen)
    {
        var n = nx * nz;
        var points = new Float32Array( n* 3);

        var ix = 0;
        //var p;
        var rx,rz,a;
        for(var j =0; j< nz;++j)
        {
            rz = j / (nz - 1);

            for(var i =0; i< nx;++i)
            {
                rx = i / (nx - 1);
                // point
                a = rx * Math.PI * 2.0;
                points[3*ix+0] = Math.sin(a)*xRadius;  // x
                points[3*ix+1] = Math.cos(a)*yRadius;  // y
                points[3*ix+2] = rz * zLen;     // z
                ix++;
            }
        }


        var pointsAtt = new THREE.BufferAttribute(points, 3);
        this.geometry.addAttribute( 'position', pointsAtt );
    }

    // nx = 4
    createRectTube(nz, xRect, yRect, zLen)
    {
        var nx = 5
        var n = nx * nz;
        var points = new Float32Array( n* 3);

        var ix = 0;
        //var p;
        var rx,rz, z;
        for(var j =0; j< nz;++j)
        {
            rz = j / (nz - 1);

            z = rz * zLen;
            points[3*ix+0] = -xRect*0.5;  // x
            points[3*ix+1] = -yRect*0.5;  // y
            points[3*ix+2] = z;     // z
            ix++;
            points[3*ix+0] = +xRect*0.5;  // x
            points[3*ix+1] = -yRect*0.5;  // y
            points[3*ix+2] = z;     // z
            ix++;
            points[3*ix+0] = +xRect*0.5;  // x
            points[3*ix+1] = +yRect*0.5;  // y
            points[3*ix+2] = z;     // z
            ix++;
            points[3*ix+0] = -xRect*0.5;  // x
            points[3*ix+1] = +yRect*0.5;  // y
            points[3*ix+2] = z;     // z
            ix++;
            // 
            points[3*ix+0] = -xRect*0.5;  // x
            points[3*ix+1] = -yRect*0.5;  // y
            points[3*ix+2] = z;     // z
            ix++;
        }

        var pointsAtt = new THREE.BufferAttribute(points, 3);
        this.geometry.addAttribute( 'position', pointsAtt );
    }


    createIndices(nw,nh)
    {
        var nTris = (nw-1)*(nh-1)*2;

        var indices = new Uint16Array( nTris * 3 );
        var ix0,ix1,ix2,ix3;
        var ix = 0;
        for(var j =0; j< nh-1; ++j)
        {
            for(var i = 0; i< nw-1; ++i)
            {
                // 4 corners
                ix0 = (j+0) * nw + (i+0);
                ix1 = (j+0) * nw + (i+1);
                ix2 = (j+1) * nw + (i+0);
                ix3 = (j+1) * nw + (i+1);

                // tri 1
                indices[ix++] = ix0;
                indices[ix++] = ix1;
                indices[ix++] = ix2;

                // tri 2
                indices[ix++] = ix1;
                indices[ix++] = ix3;
                indices[ix++] = ix2;
            }
        }

        this.geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
    }
    
    // create a uv grid
    createUVGrid(nw,nz)
    {
        var n = nw * nz;
        var uvs = new Float32Array(n*2);

        var ix = 0;
        var rx,rz;
        for(var j =0; j< nz;++j)
        {
            rz = j / (nz - 1);

            for(var i =0; i< nw;++i)
            {
                rx = i / (nw - 1);

                //uv
                uvs[2*ix +0] = rx;
                uvs[2*ix +1] = rz;
                ix++;
            }
        }
        var uvsAtt = new THREE.BufferAttribute(uvs, 2);
        this.geometry.addAttribute( 'uv', uvsAtt );
    }
    
    print()
    {
        console.log("hello");
    }

}