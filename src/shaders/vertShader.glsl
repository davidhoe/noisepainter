precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;
attribute vec4 orientation;

// one side of the path
attribute vec3 p0;
attribute vec3 p1;
attribute vec3 p2;
// second side of the path
attribute vec3 q0;
attribute vec3 q1;
attribute vec3 q2;
attribute vec3 colour0;
attribute vec3 colour1;

attribute float length; // length scale

varying vec3 vCol;
varying vec2 vUv;
//varying float vTime;
varying float vCurveR;

float quadraticIn(float t) {
  return t * t;
}

float quadraticOut(float t) {
  return -t * (t - 2.0);
}


void main() {

	//vTime = time;
    float startR= 0.0;
    float endR = 1.0;
    float r = mix(startR, endR, uv.y);
    //r = quadraticOut(r);
    vCurveR = r;
    vCol = mix(colour0, colour1, r);

    float r0 = (1.0-r)*(1.0-r);
    float r1 = 2.0*(1.0-r)*r;
    float r2 = r*r;

    // position on curve P
    vec3 p;
    p.x = r0*p0.x + r1*p1.x + r2*p2.x;
    p.y = r0*p0.y + r1*p1.y + r2*p2.y;
    p.z = r0*p0.z + r1*p1.z + r2*p2.z;

    // position on curve Q
    vec3 q;
    q.x = r0*q0.x + r1*q1.x + r2*q2.x;
    q.y = r0*q0.y + r1*q1.y + r2*q2.y;
    q.z = r0*q0.z + r1*q1.z + r2*q2.z;

    /*
    // gradient vector at position
    vec3 v;
    float s0 = 2.0*(1.0-r);
    float s1 = 2.0*r;
    v.x = s0*(p1.x - p0.x) + s1*(p2.x - p1.x);
    v.y = s0*(p1.y - p0.y) + s1*(p2.y - p1.y);
    v.z = s0*(p1.z - p0.z) + s1*(p2.z - p1.z);

    // calc the x and y axis
    vec3 up = vec3(0.0,0.0,1.0);
    vec3 axisx = cross(up, v);
    axisx = normalize(axisx);
    vec3 axisy = cross(axisx, v);
    axisy = normalize(axisy);
*/
    //
    //vec3 vPosition = p + axisx* position.x  + axisy *position.y ;
    vec3 vPosition;
    vPosition.x = p.x + (q.x - p.x)*position.x;
    vPosition.y = p.y + (q.y - p.y)*position.x;
    vPosition.z = 0.0;
	//vPosition.x *= length;
	//vec3 vcV = cross(orientation.xyz, vPosition);
	//vPosition = vcV * (2.0 * orientation.w) + (cross(orientation.xyz, vcV) * 2.0 + vPosition);

	vUv = uv;

    vec3 offset = vec3(0.0);
	gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );

}