uniform vec3 topColor;
uniform vec3 bottomColor;
varying vec2 vUv;
void main()
{
  float h = vUv.y;
  gl_FragColor = vec4(mix(bottomColor, topColor, min(max(h, 0.0), 1.0)), 1.0);
}
