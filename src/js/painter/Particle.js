import {StrokePath} from './StrokePath'
import * as THREE from 'three'

export class Particle
{
    constructor(field)
    {
        this.field = field;
        this.p = {'x':0, 'y':0};
        this.v = {'x':0, 'y':0};
    }

    init(x,y, thickness = 5)
    {
        this.p.x = x;
        this.p.y = y;
        this.strokePath = new StrokePath();
        this.strokePath.addPoint(new THREE.Vector3(this.p.x,this.p.y),thickness);

    }

    update(thickness = 5)
    {
        var fv = this.field.getVector(this.p.x,this.p.y);
        this.v.x = fv.x;
        this.v.y = fv.y;

        var speed = 5 + Math.random()*10;
        this.p.x += this.v.x*speed;
        this.p.y += this.v.y*speed ;
        this.strokePath.addPoint(new THREE.Vector3(this.p.x,this.p.y), thickness);
    }
}