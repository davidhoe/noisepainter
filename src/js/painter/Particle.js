import {StrokePath} from './StrokePath'
import * as THREE from 'three'
import {MathUtils} from '../util/MathUtils'
export class Particle
{
    constructor(field)
    {
        this.field = field;
        this.p = {'x':0, 'y':0};
        this.v = {'x':0, 'y':0};
        this.direction = 1;
        this.noiseOffsetX = 0;
        this.noiseOffsetY = 0;
    }

    init(x,y, thickness = 5, direction = 1)
    {
     //   this.noiseOffsetY  = noiseOffsetY ;
      //  this.noiseOffsetX  = noiseOffsetX ;
        this.direction = direction;
        this.p.x = x;
        this.p.y = y;
        this.strokePath = new StrokePath();
        this.strokePath.addPoint(new THREE.Vector3(this.p.x,this.p.y),thickness);

    }

    update(thickness = 5)
    {
        var fv = this.field.getVector(this.p.x/ 2000 + this.noiseOffsetX,this.p.y/ 2000  + this.noiseOffsetY);
        this.v.x = fv.x;
        this.v.y = fv.y;

        var speed = 6 + MathUtils.GetSeededRandomFloat(0,0) ;
        speed *= 0.3;
        this.p.x += this.v.x*speed*this.direction;
        this.p.y += this.v.y*speed*this.direction ;
        this.strokePath.addPoint(new THREE.Vector3(this.p.x,this.p.y), thickness);
    }
}