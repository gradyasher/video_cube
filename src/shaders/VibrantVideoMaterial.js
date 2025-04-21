import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";

const VibrantVideoMaterial = shaderMaterial(
  { uTexture: null, uSaturation: 1.4, uBrightness: 1.0, uOffsetX: 0  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
  uniform sampler2D uTexture;
  uniform float uSaturation;
  uniform float uBrightness;
  uniform float uOffsetX;
  varying vec2 vUv;

  vec3 rgb2hsv(vec3 c) {
  float cMax = max(c.r, max(c.g, c.b));
  float cMin = min(c.r, min(c.g, c.b));
  float delta = cMax - cMin;

  float h = 0.0;
  if (delta > 0.0) {
    if (cMax == c.r) {
      h = mod((c.g - c.b) / delta, 6.0);
    } else if (cMax == c.g) {
      h = (c.b - c.r) / delta + 2.0;
    } else {
      h = (c.r - c.g) / delta + 4.0;
    }
    h /= 6.0;
  }

  float s = (cMax == 0.0) ? 0.0 : delta / cMax;
  float v = cMax;
  return vec3(h, s, v);
  }

  vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1., 2./3., 1./3., 3.);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);
  }

  void main() {
  // Flip horizontally and slide
  vec2 uv = vec2(1.0 - vUv.x + uOffsetX, vUv.y);

  // Sample texture and apply vibrance controls
  vec4 texColor = texture2D(uTexture, uv);
  vec3 hsv = rgb2hsv(texColor.rgb);
  hsv.y *= uSaturation;
  hsv.z *= uBrightness;
  vec3 rgb = hsv2rgb(hsv);
  gl_FragColor = vec4(rgb, texColor.a);
  }
  `
);

extend({ VibrantVideoMaterial });

export default VibrantVideoMaterial;
