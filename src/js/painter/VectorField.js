/**
 * noise field
 */
export class VectorField
{
    constructor()
    {

    }

    getVector(x,y)
    {
        var value = noise.perlin2(x / 200, y / 200);
        value *= Math.PI*2.0;
        var v = {'x': Math.cos(value),'y': Math.sin(value)};
        return v;
    }
}