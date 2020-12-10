import {defs, tiny} from './examples/common.js';
import {Body, Simulation} from "./examples/collisions-demo.js";
import {Shape_From_File} from "./examples/obj-file-demo.js";
import {Text_Line} from "./examples/text-demo.js";
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Cube, Textured_Phong} = defs



var bounce_sound, launch_sound, lost_ball_sound, flipper_sound_left, flipper_sound_right, game_over_sound;



class Actor extends Body
{
    constructor(world,shape,material,model_transform, springiness,sound_effect,object_score_value)
    {    
         super(shape,material,vec3(1,1,1));
         this.world=world;
         this.alive=true;
         this.springiness=springiness;
        
         this.emplace(model_transform,vec3(0,0,0),0);
         this.sound_effect=sound_effect;
         this.object_score_value=object_score_value;
    }

    react_to_hit()
    {
        // playSound(sound_effect);
         this.world.score+=object_score_value;
    }

    doSomething(dt)
    {
         
    }

    die()
    {
          this.alive=false;
    }

    
}









class RoundActor extends Actor
{
    constructor(world,shape,material,model_transform,springiness,sound_effect,object_score_value,radius)
    {
        //let radius_scale=model_transform.times(Mat4.scale(radius,1,radius))
         super(world,shape,material,model_transform,springiness,sound_effect,object_score_value)
         this.radius=radius;
   
    }
 check_if_ball_inside_and_provide_vel_changes(ball,dt)
  {
      if (this==ball) return null;
      var d = this.distance(ball);

        var my_overlap = d - this.radius - ball.radius;
        var theta_travel = 0;
        var balls_overlap = false;
        var ball_range = this.radius + ball.radius + (Math.abs(ball.linear_velocity[0]) + Math.abs(ball.linear_velocity[1]))/10;

        if ( ball_range >= d) {   // vague inaccurate distance check 
           // console.log("Ball range=" + ball_range + " d=" + d + ", so we will check for collision.");
        }
        else {
           // console.log("Balls out of range.  r1+r2=" + (this.radius + ball.radius) + " d=" + d + ", so no need to check for collision.");
            return null;  // no crossing
        }

        var mtd = d-(this.radius + ball.radius);   // minimum distance we need to move to prevent overlaps
        if(mtd<0) {
          //  console.log("Objects currently overlap.")
            balls_overlap = true;
        }
        else{
          //  console.log("Objects do not overlap");
            balls_overlap = false;
        }
            
            
        // Are the objects approaching each other?
        // If we have objcts A and B, C is vector between them, V is velocity, then if C (dot) V > 0 they approach.
        // see https://www.gamasutrball.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php
        // var is_approaching =  (this.center[0] - ball.center[0]) * ball.linear_velocity[0] + (this.center[1] - ball.center[1]) * ball.linear_velocity[1];

        // Are the objects getting closer?  Note if they are overlapping it doesn't matter.
        var is_approaching =  (this.center[0] - ball.center[0]) * (ball.linear_velocity[0]-this.linear_velocity[0]) + (this.center[1] - ball.center[1]) * (ball.linear_velocity[1]-this.linear_velocity[1]);

        if (is_approaching < 0) {
   //         console.log ("Objects are getting closer, distance = " + d);
        }
        else {
   //         console.log("Objects are getting further apart, distance = " + d);
        //    return false;
        }

        var nx = this.center[0] + ((this.linear_velocity[0]/10 - ball.linear_velocity[0])/10);
        var ny = this.center[1] + ((this.linear_velocity[1]/10 - ball.linear_velocity[1])/10);
        var nd1 = this.my_distance(this.center[0], this.center[1], ball.center[0], ball.center[1]);
        var nd2 = this.my_distance(nx,ny, ball.center[0], ball.center[1]);

        //console.log("nd1=" + nd1 + " nd2 = " + nd2);

        var is_approaching_2 = false;
        if (nd1 > nd2) is_approaching_2 = true;

        is_approaching = is_approaching_2;

        if (is_approaching) {
           // console.log ("(2)Objects are getting closer, distance = " + d);
        }
        else {
           // console.log("(2)Objects are getting further apart, distance = " + d);
            if(balls_overlap) {}//console.log("However, we have already collided so that is ok.");
            else {
              //  console.log("If they have not collided yet, they probably won't.");
                return null;
            }
        }

        // Find velocities
        var v1 = 0;  //   Math.sqrt(this.linear_velocity[0] * this.linear_velocity[0] + this.linear_velocity[1] *this.linear_velocity[1]);
        var v2 = Math.sqrt(ball.linear_velocity[0] * ball.linear_velocity[0] + ball.linear_velocity[1] * ball.linear_velocity[1]);
        //console.log("Target velocity V1=" + v1 + " Projectile velocity v2=" + v2);

        //   var cvx = this.linear_velocity[0] + ball.linear_velocity[0];  // velocity of center of mass  ----- but it is not moving
        // var cvy = this.linear_velocity[1] + ball.linear_velocity[1];

        // find directions of travel as angles for both objects
        // var theta1 = get_theta(this.linear_velocity[0], this.linear_velocity[1]);   -- not moving
        //  var m1 = get_m(this.linear_velocity[0], this.linear_velocity[1]);   -- not moving
        var pi = 3.14159265;

        var theta_travel = this.get_theta(ball.linear_velocity[0], ball.linear_velocity[1]);  // was theta_2
        var m_travel = this.get_m(ball.linear_velocity[0], ball.linear_velocity[1]);
        var theta_tm = theta_travel + pi;  // this is the angle we use for the calculations
        if(theta_tm <0)theta_tm = theta_tm + 2.*pi;
        if(theta_tm>2.*pi) theta_tm = theta_tm - 2*pi;
        var theta_tp = theta_travel + (pi/2.); // perpendicular angle from center to point of nearest approach
        if(theta_tp>2*pi)theta_tp = theta_tp - 2*pi;
      //  console.log("Ball theta travel=      " + theta_travel + " Slope m_travel=" + m_travel);
      //  console.log("Ball theta travel minus=" + theta_tm + " theta perpendicular=" + theta_tp);

        // find the collision point

        var big_r = this.radius + ball.radius;

        // we need the distance from the target to the path
        // https://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html

        // 0 start 1 first point 2 second point on line

        var x0=this.center[0];
        var y0=this.center[1];
        var x1=ball.center[0];
        var y1=ball.center[1];
        var x2=ball.center[0]+ball.linear_velocity[0];
        var y2=ball.center[1]+ball.linear_velocity[1];

        // Find the distance from point to a line

        var d_line = ((x2-x1)*(y1-y0)-(x1-x0)*(y2-y1)) / Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
        if(d_line < 0)d_line = -d_line;

        // See if we have a hit (collision path)
        //console.log("Distance from circle to travel path d_line=" + d_line + "  r1= " + this.radius + " r2= " + ball.radius);   

        if(d_line <= (this.radius + ball.radius)) {
          //  console.log("Hit.  d=" + d_line + "  r1= " + this.radius + " r2= " + ball.radius);   
        }
        else {
           // console.log("Miss.  d=" + d_line + "  r1= " + this.radius + " r2= " + ball.radius);
            return null; 
        }

        // find the third side of the triangle
        var rr = this.radius + ball.radius;
        var h = Math.sqrt((rr * rr) - (d_line * d_line))
      //  console.log ("H = " + h + " distance along travel path to perpendicular from impact point.");

        //  quick solution - this works pretty well

        var theta_bouncer_to_ball = this.get_theta(ball.center[0]-this.center[0], ball.center[1]-this.center[1]);
      //  console.log("Angle from bouncer to ball at initial position is " + theta_bouncer_to_ball);
     //   console.log("Angle of travel theta_travel is " + theta_travel);
        var theta_t = theta_travel + pi;
        if (theta_t > 2*pi) theta_t = theta_t - 2*pi;
      //  console.log("Inverse angle of travel theta_t is " + theta_t);
        var theta_bounce = 2*theta_bouncer_to_ball - theta_t;
      //  console.log("Bounce angle is " + theta_bounce);
        

         
         

      //  console.log("Ball vx = " + ball.linear_velocity[0] + " vy= " + ball.linear_velocity[1]);
      //  console.log("Target vx = " + this.linear_velocity[0] + " vy= " + this.linear_velocity[1]);
        return [v2 * Math.cos(theta_bounce),v2 * Math.sin(theta_bounce)]
  }
  distance(a){ // distance to actor a  
        var d = (this.center[0] - a.center[0]) * (this.center[0] - a.center[0]) + (this.center[1] - a.center[1]) * (this.center[1] - a.center[1]);
        var e = Math.sqrt(d);
        return e;
    }
     get_m(x,y) {
    if(x !=0)return y/x;
    if(y>0) return 999.;
    return -999.;
}

my_distance (x1,y1,x2,y2) {
    var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    return d;
}
get_theta(x,y) {
    // see https://www.mathsisfun.com/polar-cartesian-coordinates.html
    let pi = 3.14159265;
    let pi2 = 2 * 3.14159265;
    if (x != 0) {
        let a = Math.atan(y/x);
        if(x>0 && y>0){ // quadrant I
           if(a>pi2)a -+ pi2;
           return a;
        }
        if(x<0){  // quadrants II and III
            a = a + pi;  
            if(a>pi2)a -+ pi2;
            return a;
        }
        a = a + 2 * pi;
        if(a>pi2)a -+ pi2;
        if(a>pi2)a -+ pi2;
        return a;
    }
    if(y>0)return pi/2;
    return 3*pi/2;
}
  draw_corners(context,program_state)
  {

  }
   
}





class PolyActor extends Actor
{


 constructor(world,shape,material,model_transform,springiness,sound_effect,object_score_value,vertices4D)
    {
    super(world,shape,material,model_transform,springiness,sound_effect,object_score_value)
    this.sides_list=[];
    let full_vertices_4D=[...vertices4D,vertices4D[0]]
    let i=0;
    while (i<full_vertices_4D.length-1)
    {
        this.sides_list.push([model_transform.times(full_vertices_4D[i]),model_transform.times(full_vertices_4D[i+1])]);
        i++;
    }
    
    }
    react_to_hit(){}
   draw_corners(context,program_state)
   {
       let i=0
       while (i<this.sides_list.length)
       {
           let corner_transform=Mat4.identity().times(Mat4.translation(this.sides_list[i][0][0],this.sides_list[i][0][1],4)).times(Mat4.scale(.2,.2,.2));
           this.world.shapes.cube.draw(context,program_state,corner_transform,this.world.materials.red_steel);
           i=i+1;
       }
   }
  
  check_if_ball_inside_and_provide_vel_changes(ball,dt)
  {
      let changed=false
      let i=0;
      let vel_to_check=[ball.linear_velocity[0],ball.linear_velocity[1]]
      while (i<this.sides_list.length)
      {
          let adjustment=this.check_if_crossed_specific_side(dt,ball.center[0],ball.center[1],
                         vel_to_check[0],vel_to_check[1],ball.radius,this.sides_list[i])


          if (adjustment!=null)
          {
            vel_to_check=adjustment
            changed=true
          } 
          
          i+=1;
      }

      
      if (changed) 
      {
          this.react_to_hit();
      return vel_to_check;
      }
       else return null
  }



  get_m(x,y) {
    if(x !=0)return y/x;
    if(y>0) return 999.;
    return -999.;
}

my_distance (x1,y1,x2,y2) {
    var d = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    return d;
}

get_theta(x,y) {
    // see https://www.mathsisfun.com/polar-cartesian-coordinates.html
    let pi = 3.14159265;
    let pi2 = 2 * 3.14159265;
    if (x != 0) {
        let a = Math.atan(y/x);
        if(x>0 && y>0){ // quadrant I
           if(a>pi2)a -+ pi2;
           return a;
        }
        if(x<0){  // quadrants II and III
            a = a + pi;  
            if(a>pi2)a -+ pi2;
            return a;
        }
        a = a + 2 * pi;
        if(a>pi2)a -+ pi2;
        if(a>pi2)a -+ pi2;
        return a;
    }
    if(y>0)return pi/2;
    return 3*pi/2;
}


point_in_box(x,y,a,b,c,d) {
    // x,y is our point
    // (a,b) and (c,d) are the ends of a line segment
    // testing if on the box tests if the point is on line segment
    // if we already know the point is on the line
    if(b==d)
    {
        if(
        (x<=a) && (x>=c) ||
        (x>=a) && (x<=c)
        )
        return true;
    }
    else if (a==c)
    {
        if  (
           (y<=b) && (y>=d) ||
           (y>=b) && (y<=d)
        )
    
        return true;
    }
    else if(
        (
        (x<=a) && (x>=c) ||
        (x>=a) && (x<=c)
        )
        &&
        (
        (y<=b) && (y>=d) ||
        (y>=b) && (y<=d)
        )
    ) return true;
    return false;
}

  check_if_crossed_specific_side(dt,ball_center_x_pos,ball_center_y_pos,velocity_x,velocity_y,ball_radius,side)
  {
      let ball_x=ball_center_x_pos
      let ball_y=ball_center_y_pos
      let ball_vel_x=velocity_x
      let ball_vel_y=velocity_y
 
      let ball_r=ball_radius;
      var is_vertical_path = false;
        var is_vertical_wall = false;
      let side_r = Math.sqrt(  (side[1][0]-side[0][0])*(side[1][0]-side[0][0]) + (side[1][1]-side[0][1])*(side[1][1]-side[0][1]) )
        // Where is the ball in the next frame?
        var bx = ball_x + ball_vel_x;
        var by = ball_y + ball_vel_y;  
       
        // Make sure we are at least somewhat close to the target
        /*
        var d = this.my_distance( (side[1][0]-side[0][0])/2 , side[1][1]-side[0][1],ball_x,ball_y);
        if ( (side_r + 2*ball_r ) < d) {
            return;
        }
        */
        // find velocity
        var v = Math.sqrt(ball_vel_x * ball_vel_x+ ball_vel_y * ball_vel_y);

        // find theta_path, m_path, and b_path
        var theta_path = this.get_theta(ball_vel_x, ball_vel_y);
        var m_path = this.get_m(ball_vel_x, ball_vel_y);
        var b_path = ball_y - m_path * ball_x;   // y intercept of path

        // find the theta_wall, m_wall, and b_wall
        var wall_dy = side[1][1] - side[0][1];
        var wall_dx = side[1][0] - side[0][0];
        var theta_wall = this.get_theta(wall_dx, wall_dy);
        var m_wall = this.get_m(wall_dx, wall_dy);
        var b_wall = side[0][1] - m_wall * side[0][0];   // y intercept of path
               
        // Find collision point
        var collision_x = 0;
        var collision_y = 0;

        if(wall_dx == 0) {   // vertical wall
            is_vertical_wall = true;
            if(wall_dy != 0) {
                if (ball_vel_x==0) return null;
                // calculate intersection
                // x is fixed because line is vertical
                collision_x = side[0][0];
                collision_y = ball_y + (ball_vel_y/ball_vel_x)*(side[0][0]-ball_x);

                //console.log("vertical wall collides " + collision_x
                   //  + "," + collision_y);

            }
            else { // wall is a point;
                m_wall = -999;  // approximation
                theta_wall = -3.14159/2;
                collision_x = side[0][0];
                collision_y = side[0][1];
                //console.log("point wall collides " + collision_x +
                //    "," + collision_y );
            }
        }
        else {
            is_vertical_wall = false;

            // find the point of collision
            // b= y-mx for both lines, and at crossing y and x are the same
            // b1 = y-m1x; y = m2x + b2;
            // b1 = (m2x + b2) - m1x = (m2-m1)x + b2;
            // x = (b1-b2)/(m2-m1)

            if(m_path == m_wall) {
                //console.log("No collision, wall and path are parallel.");
                return null; // avoid errors
            }
            collision_x = (b_path - b_wall)/(-m_path + m_wall);
            collision_y = m_path * collision_x + b_path;
           // console.log("Path collides with wall at " + collision_x +
        //            "," + collision_y );
        }

            // see how close we are to the crossing point  
            //
            var d1 = collision_x - ball_x;
            var d2 = collision_y - ball_y;
            var d3 = d1*d1 + d2*d2;
            var distance_to_collision = Math.sqrt(d3);
            /*
            if (distance_to_collision>25) {          // must be within 5 units for a hit
                return;
            }
            */
            // Make sure the colliison point is on the wall segment

            if(!this.point_in_box(collision_x, collision_y, side[0][0], side[0][1], side[1][0], side[1][1]))
            {
      //          console.log("The collision point is not on the line segement.");
                return null;
            }
            //else console.log("The collision point IS on the line segement.");

            // find the bounce direction
            //    IS THIS CORRECT?
            var theta_bounce = 2*theta_wall - theta_path;

            // find the new velocities and position
            let anuvx = v * Math.cos(theta_bounce);
            let anuvy = v * Math.sin(theta_bounce);
            let anux = ball_x + anuvx;
            let anuy = ball_y + anuvy;

            //  Make sure this is further from the intersection point
            distance_to_collision = this.my_distance (ball_x, ball_y, collision_x, collision_y);

            // Check if the point now and in the next frame are on opposite sides of the wall
            // If not, we are headed in the wrong direction

            // Two given points P(x1, y1) and Q(x2, y2) will lie on the same side of the line
            // ax+by+c=0 if ax1+by1+c and ax2+by2+c will have same signs.
            // On the other hand, P(x1, y1) and Q(x2, y2) will lie on the
            // opposite sides of the line ax+by+c=0 if ax1+by1+c and ax2+by2+c will have opposite signs.

            let test1 = m_wall * ball_x - ball_y + b_wall;
            let test2 = m_wall * (ball_x+ball_vel_x) - (ball_y+ball_vel_y) + b_wall;
            let test3 = test1*test2;

            if(test3>0){
                //console.log("The travel path does not cross the wall so no bounce.");
                return null;
            }

            //a.vx = v * Math.cos(theta_bounce);
            //a.vy = v * Math.sin(theta_bounce);

            // a.x = a.x + avx;
            // a.y = a.y + avy;
            /*
            console.log("Bounce============");
            console.log("Ball location = " + a.x + "," + a.y);
            console.log("Ball velocity = " + a.vx + "," + a.vy);
            console.log("No turn destination = " + (a.x+a.vx) + "," + (a.y+a.vy));
            console.log("Collision point = " + collision_x + "," + collision_y);
            console.log("Ball distance from intersection = " + distance_to_collision);
            console.log("Ball new velocity = " +  anuvx + "," + anuvy);
            console.log("Theta travel = " + theta_path );
            const le.log("Theta bounce =" + theta_bounce);
*/
            
            let new_vels=[anuvx,anuvy]
            return new_vels;

    }
 }


class Flipper extends PolyActor
{
    constructor(world,right)
    {

        
        let flipper_coords=[vec4(-1.6709683418274, 0.8929912686347961, 0.575160526148974895,1),
        vec4(1.118709683418274, 0.5929912686347961, 0.565160526148974895,1),
        vec4(1.118709683418274, 0.5929912686347961, -0.265160526148974895,1),
        vec4(-1.68709683418274, 0.8929912686347961, -0.275160526148974895,1)];
        
        let model_transform=Mat4.identity();
        let flip_start_mat=model_transform.times(Mat4.translation((world.board_right-7)/2,12,4))
        let flip_adjust_mat=model_transform.times(Mat4.translation((world.board_right-7)*6/20,0,0)).times(Mat4.rotation(-Math.PI/2.5,0,0,1))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.translation(0,-(world.board_right-7)/6,0))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.rotation(3*Math.PI/2,0,0,1)).times(Mat4.rotation(Math.PI/2,1,0,0))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.scale((world.board_right-7)*1/12,(world.board_right-7)*1/12,(world.board_right-7)*1/12))
        let refl_matrix=Matrix.of([-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1])
        let rest_transform=[]
        if (right)
        {
            rest_transform=model_transform.times(flip_start_mat).times(flip_adjust_mat)
        }
        else 
        {
            rest_transform=model_transform.times(flip_start_mat).times(refl_matrix).times(flip_adjust_mat)
        }
        super(world, world.shapes.left_flipper, world.materials.rusty_metal, rest_transform, 1, 0, 0, flipper_coords )
        this.world=world;
        this.flipper_position=0;

        this.flip_max=15;
        this.original_mat=rest_transform;

        this.flipper_coords_access=[vec4(-1.9709683418274, 0.8929912686347961, 0.175160526148974895,1),
        vec4(1.118709683418274, 0.5929912686347961, 0.165160526148974895,1),
        vec4(1.118709683418274, 0.5929912686347961, -0.265160526148974895,1),
        vec4(-1.98709683418274, 0.8929912686347961, -0.275160526148974895,1)];;
    }
    doSomething()
    {
        this.rotate();
    }
    rotate()
    {

        let lth =  3.14159*(Math.min(this.flipper_position,10))/(this.flip_max*2);
        let mt=Mat4.identity();
        mt = mt.times(Mat4.rotation(-Math.sin(lth),0.,0,1));
        mt=mt.times(Mat4.translation(-5*Math.sin(lth),4.5*Math.sin(lth),0))
        
        //mt = mt.times(Mat4.translation(0.,5*Math.sin(lth),0.));    
        let new_mat=this.original_mat.times(Mat4.scale(1/((this.world.board_right-7)*1/12),1/((this.world.board_right-7)*1/12),1/((this.world.board_right-7)*1/12)))
        new_mat=new_mat.times(Mat4.rotation(-Math.PI/2,1,0,0)).times(Mat4.rotation(-11*Math.PI/10,0,0,1)).times(mt).times(Mat4.rotation(11*Math.PI/10,0,0,1))
        new_mat=new_mat.times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.scale((this.world.board_right-7)*1/12,(this.world.board_right-7)*1/12,(this.world.board_right-7)*1/12))
       

        this.emplace(new_mat,vec3(0,0,0),0);
  
        this.sides_list=[]

        
        let i=0
        while (i<this.flipper_coords_access.length-1)
    {
        this.sides_list.push([new_mat.times(this.flipper_coords_access[i]),new_mat.times(this.flipper_coords_access[i+1])]);
        i++;
    }
    }
    
    adjust_flipper_position(up)
    {
        if (up)
        {
            if (this.flipper_position<this.flip_max)
            {
               
            this.flipper_position++;
            }      
        } 
        else 
        {
            if (this.flipper_position>0)
            this.flipper_position--;
            if (this.flipper_position>0)
            this.flipper_position--;
        }
    }

}

class MultiballBonus extends PolyActor
{
    constructor(world,model_transform,coords4D)
    {
        super(world, world.shapes.cube, world.materials.rusty_metal, model_transform, 1, 0, 0, coords4D )
        
    }
    react_to_hit()
    {
        if (this.world.multiball_cooldown==0)
        this.world.multiball_cooldown=200;
    }
}

class Moving_Obstacle extends PolyActor
{
    constructor()
    {

    }      
}

class Hit_All_Three extends PolyActor
{
    constructor(world,model_transform,coords4D)
    {
        super(world, world.shapes.cube, world.materials.rusty_metal, model_transform, 1, 0, 0, coords4D )
        this.has_been_hit=false
    }
    react_to_hit()
    {
        if (this.has_been_hit==false)
        {
            this.material=this.world.materials.black.override(color(0,1,1,1));
        this.world.hit_all_three_count++;
        this.has_been_hit=true;
        }
    }
}


class Pinball extends RoundActor
{
    constructor(world, width)
    {
        
        let model_transform=Mat4.identity().times(Mat4.translation(width-2,5,4)).times(Mat4.scale(1,1,1))
        
        super(world, world.shapes.sphere,world.materials.iron,model_transform,1,0,0,1)
    
        this.launched=false;
        

    }

    doSomething(dt)
    {
       
        
        if (this.launched)
        {
            this.apply_gravity(dt);
            let vel_changes=this.world.adjust_ball_velocity_for_collisions(this,dt);
            if (vel_changes!=null)
            this.change_velocities(vel_changes[0],vel_changes[1]);
            if (this.center[1]<4.2)
        {
            this.die();
           
        }
        }
        
       
        



    }

    die()
    {
         if (this.world.camera_focus==this)
            this.world.camera_focus=null;
         this.world.active_balls-=1;
         super.die();

    }


    change_velocities(x_vel, y_vel)
    {  
        this.linear_velocity[0]=x_vel;
        this.linear_velocity[1]=y_vel;
    }


    get_launched()
    {
        this.change_velocities(3,.18*this.world.launch_speed)
        this.launched=true;
        this.world.camera_focus=this;
    }

    apply_gravity(dt)
    {
       
        let gravity=.001;
        this.linear_velocity[1]-=gravity;
      

    }

    

}





export class PinballWorld extends Simulation {
    

    constructor() 
    {
        
        super();
        //Camera-related settings
        this.ball_focus=false;
        // camera location
        this.initial_camera_location = Mat4.look_at(vec3(35, -55, 90), vec3(35, 45, 0), vec3(0, 1, 1));
        //this.initial_camera_location = Mat4.look_at(vec3(15, 25, 90), vec3(15, 25, 0), vec3(0, 1, 1));
        this.camera_focus=null;
        this.start_game_flag == false;

    

        
        //Shape Options
        this.shapes = 
        {

            sphere: new defs.Subdivision_Sphere(4),
            cube: new defs.Cube(),
            circle: new defs.Regular_2D_Polygon(1, 15),
            cylinder: new defs.Capped_Cylinder(10,10,[0,150]),
            text: new Text_Line(15),
            text_long: new Text_Line(35),
            machine_table: new Shape_From_File("assets/machine-table.obj"),
            machine_legs: new Shape_From_File("assets/machine-legs.obj"),
            machine_backboard: new Shape_From_File("assets/machine-backboard.obj"),
            //machine_table: new Shape_From_File("assets/machine-rebuilt.obj"),
            left_flipper: new Shape_From_File("assets/flip-left.obj"),
            right_flipper: new Shape_From_File("assets/flip-right.obj"),
            nail: new Shape_From_File("assets/nail5.obj"),
            bouncer: new Shape_From_File("assets/bouncer.obj"),
            mushroom: new Shape_From_File("assets/mushroom.obj"),
            background_floor: new defs.Cube(),
            background_wall: new defs.Cube(),
            backboard: new defs.Cube()
        };

        // scale the textures for the background floor so textures repeat
        this.shapes.background_floor.arrays.texture_coord.forEach(v => v.scale_by(2));
        this.shapes.background_wall.arrays.texture_coord.forEach(v => v.scale_by(3));
        this.shapes.backboard.arrays.texture_coord.forEach(v => v.scale_by(2));


        //Animation-related settings
        this.time_scale/=1500;


//         //Texture Options
//         const bump = new defs.Fake_Bump_Map(1);
//         const texture = new defs.Textured_Phong(1);


        this.hit_all_three_count=0;
        this.pinballs=[]
        
        this.left_flipper_cooldown=0;
        this.right_flipper_cooldown=0;
        
        // *** Materials
        this.materials = {

            black: new Material(new defs.Phong_Shader(),
                {color: hex_color("#000000"), ambient: 0.5, diffusivity: 0.5, specularity: 0.5}),

            rusty_metal: new Material(new Textured_Phong(), { // use for obstacles
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/rust-tex.jpg")}),

            rusty_metal2: new Material(new Textured_Phong(), { // use for obstacles
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/rust-tex2.jpg")}),

            iron: new Material(new Textured_Phong(), { // use for pinball
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.1, specularity: 1,
                texture: new Texture("assets/iron.jpg")}),
            
            metallic_plate: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.5, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/metallic-plate.jpg")}),

            wood: new Material(new Textured_Phong(), { // use for background
                color: hex_color("#000000"),
                ambient: 0.3, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/hardwood_floor.jpg")}),

            brick: new Material(new Textured_Phong(), { // use for background
                color: hex_color("#000000"),
                ambient: 0.3, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/brick_weathered.jpg")}),

            siding: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.3, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/siding.jpg")}),

            red_steel: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.8, specularity: 0.5,
                texture: new Texture("assets/red_steel.jpg")}),

            blocks: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.3, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/blocks.jpg")}),

            red_velvet: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/red_velvet.jpg")}),

            pinball_wizard: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.7, diffusivity: 0.8, specularity: 0.1,
                texture: new Texture("assets/pinball_wizard.jpg")}),


                
        }

        // To show text you need a Material like this one:
        this.text_image = new Material(new Textured_Phong(), {
            ambient: 1, diffusivity: 0, specularity: 0,
            texture: new Texture("assets/text.png")
        });

        // sound initialization
        bounce_sound = new Audio("assets/pinball_bounce.mp3");
        launch_sound = new Audio("assets/firing_ball.mp3");
        lost_ball_sound = new Audio("assets/lost_ball.mp3");
        flipper_sound_left = new Audio("assets/flip.mp3");
        flipper_sound_right = new Audio("assets/flip.mp3");
        game_over_sound = new Audio("assets/game_over_sound.mp3");

        this.has_sound_played_flag = false; //used to make sure game over sound doesn't repeat because it is inside display function



        //Initial Game Settings
      
        this.multiball_cooldown=50000;
        this.balls_remaining=0;
        this.active_balls=0;

        //Launcher-related-settings
        this.launch_speed=0;
        this.ball_currently_in_launcher=null;
        
     
        //Score/Text box settings
        this.score = 0;
       

        this.board_top= 80;
        this.board_right= 70;

        let model_transform = Mat4.identity();
        
        

        let diag_transform=model_transform.times(Mat4.translation(this.board_right-3,this.board_top-3,3.25)).times(Mat4.rotation(Math.PI/4,0,0,1)).times(Mat4.scale(1,5,4))
        
        //Cube vertex coordinates
        let top_right=vec4(1,1,0,1);
        let bot_right=vec4(1,-1,0,1);
        let bot_left=vec4(-1,-1,0,1);
        let top_left=vec4(-1,1,0,1);
        
        let cube_vertices= [bot_left,top_left,top_right,bot_right]
       

        
       

        //Machine building
        let left_transform=model_transform.times(Mat4.translation(-1,this.board_top/2,4)).times(Mat4.scale(1,this.board_top/2,4.2))
        let right_transform=model_transform.times(Mat4.translation(this.board_right+1,this.board_top/2,4)).times(Mat4.scale(1,this.board_top/2,4.2))
        let top_transform=model_transform.times(Mat4.translation(this.board_right/2,this.board_top+1,4)).times(Mat4.scale(this.board_right/2+2,1,4.2))
        let bottom_transform=model_transform.times(Mat4.translation(this.board_right/2,-1,4)).times(Mat4.scale(this.board_right/2+2,1,4.2))
        let right_barrier=model_transform.times(Mat4.translation(this.board_right-6,this.board_top/2-6,4)).times(Mat4.scale(1,this.board_top/2-6,4.2))
       


        let diag_start_mat=model_transform.times(Mat4.translation((this.board_right-7)/2,12,4))
        let diag_adjust_mat=model_transform.times(Mat4.translation((this.board_right-7)*6.7/20,0,0))
        diag_adjust_mat=diag_adjust_mat.times(Mat4.rotation(-Math.PI/2.5,0,0,1)).times(Mat4.scale(2,(this.board_right-7)*1/15,1))
        


        let left_diag=model_transform.times(diag_start_mat).times(Matrix.of([-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1])).times(diag_adjust_mat)
        let right_diag=model_transform.times(diag_start_mat).times(diag_adjust_mat)




        let flip_adjust_mat=model_transform.times(Mat4.translation((this.board_right-7)*6/20,0,0)).times(Mat4.rotation(-Math.PI/2.5,0,0,1))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.translation(0,-(this.board_right-7)/6,0))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.rotation(3*Math.PI/2,0,0,1)).times(Mat4.rotation(Math.PI/2,1,0,0))
        flip_adjust_mat=flip_adjust_mat.times(Mat4.scale((this.board_right-7)*1/12,(this.board_right-7)*1/12,(this.board_right-7)*1/12))
        

        
        let left_flip_partial_transform=model_transform.times(diag_start_mat).times(Matrix.of([-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]))
        left_flip_partial_transform=left_flip_partial_transform.times(flip_adjust_mat)



        let right_flip_partial_transform=model_transform.times(diag_start_mat).times(flip_adjust_mat)


        let right_flipper_side=model_transform.times(diag_start_mat).times(Mat4.translation((this.board_right-7)*(4.5/12),5.2,-.2)).times(Mat4.scale(2,5.5,1))
        let left_flipper_side=model_transform.times(diag_start_mat).times(Matrix.of([-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]))
        left_flipper_side=left_flipper_side.times(Mat4.translation((this.board_right-7)*(4.5/12),5.2,-.2)).times(Mat4.scale(2,5.5,1))
        
        let first_hit_all_three_transform=model_transform.times(Mat4.translation(12,30,4))
        let second_hit_all_three_transform=model_transform.times(Mat4.translation(12,40,4))
        let third_hit_all_three_transform=model_transform.times(Mat4.translation(12,50,4))

        let bouncer_rot_transform=model_transform.times(Mat4.rotation(Math.PI/2,1,0,0))

        this.bodies=[new PolyActor(this,this.shapes.cube, this.materials.red_steel,left_transform,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,right_transform,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,top_transform,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,bottom_transform,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,diag_transform,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,right_barrier,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,left_diag,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,right_diag,1,bounce_sound,0,cube_vertices),
           
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,right_flipper_side,1,bounce_sound,0,cube_vertices),
           new PolyActor(this,this.shapes.cube, this.materials.red_steel,left_flipper_side,1,bounce_sound,0,cube_vertices),
            //new PolyActor(this,this.shapes.left_flipper, this.materials.stars,Mat4.identity(),1,0,0,flipper_vertices),
           new MultiballBonus(this,Mat4.identity().times(Mat4.translation(30,50,4)),cube_vertices),
           

            ]


         this.obstacles=[...this.bodies]
         







            
          let first_of_three=new Hit_All_Three(this, first_hit_all_three_transform,cube_vertices)
          let second_of_three=new Hit_All_Three(this, second_hit_all_three_transform,cube_vertices)
          let third_of_three= new Hit_All_Three(this, third_hit_all_three_transform,cube_vertices)
          let left_flipper=new Flipper(this,false)
          let right_flipper=new Flipper(this, true)
          this.bodies.push(left_flipper);
          this.bodies.push(right_flipper);
          this.flippers=[left_flipper,right_flipper]
          this.obstacles.push(left_flipper)
          this.obstacles.push(right_flipper)
          //  new PolyActor(this,this.shapes.cube, this.materials.wall,bottom_transform,1,0,0),
            
          //  new PolyActor(this,this.shapes.cube, this.materials.wall,model_transform.times(Mat4.translation(5,5,4)),1,0,0,[[4,4],[4,6],[6,6],[6,4]])
          let test_transform = model_transform.times(Mat4.translation(20, 20, 4));
          //let test_mushroom = new Mushroom(this, test_transform, [[19,19], [19,21], [21,21], [21,19]]);
          

          //let test_mushroom = new PolyActor(this, this.shapes.mushroom, this.materials.rusty_metal, test_transform, 1, bounce_sound, 25, cube_vertices);
          //this.bodies.push(test_mushroom);
          this.trio=[first_of_three,second_of_three,third_of_three]
          this.bodies.push(first_of_three);
          this.bodies.push(second_of_three);
          this.bodies.push(third_of_three);
          this.obstacles.push(first_of_three)
          this.obstacles.push(second_of_three)
          this.obstacles.push(third_of_three)
          
        //Obstacle Building

        var i;
        var j; 
        for (i=5;i<27;i+=2)
        {
            for (j=5;j<25;j+=2)
            {
                
                if (i%4==j%4) continue;
               // let obj_transform=Mat4.identity().times(Mat4.translation(j,i,4)).times(Mat4.scale(.5,.5,.5));
      //           this.bodies.push(new PolyActor(this,this.shapes.cube, this.materials.pinball,obj_transform,1,0,0,[[j-.5,i-.5],[j-.5,i+.5],[j+.5,i+.5],[j+.5,i-.5]]))

            }
        }

    }





    adjust_ball_velocity_for_collisions(ball,dt)
    {
        
        var i;
        let final_adjustment=null
        for  (i=0; i<this.obstacles.length;i++)
        {
            
                let vel_adjustments=this.obstacles[i].check_if_ball_inside_and_provide_vel_changes(ball,dt);
                if (vel_adjustments!= null)
                {
                    this.score += this.obstacles[i].object_score_value; // update score. i think this is where collisions are detected
                    if(this.obstacles[i].sound_effect != 0)
                    {
                        this.obstacles[i].sound_effect.play();
                    }
                    
                    final_adjustment=vel_adjustments
                    
                }
                
                
        }
        let check=false;
        let j=0
        while (j<this.pinballs.length)
        {
            if (check && this.pinballs[j].center[1]>5)
            {
                let vel_adjustments=this.pinballs[j].check_if_ball_inside_and_provide_vel_changes(ball,dt);
                if (vel_adjustments!= null)
                {
                    this.score += this.pinballs[j].object_score_value; // update score. i think this is where collisions are detected
                    if(this.pinballs[j].sound_effect != 0)
                    {
                        this.pinballs[j].sound_effect.play();
                    }
                    
                    final_adjustment=vel_adjustments
                    
                }
            }
            if (ball==this.pinballs[j]) 
            {
            check=true;
            }
            j++;
        }
    

                


        
      return final_adjustment;
    }


    start_game()
    {
        this.start_game_flag = true;
        this.balls_remaining = 5;
        this.has_sound_played_flag = false;
        this.place_ball_in_launcher();
    }

    end_game(program_state)
    {
        //console.log("GAME OVER");
        //let game_over_camera_location = this.model_transform.times(Mat4.translation(500, 0, 0));
        

    }


    make_control_panel(context,program_state) {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Start Game", ["Control", "0"], () => this.start_game())
        this.new_line();
        this.key_triggered_button("Pull spring back more", ["Control", "1"], () => this.launch_speed=Math.min(10,this.launch_speed+1));
        this.key_triggered_button("Pull spring back less", ["Control", "2"], () => this.launch_speed=Math.max(0,this.launch_speed-1));
        this.key_triggered_button("Left Flipper", ["l"], () => {
            if (this.left_flipper_cooldown==0)flipper_sound_left.play();
            this.left_flipper_cooldown=12;
            
        });
        this.key_triggered_button("Right Flipper", [";"], () => {
            if (this.right_flipper_cooldown==0)flipper_sound_right.play();
            this.right_flipper_cooldown=12;
            
        });
        this.new_line();
        this.key_triggered_button("Launch Pinball", ["Control", "3"], () => {this.launch_ball()});
        this.key_triggered_button("Switch camera", ["Control", "4"], () => this.ball_focus=!this.ball_focus);
        //this.new_line();

    }


    launch_ball()
    {
        if (this.ball_currently_in_launcher!=null)
        {
        launch_sound.play();
        this.ball_currently_in_launcher.get_launched();
        this.ball_currently_in_launcher=null;
        if (this.multiball_cooldown==0)
        this.balls_remaining -= 1;
        this.active_balls += 1;
        //console.log(this.balls_remaining);
        //console.log(this.active_balls);
        }
    }


    place_ball_in_launcher()
    {   if(this.balls_remaining == 0)
        {
            return;
        }
        let new_pinball=new Pinball(this, this.board_right);
        this.bodies.push(new_pinball);
        this.pinballs.push(new_pinball);
        this.ball_currently_in_launcher=new_pinball;
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


       

        // overhead light setup
        const light_position = vec4(35, 50, 100, 0);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10**4)];

        //const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform=Mat4.identity();


        let below_transform=model_transform.times(Mat4.translation(this.board_right/2,this.board_top/2,1)).times(Mat4.scale(this.board_right/2+1,this.board_top/2+1,1))
       // this.shapes.cube.draw(context, program_state, below_transform, this.materials.floor);


        if (this.ball_focus && this.camera_focus!=null) 
        program_state.set_camera(Mat4.inverse(this.camera_focus.drawn_location.times(Mat4.translation(0,0,20))));
        else program_state.set_camera(this.initial_camera_location);


        super.display(context,program_state);


        // scoreboard drawing and transformation
        let num_string = this.score.toString();
        while(num_string.length < 4) // allow 4 digits to be displayed at all times
        {
            num_string = "0" + num_string;
        }
        let score_string = "Score: " + num_string;
        let score_transform = model_transform.times(Mat4.translation(20, 79, 30)).times(Mat4.scale(2, 2, 2)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        this.shapes.text.set_string(score_string, context.context);
        this.shapes.text.draw(context, program_state, score_transform, this.text_image);

        let score_screen_transform = score_transform.times(Mat4.translation(8, 0, -2)).times(Mat4.scale(10, 2, 1));
        this.shapes.cube.draw(context, program_state, score_screen_transform, this.materials.black);

        // background drawing and transformations
        let background_floor_transform = model_transform.times(Mat4.translation(50, 50, -50)).times(Mat4.scale(200, 100, 1)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        this.shapes.background_floor.draw(context, program_state, background_floor_transform, this.materials.wood);
        let background_wall_transform = model_transform.times(Mat4.translation(20, 125, 20)).times(Mat4.scale(200, 1, 70));
        this.shapes.background_wall.draw(context, program_state, background_wall_transform, this.materials.brick);

        // pinball table drawing and transformations
        let machine_table_transform = model_transform.times(Mat4.translation(35, 55, -6)).times(Mat4.scale(77, 50, 40)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        this.shapes.machine_table.draw(context, program_state, machine_table_transform, this.materials.red_steel);
        //let machine_backboard_transform = model_transform.times(Mat4.translation(20, 49, 20)).times(Mat4.scale(26, 20, 30)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        let machine_backboard_transform = model_transform.times(Mat4.translation(35, 89, 20)).times(Mat4.scale(37, 7, 25)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        this.shapes.backboard.draw(context, program_state, machine_backboard_transform, this.materials.red_steel);
        let machine_legs_transform = model_transform.times(Mat4.translation(35, 50, -30)).times(Mat4.scale(77, 50, 60)).times(Mat4.rotation(17*Math.PI/36, 1, 0, 0));
        this.shapes.machine_legs.draw(context, program_state, machine_legs_transform, this.materials.red_steel);

        // floor drawing and transformation
        let floor_transform = model_transform.times(Mat4.translation(35, 40, 2)).times(Mat4.scale(35, 40, 1));
        this.shapes.cube.draw(context, program_state, floor_transform, this.materials.red_velvet);




        let i=0
        while (i<this.bodies.length)
        {
           this.bodies[i].draw_corners(context,program_state)      
           i++;
        }
        
        
        if(this.balls_remaining == 0 && this.active_balls == 0 && this.start_game_flag == true) // out of balls and our last one just died
        {
            // GAME OVER message and sound
            if(this.has_sound_played_flag == false)
            {
                game_over_sound.play();
                this.has_sound_played_flag = true;
            }

            let game_over_string = "GAME OVER";
            let game_over_transform = model_transform.times(Mat4.translation(0, 40, 30)).times(Mat4.scale(6, 6, 6)).times(Mat4.rotation(Math.PI/2, 1, 0, 0));
            this.shapes.text.set_string(game_over_string, context.context);
            this.shapes.text.draw(context, program_state, game_over_transform, this.text_image);

            let game_over_string2 = "Press 'Start Game' to Play Again";
            let game_over_transform2 = model_transform.times(Mat4.translation(-34, 40, 20)).times(Mat4.scale(3, 3, 3)).times(Mat4.rotation(Math.PI/2, 1, 0, 0));
            this.shapes.text_long.set_string(game_over_string2, context.context);
            this.shapes.text_long.draw(context, program_state, game_over_transform2, this.text_image);
        }



    }



    update_state(dt)
    {


        if (this.ball_currently_in_launcher==null && ((this.balls_remaining>0&&this.active_balls==0) || this.multiball_cooldown>0))
        {
            this.place_ball_in_launcher();
        }


        var i;
        for  (i=0; i<this.bodies.length;i++)
        {

            
            this.bodies[i].doSomething(dt);
   

        }

        
        for  (i=0; i<this.bodies.length;i++)
        {
            if (this.bodies[i].alive==false)
            {
                this.bodies.splice(i,1);

                lost_ball_sound.play();
            }
                
         

        }

        for  (i=0; i<this.pinballs.length;i++)
        {
            if (this.pinballs[i].alive==false)
            {
                this.pinballs.splice(i,1);
                
                
            }
                
         

        }
        
        this.flippers[0].adjust_flipper_position((this.left_flipper_cooldown!=0));
        this.flippers[1].adjust_flipper_position((this.right_flipper_cooldown!=0));
        
        if (this.left_flipper_cooldown>0) this.left_flipper_cooldown--;
        if (this.right_flipper_cooldown>0) this.right_flipper_cooldown--;

        if (this.hit_all_three_count==3)
        {
            this.score+=1000
            
            this.hit_all_three_count=0;
            this.trio[0].has_been_hit=false;
            this.trio[0].material=this.materials.black
            this.trio[1].has_been_hit=false;
            this.trio[1].material=this.materials.black
            this.trio[2].has_been_hit=false;
            this.trio[2].material=this.materials.black

        }
        if (this.multiball_cooldown>0)
        {
            this.multiball_cooldown--;
        }
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