0
//Landon Miller
//UID 804543216
//CS 174A
//assignment3.js

import {defs, tiny} from './examples/common.js';
import {Body,Simulation} from "./examples/collisions-demo.js"
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


class Pinball extends Body
{
    constructor(world,shape,material)
    {
        super(world.shapes.sphere,world.materials.pinball,vec3(1,1,1))

   
       
       
        this.alive=true;
        this.world=world;
        this.launched=false;

        // this.trapped
        let model_transform=Mat4.identity().times(Mat4.translation(31,4,2.6)).times(Mat4.scale(.6,.6,.6))
        //collision_adjust();
        this.emplace(model_transform,vec3(0,0,0),0)

    }

    doSomething(dt)
    {
        if (!this.launched && this.world.launch_ball) 
        {
            this.get_launched(this.world.launch_speed);
        }
        this.apply_gravity(dt);
        //collision_adjust();
        
        
        let detected_body= this.world.collide_check(this);
        if (detected_body!=null) 
        {
       // if (this.world.camera_focus==this)
       //     this.world.camera_focus=null;
        return;
        }
        if (this.center[1]>45.4)
        {
            this.linear_velocity[1]*=-1;
        }
        if (this.center[0]< 2.6|| this.center[0]> 31.4)
        {
            this.linear_velocity[0]*=-1;
        }
        if (this.center[1]<3.9)
        {
            this.alive=false;
            if (this.world.camera_focus==this)
            this.world.camera_focus=null;
            return;
        }
        
       






    }
  
    get_launched(speed)
    {
        this.linear_velocity=vec3(-1*speed,3*speed,0)
        this.launched=true;
        this.world.launch_ball=false;
        this.world.ball_in_launcher=false;
        this.world.balls_remaining-=1;
        this.world.camera_focus=this;
    }


    apply_gravity(dt)
    {
        //current_time=program_state.animation_time / 1000;
        let gravity=6;
        if (this.launched)
        {
        this.linear_velocity[1]-=gravity*dt;
        }
        
    }

    //  check_for_death(){}

}

class Obstacle extends Body{
    constructor(model_transform,springiness,shape,material)//,light_effect,sound_effect)
    {
        super(shape,material,vec3(1,1,1))
        this.springiness=springiness;
        this.emplace(model_transform,vec3(0,0,0),0)
        
    
    }

    doSomething(dt)
    {
        
    }
  }


export class PinballWorld extends Simulation {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.ball_focus=false;
        this.camera_focus=null;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {

            sphere: new defs.Subdivision_Sphere(4),
            //Smooth planet where triangles are subdivided 4 times (used in planets 3 and 4)
            cube: new defs.Cube(),
            circle: new defs.Regular_2D_Polygon(1, 15),
            cylinder: new defs.Capped_Cylinder(10,10,[0,150])
        

        };
       this.time_scale/=370;
        // *** Materials
        this.materials = {
            pinball: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: 1, specularity:1, color: hex_color("#ffffff")}),

        }

        this.balls_remaining=0;
        this.game_started=false;
        this.launch_speed=0;
        this.ball_in_launcher=false;
        this.launch_ball=false;
        
        
       
        this.initial_camera_location = Mat4.look_at(vec3(15, 20, 90), vec3(15, 20, 0), vec3(0, 1, 1));

         let model_transform = Mat4.identity();

        const machine_color= color(.5,0,.5,1);

         //program_state.lights = [new Light(sun_light_position, color(1,1,1,1), 10**3)];
        
       
        

        let left_transform=model_transform.times(Mat4.translation(1,24,4)).times(Mat4.scale(1,24,4));
        let right_transform=model_transform.times(Mat4.translation(33,24,4)).times(Mat4.scale(1,24,4));
        let bottom_transform=model_transform.times(Mat4.translation(17,1,4)).times(Mat4.scale(16,1,4));
        let top_transform=model_transform.times(Mat4.translation(17,47,4)).times(Mat4.scale(16,1,4));

       
        this.bodies=[new Obstacle(left_transform,0,this.shapes.cube, this.materials.pinball.override({color: machine_color})),
        new Obstacle(right_transform,0,this.shapes.cube, this.materials.pinball.override({color: machine_color})),
        new Obstacle(bottom_transform,0,this.shapes.cube, this.materials.pinball.override({color: machine_color})),
        new Obstacle(top_transform,0,this.shapes.cube, this.materials.pinball.override({color: machine_color}))
        ]

        var i;
        var j;
        for (i=5;i<40;i+=2)
        {
            for (j=5;j<25;j+=2)
            {
                if (i%4==j%4) continue;
                let obj_transform=Mat4.identity().times(Mat4.translation(j,i,4)).times(Mat4.scale(.2,.2,3));
                this.bodies.push(new Obstacle(obj_transform,0,this.shapes.cylinder, this.materials.pinball))
            }
        }

    }




    
    collide_check(ball)
    {
        if (ball.launched==false) return null;
        var i;
       
         for  (i=0; i<this.bodies.length;i++)
        {
            ball.inverse=Mat4.inverse(ball.drawn_location)
            if(this.bodies[i].center[1]!=4&&ball.check_if_colliding(this.bodies[i], {intersect_test: Body.intersect_sphere, points: new defs.Subdivision_Sphere(1), leeway: .1}))
            return this.bodies[i];
          

        }
        return null;
    }
    

    start_game()
    {
        if (this.game_started) return;
        this.game_started=true;
        this.balls_remaining=5;
    }
    make_control_panel(context,program_state) {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Start Game", ["Control", "0"], () => this.start_game())
        this.new_line();
        this.key_triggered_button("Pull spring back more", ["Control", "1"], () => this.launch_speed=Math.min(10,this.launch_speed+1));
        this.key_triggered_button("Pull spring back less", ["Control", "2"], () => this.launch_speed=Math.max(0,this.launch_speed-1));
        this.new_line();
        this.key_triggered_button("Launch Pinball", ["Control", "3"], () => {if (this.ball_in_launcher) this.launch_ball=true; });
        this.key_triggered_button("Switch camera", ["Control", "4"], () => this.ball_focus=!this.ball_focus);
        //this.new_line();

    }



    

    display(context,program_state) {

        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

      
        
        const sun_light_position = vec4(0,0,0,1);

const machine_color= color(.5,0,.5,1);
        program_state.lights = [new Light(sun_light_position, color(1,1,1,1), 10**3)];
        //const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform=Mat4.identity();
        let below_transform=model_transform.times(Mat4.translation(16,24,1)).times(Mat4.scale(16,24,1))
        this.shapes.cube.draw(context, program_state, below_transform, this.materials.pinball.override({color: machine_color}));

        if (this.ball_focus && this.camera_focus!=null) program_state.set_camera(Mat4.inverse(this.camera_focus.drawn_location.times(Mat4.translation(0,0,20))));
       else program_state.set_camera(this.initial_camera_location);
       super.display(context,program_state);

       
        
    }
    update_state(dt)
    {
        
     

        var i;
        for  (i=0; i<this.bodies.length;i++)
        {
         
            // if (PinballArray[i]!=null)
            this.bodies[i].doSomething(dt);
            // if (PinballArray[i].isAlive()==false)
            // PinballArray[i]=null;

        }
      
        if (this.game_started&&this.ball_in_launcher==false&&this.balls_remaining!=0) 
        {
            
        this.bodies.push(new Pinball(this,this.shapes.sphere,this.materials.pinball));
        this.ball_in_launcher=true;

        }
        for  (i=0; i<this.bodies.length;i++)
        {
            if (this.bodies[i].alive==false)
            // if (PinballArray[i]!=null)
            this.bodies.splice(i,1);
            // if (PinballArray[i].isAlive()==false)
            // PinballArray[i]=null;

        }
        
        //We set the light at the o

    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec4 Vertex_color; //fragment shader interpolate colors
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                vec3 N = normalize( mat3( model_transform ) * normal / squared_scale);
                vec3 vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vec4 color = vec4(shape_color.xyz * ambient,shape_color.w);
                color.xyz += phong_model_lights(normalize(N),vertex_worldspace);
                Vertex_color=color; //color calculation occurs in vertex shader
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                
                gl_FragColor = Vertex_color;
                
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        //comment about graphics card
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center; //variables that are shared between vertex shading and fragment shading
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
          
          center=model_transform * vec4(0.0,0.0,0.0,1.0);
          point_position= model_transform*vec4(position,1.0);
          //Global position of a vertex is simply relative position left-multiplied by basis of object
          //Center is just origin left-multiplied by basis of object
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          float ambient=sin(20.0*length(point_position.xyz-center.xyz));
          //Make ambience of the orange color dependent on how far the point on the torus is from the center of the torus
          // , which is the same as the center of the planet. We use sin to create oscillation for the ring effect, and multiply
          //by a large frequency to get a lot of rings
          gl_FragColor=vec4(1.0,.6,.3,1.0)*ambient; //Want to use same color as third planet times the ambience
          //we calculated above
          //model_transform is the planet basis
          
        }`;
    }
}
