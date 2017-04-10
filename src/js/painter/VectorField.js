/**
 * noise field
 */
export class VectorField
{
    constructor()
    {

    }

    getVector(x,y) // nomralised x,y coordinates
    {
        var value = noise.perlin2(x * 10, y * 10);
        value *= Math.PI*2.0;
        var v = {'x': Math.cos(value),'y': Math.sin(value)};
        return v;
    }
}