import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { UnrealBloomPass } from "three-stdlib";
import { Plane, useFBO } from "@react-three/drei";
import { shaderMaterial } from "@react-three/drei";

extend({ UnrealBloomPass });

const videoSources = [
  "/videos/clip 1.mp4",
  "/videos/clip 2.mp4",
  "/videos/clip 3.mp4",
  "/videos/clip 4.mp4",
  "/videos/clip 5.mp4",
  "/videos/clip 6.mp4",
  "/videos/clip 7.mp4",
  "/videos/clip 8.mp4",
];

const hostedVideoLinks = [
  "https://www.youtube.com/watch?v=njJAC-EAQdk",
  "https://www.youtube.com/watch?v=ldn5A29IvNU",
  "https://www.youtube.com/watch?v=F-aOtychLss",
  "https://www.youtube.com/watch?v=aDz1Vf0Wd7w",
  "https://www.youtube.com/watch?v=Y0tjih9vlNY",
  "https://www.youtube.com/watch?v=dK1v9P3xVnM",
  "https://www.youtube.com/watch?v=-_0J4IbJqvk",
  "https://www.youtube.com/watch?v=GeSePALnQKQ",
];

const VolumetricMaterial = shaderMaterial(
  { tDiffuse: null, lightPosition: new THREE.Vector2(0.5, 0.5) },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D tDiffuse;
    uniform vec2 lightPosition;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - lightPosition;
      vec4 color = vec4(0.0);
      float decay = .7;
      float weight = 0.5;
      float exposure = 1.5;
      vec2 delta = dir * 1.0 / 60.0;

      for(int i = 0; i < 60; i++) {
        vec2 coord = vUv - delta * float(i);
        color += texture2D(tDiffuse, coord) * weight;
        weight *= decay;
      }
      color *= exposure;
      gl_FragColor = color;
    }
  `
);

extend({ VolumetricMaterial });

function VolumetricScattering() {
  const material = useRef();
  const fbo = useFBO();
  const screen = useRef();
  const { gl, scene, camera } = useThree();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  useFrame(() => {
    if (!initialized.current || !ready) {
      initialized.current = true;
      return;
    }

    if (screen.current) screen.current.visible = false;

    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (screen.current) screen.current.visible = true;
    if (material.current) material.current.tDiffuse = fbo.texture;
  }, 1);

  if (!ready) return null;

  return (
    <Plane args={[2, 2]} position={[0, 0, 0]} renderOrder={999} ref={screen}>
      <volumetricMaterial ref={material} lightPosition={new THREE.Vector2(0.5, 0.5)} />
    </Plane>
  );
}

function VHSShaderMaterial() {
  const shaderRef = useRef();

  const shader = useMemo(() => ({
    uniforms: {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      iChannel0: { value: null }
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
        gl_FragColor = vec4(color, 0.5);
      }
    `
  }), []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.iTime.value = clock.getElapsedTime();
    }
  });

  return (
    <Plane args={[15, 10]} position={[0, 0, 0.01]} renderOrder={Infinity}>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[shader]}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </Plane>
  );
}


function VideoCube({ onFaceClick, setFogColor, fogColor, fogColorTarget }) {
  const mesh = useRef();
  const { gl, camera } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  const videoTextures = useMemo(() => {
    return videoSources.map((src, i) => {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("playsinline", "true");
      video.load();
      video.addEventListener("canplay", () => {
        video.play().catch((e) => console.warn("Autoplay failed", e));
      });
      return new THREE.VideoTexture(video);
    });
  }, []);

  const materials = useMemo(() =>
    videoTextures.map(
      (texture) =>
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    ), [videoTextures]);

  useEffect(() => {
    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh.current, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face.materialIndex;
        onFaceClick(faceIndex);
      }
    };
    window.addEventListener("pointerdown", handleClick);
    return () => window.removeEventListener("pointerdown", handleClick);
  }, [gl, camera, raycaster, mouse, onFaceClick]);

  useFrame(() => {
    mesh.current.rotation.y += 0.002;
    mesh.current.rotation.x += 0.001;
  });

  return (
    <mesh ref={mesh} scale={[2.5, 2.5, 2.5]}>
      <boxGeometry args={[1, 1, 1]} />
      {materials.map((material, index) => (
        <primitive
          key={index}
          attach={`material-${index}`}
          object={material}
        />
      ))}
    </mesh>
  );
}

function BackgroundVideo() {
  const bgVids = [
    "/videos/bg_videos/bg 1.mp4",
    "/videos/bg_videos/bg 2.mp4",
    "/videos/bg_videos/bg 3.mp4",
    "/videos/bg_videos/bg 4.mp4",
    "/videos/bg_videos/bg 5.mp4",
    "/videos/bg_videos/bg 6.mp4",
    "/videos/bg_videos/bg 7.mp4",
    "/videos/bg_videos/bg 8.mp4",
    "/videos/bg_videos/bg 9.mp4",
    "/videos/bg_videos/bg 10.mp4",
  ];

  const selectedSrc = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * bgVids.length);
    return bgVids[randomIndex];
  }, []);

  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = selectedSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");

    video.addEventListener("canplay", () => {
      video.play().catch((e) => console.warn("Autoplay failed", e));
      const tex = new THREE.VideoTexture(video);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.format = THREE.RGBFormat;
      tex.needsUpdate = true;
      setTexture(tex);
    });

    video.load();
  }, [selectedSrc]);

  if (!texture) return null;

  return (
    <Plane args={[20, 12]} position={[0, 0, -1]} renderOrder={-1}>
      <shaderMaterial
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D map;
          uniform float warpAmount;
          varying vec2 vUv;

          void main() {
            vec2 centered = vUv - 0.5;
            float dist = length(centered);
            vec2 warp = centered * pow(1.0 - dist, warpAmount);
            vec2 uv = warp + 0.5;

            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
              discard;
            }

            gl_FragColor = texture2D(map, uv);
          }
        `}
        uniforms={{
          map: { value: texture },
          warpAmount: { value: 2.5 }, // try 2.0–5.0 for more dramatic reverse effect
        }}
        transparent={false}
      />
    </Plane>
  );
}
export default function App() {
  console.log("✅ App mounted");

  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleClick = () => {
      console.log("📤 sending postMessage to parent");
      window.parent.postMessage({ type: "video-playing" }, "*");
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log("✅ YouTube Iframe API ready");
    };
  }, []);

  useEffect(() => {
    if (activeVideoIndex !== null && iframeRef.current) {
      window.parent.postMessage({ type: "video-playing" }, "*");
      console.log("📤 video-playing message sent");

      const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&enablejsapi=1`;
    }
  }, [activeVideoIndex]);

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
    window.parent.postMessage({ type: "video-closed" }, "*");
    console.log("📤 video-closed message sent");
  };


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
        <fog attach="fog" args={["#000000", 2, 12]} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <BackgroundVideo />
        <VideoCube
          onFaceClick={(index) => setActiveVideoIndex(index)}
          setFogColor={setFogColor}
          fogColor={fogColor}
          fogColorTarget={fogColorTarget}
        />
        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
        <VolumetricScattering />
        <VHSShaderMaterial />
      </Canvas>

      <iframe
        id="youtube-player"
        ref={iframeRef}
        width="80%"
        height="80%"
        style={{
          display: activeVideoIndex !== null ? "block" : "none",
          position: "absolute",
          top: "10%",
          left: "10%",
          borderRadius: "12px",
          boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
          zIndex: 1000,
        }}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="YouTube video player"
      ></iframe>

      {activeVideoIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            backgroundImage: "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
          }}
          onClick={handleOverlayClick}
        ></div>
      )}

    </div>
  );
}
