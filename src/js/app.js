import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import fragment1 from "./shader/fragment1.glsl";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

 import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Aberration } from './customPass.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import model from './walkinghall.glb'
import texture from './walkinghall.png'
import gsap from "gsap";
export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x21213, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    
     this.dracoLoader = new DRACOLoader();
     this.dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path
     this.loader = new GLTFLoader();
     this.loader.setDRACOLoader(this.dracoLoader);
    //  this.start = new THREE.Vector3(54.37284229789939, -31.974990378646833, 409.91434025797344)
 
    
//      const helper = new THREE.CameraHelper( this.camera );

// this.scene.add( helper );
// console.log(helper)
    // this.camera.position.copy(this.start);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.set(15, 0, 150);
    this.time = 0;

    this.isPlaying = true;
   
    this.loader.load(model,(gltf) => {
   
      this.meshes = gltf.scene.children[0];
      this.settings();
      this.addObjects();
      this.initPost();
      this.addModel();
 
      this.resize();
      this.render();
      // this.lights();
      this.setupResize(); 
      
      // 0
    })
    // tl.to( , {
    //   duration: 10,
    
    // })
    // console.log(this.camera)
    // gsap.set(this.bloomPass, {
    //   threshold: 0.3,
    //   strength: 0.3,
    //   radius: 0.85
    // })
    // var tl = gsap.timeline({
    //   repeat: -1,
    //   yoyo:true,
    // });
    // tl.from(this.camera.position, {
    //   z: 350,
    //   duration: 10,
    //   ease: "power2.Inout"
     
    // },"start")
    // tl.to(this.camera.position, {
    //   z: -80,
    //   duration: 10,
    //   ease: "power2.Inout"
     
    // },"start")
    // tl.to(this.camera.rotation, {
    //   y: 10,
      
    //   duration: 30,
    //   ease: "power2.In"
    // },"start+=5.5")
    // tl.to(this.camera.position, {
    //   y: 55,
    //   x: 50,
    //   duration: 30,
    //   ease: "power2.In"
    // },"start+=5.5")
    
  
    // tl.to(this.camera.position, {
    //   z: 150,
    //   y: 150,
    //   duration: 30,
    //   ease: "power2.Inout"
    // },"start+=15")
    // tl.to(this.camera.position, {
    //   z: 75,
    //   duration: 30,
    //   ease: "power2.In"
    // },"start+=25")
  }
 
  initPost() {
    
    this.renderScene = new RenderPass( this.scene, this.camera );
    this.bloomPass = new UnrealBloomPass( new THREE.Vector2(
      window.innerWidth, window.innerHeight ), 0, 0, 0 );
      // console.log(this.bloomPass)
    this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( this.renderScene );
 
    this.effect1 = new ShaderPass(Aberration);
    this.composer.addPass( this.bloomPass );

    this.composer.addPass(this.effect1);
    

  }
  addModel() {
    
   
      this.particles = [];
     
      this.meshes.children.forEach(m=>{
        // m.material = new THREE.MeshNormalMaterial()
        let geo = m.geometry;
        // console.log(geo,'geo');
        let len = m.geometry.attributes.position.array.length/3
        let randoms = new Float32Array(len) 
        for (var i = 0; i < len; i++) {
          randoms.set([Math.random()],i);
        }
        geo.setAttribute( 'randoms', new THREE.BufferAttribute( randoms, 2 ) );
        let particles =  new THREE.Points( geo, this.material);
        particles.rotation.y = -0.7;
        // console.log(m.material,'material was', this.material);
        // let particles =  new THREE.Mesh( geo, m.material);
        this.particles.push(particles)
        this.scene.add(particles);
      })
      
      
   
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
      bloomThreshold: 0,
      bloomStrength: 0.52,
      bloomRadius: 0.74,
    

    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "bloomThreshold", 0, 10, 0.01);
    this.gui.add(this.settings, "bloomStrength", 0, 10, 0.01);
    this.gui.add(this.settings, "bloomRadius", 0, 10, 0.01);
  }
  lights(){
    this.lightAmbient = new THREE.AmbientLight(0xffffff, 1); // soft white light
    this.scene.add(this.lightAmbient);
    this.dir1 = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add( this.dir1 );
    this.dir1.position.set(-1, 0.5, 0);

    this.dir2 = new THREE.DirectionalLight( 0xffffff, 1 );
    this.scene.add( this.dir2 );
    this.dir2.position.set(0,1,0)

    this.dir3 = new THREE.DirectionalLight( 0xffffff, 1 );
    this.scene.add( this.dir3 );
    this.dir3.position.set(0.5,-0.5,0)

    this.dir4 = new THREE.DirectionalLight( 0xffffff, 1 );
    this.scene.add( this.dir4 );
    this.dir4.position.set(0,0,1)

    this.dir5 = new THREE.DirectionalLight( 0xffffff, 1 );
    this.scene.add( this.dir5 );
    this.dir5.position.set(0.5,0.5,-0.25)
  }
  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    let txt = new THREE.TextureLoader().load(texture)
    txt.flipY = false;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        map: { type: "t", value: txt },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        }
      },
      // wireframe: true,
      // transparent: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
 
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;

    if(this.bloomPass) {
      this.bloomPass.threshold = this.settings.bloomThreshold;
      this.bloomPass.strength = this.settings.bloomStrength;
      this.bloomPass.radius = this.settings.bloomRadius;
    }
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container")
});
