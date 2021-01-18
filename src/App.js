import { useState, useRef, useEffect } from 'react';

// This provides you a GPU enhanced canvas coming originally from Three.js
import { Canvas, useFrame, extend, useThree } from 'react-three-fiber';
  
/*
  Since orbitControls is not wired to threejs at all (hence why we pull it from examples), we need to wire it ourselves
  to the game loop
*/
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/*
  GLTFLoader is used to load a gltf file into the scene. Note that it is an async function hence we need it to be placed
  inside an useEffect
*/
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/*
  react-spring is cross-platform, by doing something like react-spring/universal, you can use it in all 
  react type, for instance, react PDF, react hardware, react native, etc.

  react-spring can be taught to animate outside of react, what this mean is the component renders once and 
  the animation happens in its own loop which is more performant. Because React needs to reconcile after each updates, 
  it becomes expensive when the animation happens otherwise standard animations are good.

  a stands for animated
*/
import { useSpring, a } from 'react-spring/three';

import * as THREE from 'three';


/* 
  General Notes:

  Camera: 

  By default it's a perspective camera from about 5 units from the object. There's also an Orthographic camera
  at your disposal, which better serves a 2d context

  Controls:

  Help steer the camera. Orbit controls has a top and a bottom and that's the limit.

  Shadows:

  In Threejs you have to tell the object to receive shadows. By default, this is set to false. In order to do so,
  you must provide `castShadow` to any element that can reflect/stop lights. And receiveShadow to those that can
  project a shadow - see box element for examples

  Events:

  The events are modelled after the DOM, hence we can bind them through onClick, onPointerOver, etc
*/

/*
  Example of Canvas Displaying a Square Geometry with Basic Material

  <Canvas>
    -- Explanation:
      A mesh is an object that contains vertices. Vertices are points connected to a surface for instance,
      a Polygon such as a triangle. For meshes, we always pass in a geometry.
      
      Mesh(es), boxBufferGeometry are treated as native elements as threejs includes them. In the background
      it will translate them properly and we wouldn't have to worry about this.
      
      For API reference, refer to: https://threejs.org/docs/#api/en/objects/Mesh
    --
    <mesh>
      -- Explanation:
        attach="geometry" is a declarative way to instantiate this geometry. The standard instantiation
        would look like: new THREE.BoxBufferGeometry([...]). As it is a constructor type, we use args to
        pass in arguments. Using the documentation, we can look at the type of arguments it needs
        
        Reference: https://threejs.org/docs/#api/en/geometries/BoxGeometry
      --
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshBasicMaterial attach="material" color="red" />
    </mesh>

      -- Alternative:
    
      <mesh geometry={new THREE.BoxBufferGeometry([1,1,1])}></mesh>

      A big cons of the approach above is that it will recreate the geometry on every render pass. In addition,
      we would not want to memoize this as we want to follow the declarative approach.

  </Canvas>
*/

/* 
  Example Component with Rotating Box (Programatically)

  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  // react-spring can turn static values into values that animates by themselves
  const props = useSpring({
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    color: hover ? 'red': 'gray',
  });

  const ref = useRef();

  -- Explanation:
    Anything in the useFrame updates every frame. The goal is to mutate the mesh to rotate.
    
    Animations are considered normal within react but not for three.js. Three.js is more for the context of
    games, hence why it follows the concept of a game loop wich means it contains it's own time stamp and everything
    else that is "normal" in react.
  --

  useFrame(() => {
    ref.current.rotation.y += 0.01;
  });

  -- Explanation:
    By putting an a before anything we want to animate, this applies the animation.
    import { a } from 'react-spring' is technically animated
  --

  return (
    <>
      -- Explanation:
        mesh contains additional properties which are: position, rotation and scale
      --
      <a.mesh
        ref={ref}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => setActive(!active)}
        scale={props.scale}
      >
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <a.meshBasicMaterial attach="material" color={props.color} />
      </a.mesh>
    </>
  )
*/

/* 
  By extending orbit controls, it allows react-three-fiber to treat orbitControls as a native element.
*/
extend({ OrbitControls });

/*
  orbitControls allows the user to move the camera around the object.

  reference: https://threejs.org/docs/#examples/en/controls/OrbitControls
*/
const Controls = () => {
  // Contains all the threejs internals, it detect changes and it will automatically help re-render the component 
  const { camera, gl } = useThree();

  // Store the reference of the orbitControl element
  const ref = useRef();

  /* 
    If we don't update the camera, it will not move. By using useFrame, we are moving the camera on every frame
  */
  useFrame(() => {
    ref.current.update();
  });

  /*
    Add autoRotate to allow auto rotation. The minPolarAngle and maxPolarAngle helps clamping the camera's movements.
    What this means we will limit the controls to happen one way,for instance, you can only rotate on the x axis
  */
  return (
    <orbitControls
      autoRotate
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 3}
      ref={ref}
      args={[camera, gl.domElement]}
    />
  );
}

/*
  Helps set the ground, mainly to provide some sort of distance holder. By setting receiveShadow, it will
  project object's shadows
*/
const Plane = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow >
    <planeBufferGeometry attach="geometry" args={[100, 100]}/>
    <meshPhysicalMaterial attach="material" color="#f4f4f4" />
  </mesh>
)

/* Since we composed it into a component, we can have full control of the mount and unmount state. */
const Box = () => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const props = useSpring({
    scale: active ? [1.5, 1.5, 1.5] : [1, 1, 1],
    color: hover ? 'red': 'gray',
  });

  return (
    <>
      {/*
        mesh, boxBufferGeometry are treated as native elements as threejs includes them. In the background
        it will translate them properly and we wouldn't have to worry about this.
      */}
      <a.mesh
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={() => setActive(!active)}
        scale={props.scale}
        castShadow
      >
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        {/*
          By changing it into a physical material, we require lighting as it's a "physical" entity 
          within the given space
        */}
        <a.meshPhysicalMaterial attach="material" color={props.color} />
      </a.mesh>
    </>
  )
}

const ShibaGLTF = () => {
  const [model, setModel] = useState()

  useEffect(() => {
    new GLTFLoader().load('/scene.gltf', setModel);
  }, []);

  /* 
    Imperative threejs object, a real scene with meshes and everything else. Normally the objects are declared but if we 
    used something created - externally then we would use primitive type to load it
  */
  return model ? <primitive object={model.scene} /> : null
}

const PlaneGLTF = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow >
    <planeBufferGeometry attach="geometry" args={[100, 100]}/>
    <meshPhysicalMaterial attach="material" color="#f4f4f4" />
  </mesh>
);

const App = () => {
  return (
    <>
      <h1 style={{marginTop: '2rem'}}> Shiba Inu </h1>
      {/* GPU optimized canvas, defaults to 60 FPS and runs the gameloop mode as well */}
      {/* By adding the camera property to the Canvas we can zoom in to the main scene */}
      <Canvas camera={{ position: [0, 0, 5] }} onCreated={({ gl }) => {
        // It's important to enable shadows, otherwise it will not cast/receive them
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}>
        <fog attach="fog" args={['#666', 10, 25]}/>
        {/* a light that gives the object full visibility, similar to a real life ambient light */}
        <ambientLight intensity={0.5}/>
        {/* a light that points towards the object, penumbra helps removes the rough edges */}
        <spotLight position={[0, 5, 10]} penumbra={1} castShadow />
        <Controls />
        <group>
          <PlaneGLTF />
          <ShibaGLTF />
        </group>
        {/* Comment the group above and uncomment the group below to see the box in the scene */}
        {/* <group>
          <Plane />
          <Box />
        </group> */}
      </Canvas>
    </>
  );
}

export default App;
