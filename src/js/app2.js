import * as THREE from "three";
import "regenerator-runtime/runtime.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertexParticles.glsl";
import fragment1 from "./shader/fragment1.glsl";
import vertex1 from "./shader/vertexParticles1.glsl";
import * as dat from "dat.gui";
import model from '../model/new.glb'
import texture from '../model/last-processed0.png'
// import datGuiImage from 'dat.gui.image';
// datGuiImage(dat);
let loader = new GLTFLoader();
function modelLoader(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, data=> resolve(data), null, reject);
  });
}

import { TimelineMax } from "gsap";
let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
  constructor(selector) {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container = document.getElementById("container");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );


    this.loader = new GLTFLoader();

    this.start = new THREE.Vector3(54.37284229789939, -31.974990378646833, 409.91434025797344)
    this.start = new THREE.Vector3( -12.298314992877023,  -30.29078007484738,  412.8761575922511)
    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.copy(this.start);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.paused = false;
    
    



    this.setupResize();
    
    this.addObjects();
    this.addModel()
    this.addFly()
    this.resize();
    this.render();
    this.lights();
    this.settings();
  }

  async addModel(){
    this.model = await modelLoader(model)
    let meshes = this.model.scene.children[0];
    this.particles = [];
    let m0 = meshes.children[0];
    meshes.children.forEach(m=>{
      // m.material = new THREE.MeshNormalMaterial()
      let geo = m.geometry;
      console.log(geo,'geo');
      let len = m.geometry.attributes.position.array.length/3
      let randoms = new Float32Array(len)
      for (var i = 0; i < len; i++) {
        randoms.set([Math.random()],i);
      }
      geo.setAttribute( 'randoms', new THREE.BufferAttribute( randoms, 1 ) );
      let particles =  new THREE.Points( geo, this.material);
      particles.rotation.y = -0.7;
      // console.log(m.material,'material was', this.material);
      // let particles =  new THREE.Mesh( geo, m.material);
      this.particles.push(particles)
      this.scene.add(particles);
    })
    
    
  }

  addFly(){
    let num = 10000;
    let geometry = new THREE.BufferGeometry();
    let positions = new Float32Array(num*3);
    let offsets = new Float32Array(num);
    let size = new Float32Array(num);

    for (var i = 0; i < num; i++) {
      positions.set([(Math.random()-0.5)*300,(Math.random()-0.5)*100,(Math.random()-0.5)*1000],3*i);
      offsets.set([Math.random()],i);
      size.set([Math.random()],i);
    }

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'offset', new THREE.BufferAttribute( offsets, 1 ) );
    geometry.setAttribute( 'size', new THREE.BufferAttribute( size, 1 ) );

    let points = new THREE.Points(geometry, this.material1);
    this.scene.add(points);
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 50, 0.01);
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
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      // blending: THREE.AdditiveBlending
    });

    this.material1 = new THREE.ShaderMaterial({
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
      transparent: true,
      vertexShader: vertex1,
      fragmentShader: fragment1,
      depthTest: false,
      depthWrite: false,
      // blending: THREE.AdditiveBlending
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.plane);
  }

  tabEvents(){
    document.addEventListener("visibilitychange", ()=>{
      if (document.hidden){
        this.stop()
      } else {
        this.play();
      }
    });
  }

  stop() {
    this.paused = true;
  }

  play() {
    this.paused = false;
  }

  render() {
    let pos = this.start.clone()
    pos.z -= this.settings.progress*10.
    pos.x = this.start.x + 20*Math.sin(this.settings.progress/9)
    console.log(pos);
    // this.camera.position.copy(pos);
    if (this.paused) return;
    this.time += 0.05;
    console.log(this.camera.position);
    this.material.uniforms.time.value = this.time;
    this.material1.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch("container");
