//fragShader.glsl
precision highp float;
uniform sampler2D map;

varying vec2 vUv;
//	varying float vTime;
varying float vCurveR;
varying vec4 vCol;

void main() {
    float r = vUv.y * 1.0 * vCurveR;
	r = 1.0;
	//r = 0.5;
	gl_FragColor =  vec4(vCol.rgb,vCol.a); // todo  test this
}
