/**
 * noise field
 */
export class VectorField
{
    constructor()
    {
        this.ranOffsetY  = Math.random()*10;
        this.ranOffsetX  = Math.random()*10;

    }

    getVector(x,y) // nomralised x,y coordinates
    {
        var scale = 7;
        var value = noise.perlin2(x * scale + this.ranOffsetX , y * scale + this.ranOffsetY );
        value *= Math.PI*2.0;
        var v = {'x': Math.cos(value),'y': Math.sin(value)};
        return v;
    }
}