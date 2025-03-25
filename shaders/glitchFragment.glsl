uniform float uTime;
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  uv.x += sin(uv.y * 10.0 + uTime * 5.0) * 0.02;
  vec4 tex = texture2D(uTexture, uv);
  gl_FragColor = tex;
}
