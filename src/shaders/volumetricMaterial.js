import { ShaderMaterial, Vector2 } from "three";

export class VolumetricMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        tDiffuse: { value: null },
        lightPosition: { value: new Vector2(0.5, 0.5) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 lightPosition;
        varying vec2 vUv;

        void main() {
          vec2 dir = vUv - lightPosition;
          vec4 color = vec4(0.0);
          float decay = 0.8;
          float weight = 0.4;
          float exposure = 0.8;
          vec2 delta = dir * 1.0 / 60.0;

          for (int i = 0; i < 60; i++) {
            vec2 coord = vUv - delta * float(i);
            color += texture2D(tDiffuse, coord) * weight;
            weight *= decay;
          }

          color *= exposure;
          gl_FragColor = color;
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }
}
