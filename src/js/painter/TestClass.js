import {TextFileLoader}  from './TextFileLoader'

export class TestClass
{
    constructor()
    {
        var fileLoader = TextFileLoader.Instance();
        fileLoader.loadFiles(["shaders/fragShader.glsl","shaders/vertShader.glsl"]);

    }
}