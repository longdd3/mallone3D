
uniform float time;
varying vec2 vUv;
varying vec2 vUv1;
varying vec4 vPosition;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 pixels;
uniform vec2 uvRate1;
attribute float randoms;
void main() {
  vUv = uv;
   vec3 newpos = position;
    newpos.y += 0.5*sin(time + newpos.x/10.);
    vec4 mvPosition = modelViewMatrix * vec4( newpos, 1. );
     gl_PointSize = (70. + 50.*randoms) * ( 1. / - mvPosition.z );
     gl_Position = projectionMatrix * mvPosition;
     }