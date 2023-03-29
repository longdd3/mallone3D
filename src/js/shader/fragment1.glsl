uniform float time;
uniform float progress;
uniform sampler2D map;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;
float PI = 3.141592653589793238;
void main()
{
vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
tvec4 color = texture2D(map,vUv);
float dist = length(gl_PointCoord.xy - vec2(0.5));
float disc = smoothstep(0.49,0.3,dist);
gl_FragColor = color;
gl_FragColor = vec4(color.rgb,disc/2.);
gl_FragColor = vec4(0.791, 0.728, 0.681,disc/2.);
}