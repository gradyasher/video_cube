import * as THREE from "three";

export const vhsShader = {
  uniforms: {
    iTime: { value: 0.0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iChannel0: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform sampler2D iChannel0;

    float vertJerkOpt = 10.0;
    float vertMovementOpt = 1.0;
    float bottomStaticOpt = 3.0;
    float scalinesOpt = 2.0;
    float rgbOffsetOpt = 1.0;
    float horzFuzzOpt = 10.0;

    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ; m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fnoise(vec2 v) {
      return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453) * 0.55;
    }

    float staticV(vec2 uv) {
      float time = mod(iTime + 1.0, 5.0);
      float staticHeight = fnoise(vec2(9.0,time*1.2+3.0))*0.3+4.;
      float staticAmount = fnoise(vec2(1.0,time*1.2-6.0))*0.1+0.3;
      float staticStrength = fnoise(vec2(-9.75,time*0.6-3.0))*2.0+2.0;
      return (1.0-step(fnoise(vec2(5.0*pow(time,2.0)+pow(uv.x*7.0,1.2),pow((mod(time,100.0)+100.0)*uv.y*0.3+3.0,staticHeight))),staticAmount))*staticStrength;
    }

    void main() {
      float time = mod(iTime + 1.0, 5.0);
      vec2 uv = gl_FragCoord.xy / iResolution.xy;
      float fuzzOffset = fnoise(vec2(time*15.0,uv.y*80.0))*0.003;
      float largeFuzzOffset = fnoise(vec2(time*1.0,uv.y*25.0))*0.004;
      float vertMovementOn = (1.0-step(snoise(vec2(time*0.2,8.0)),0.4))*vertMovementOpt;
      float vertJerk = (1.0-step(fnoise(vec2(time*1.5,5.0)),0.6))*vertJerkOpt;
      float vertJerk2 = (1.0-step(fnoise(vec2(time*5.5,5.0)),0.2))*vertJerkOpt;
      float yOffset = abs(sin(time)*4.0)*vertMovementOn+vertJerk*vertJerk2*0.3;
      float y = mod(uv.y+yOffset,1.0);
      float xOffset = (fuzzOffset + largeFuzzOffset) * horzFuzzOpt;
      float staticVal = 0.0;
      for (float yy = -1.0; yy <= 1.0; yy += 1.0) {
        float maxDist = 5.0/200.0;
        float dist = yy/200.0;
        staticVal += staticV(vec2(uv.x,uv.y+dist))*(maxDist-abs(dist))*1.5;
      }
      staticVal *= bottomStaticOpt;
      float red   = texture2D(iChannel0, vec2(uv.x + xOffset -0.01*rgbOffsetOpt,y)).r + staticVal;
      float green = texture2D(iChannel0, vec2(uv.x + xOffset, y)).g + staticVal;
      float blue  = texture2D(iChannel0, vec2(uv.x + xOffset +0.01*rgbOffsetOpt,y)).b + staticVal;
      vec3 color = vec3(red,green,blue);
      float scanline = sin(uv.y*800.0)*0.04*scalinesOpt;
      color -= scanline;
      vec3 greyTint = vec3(0.5); // or try vec3(0.6), vec3(0.4) for variation
      color = mix(color, greyTint, 0.4); // 0.0 = original color, 1.0 = fully gray
      gl_FragColor = vec4(color, 0.17);
    }
  `
};
