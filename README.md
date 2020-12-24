# Pinball Wizard

Authors:

Jake Herron / jaherron@ucla.edu

Landon Miller / sunvalley@ucla.edu

Jim Pickrell / jim.pickrell@gmail.com


Pinball Wizard is a Javascript and WebGL game completed as a final group project for CS 174A: Introduction to Computer Graphics at UCLA. It is a 70s-inspired pinball game with 3D graphics, realistic physics simulation, and collision detection.

## To run the program:

Option 1
1. Navigate to https://jakeaherron.com/pinball-wizard/
2. Follow the directions on screen to start playing!

Option 2
1. Clone the repository onto your local machine
2. Run the host script
  - For Mac users: Open host.command
  - For Windows users: Open host.bat
3. Navigate to http://localhost:8000/ on your web browser
4. Follow the directions on screen to start playing!


## About our game and how to play

Our game follows a 70s inspired theme inspired by the pinball renaissance of the 1970s. We drew inspiration from the song "Pinball Wizard" by The Who and the classic pinball movie Tommy (1975) starring Elton John. We included this theme through the background setting, textures of the machine itself, guitar riffs from the song, and retro sound effects.

To play the game, follow the steps above to get the program running. Click on the "Front view" button to get a better view of the playing field. Then press the "Start Game" button to insert a quarter and start up the machine. Press the "Pull spring" buttons to add velocity to the ball. The launcer will pull back and the arrow will grow to show the increasing momentum of the ball. Then, press the "Launch Pinball" button to send the ball into the course. Here, it will collide with and bounce off of a variety of obstacles including: mushrooms, nails, bouncers, multiball powerups, and three-hit bonuses. Mushrooms are the brown, rusty obstacles that serve as a basic object for the ball to collide with. It provides 50 points when hit and will slightly dampen the velocity of the ball. Nails are the thin, gray pins that are placed in groups on the field to cause the ball to bounce continuously and rack up points. They provide 10 points and light up on hit and will not dampen the velocity of the ball. Bouncers are the fat, gray obstacles that provide 100 points and will send the ball flying when hit. The multiball powerups are the bright yellow diamonds that are one of the more intersting obstacles that we implemented. When hit, they play a guitar riff from The Who and allow the player to launch multiple pinballs at the same time for a few seconds. Additionally, they will turn into a glowy red color and will not activate when hit again. Finally, the three-hit bonus obstacles in the top left of the machine will light up when hit. If the player manages to hit all three of them, then they will provide a bonus 1000 points, play another line from The Who, and turn black. Each of these obstacles has a custom 3D model made in Maya, unique sound effects that play upon hit, and distinctive textures. There is a "Free Multiball" button that gives the player a multiball powerup to allow the player to launch many balls in quick succession for free. We used this in the demo to show off the capabilities of our physics and collision systems.

At the bottom of the machine, there are two flippers that will rotate upwards when their corresponding buttons are hit. The player can also hold the button to keep the flippers in the upward position. If the ball falls too far down toward the bottom of the board, then the player can activate the flipper buttons to launch the ball upward just like in a real pinball game. These rotate on a hinge point and have a hitbox that moves with the model of the flipper.

The player can press the "Entryway View" and "Front View" buttons to swap between the camera angles of the scene. Additionally, the player can press the "Focus camera on ball" button to place the camera directly above the ball and follow it as it bounces through the course. 

As the ball bounces through the course, it racks up points as it bounces off of different obstacles. These points are added to the player's total score which is displayed on the top of the board. If the ball falls to the bottom of the machine, then it dies and the player can launch another one. The player gets five balls to launch in total (excluding those from the multiball powerup). After these five die, then the game is over and a "Game Over" screen displays telling the player to try again.

## The story of our project

This project always started as a pinball game, and we knew that would be our end goal. It took a while to get there as we went through multiple variations and steps. First, we created a simple Pachinko-inspired game to show off at the Midway Demo where we got our basic physics implemented with a barebones board setup and only a single obstacle type. After this demo, we encountered major challenges with the prebuilt collision detection functions, so we decided to build it ourselves along with enhancing our physics simulation. Here, collisions began by giving every object a basic 1x1 square hitbox that would detect when the pinball crosses over one side of the square. Then, it would calculate the resulting x and y velocities after the bounce and adjust accordingly to simulate the ball ricocheting off of the wall or obstacle. 

Next, we expanded our array of obstacles to include nails, mushrooms, and bouncers. Nails would be slim pins usually present in groups that would cause continuous bounces and light up upon hit. Mushrooms would be our basic 1x1x1 obstacle that would rack up points and cause a normal bounce of the ball. Bouncers would be a bit bigger than mushrooms and cause the ball to go flying at a higher speed in the opposite direction. All of these obstacles had custom 3D models that were created in Maya and then imported into WebGL as .obj files. Additionally, we created custom 3D models for the actual pinball machine and placed our playing field inside the machine in order to realistically depict an actual pinball machine. 

We also started to implement sound effects to make the game more engaging and responsive. These were included as .mp3 files using Javascript functionality and edited using Audacity. Sounds began as a simple bonk when the ball hit an obstacle, a sad horn when the ball died, and a satisfying chunk when the ball was launched. They were eventually expanded to include unique sounds for every aspect of the game ranging from inserting a quarter to start the game, a game over melody, distinct bounce sounds for every obstacle (including when two balls would collide), and guitar riffs from The Who to solidify our 70s theme. 

We also implemented flippers at this point (with unique 3D model) that would launch the ball upward when activated - just like a real pinball machine. We also further improved our collision detection by creating different hitboxes for round and polygon objects. Each obstacle was of a certain class that had their own hitboxes that followed the model as closely as possible in order to provide realistic collisions. Polygon hitboxes consisted of an array of sides that were created from a set of vertices in order to construct an accurate shape, while round hitboxes were created using the radius to draw a circle for the shape. 

Textures also saw an evolution throughout the development of this project. They started as rudimentary placeholders and eventually turned into having distinct textures for each obstacle. The different textures allowed for a better playing experience as each obstacle on the field could be differentiated and objects began to look more interesting. The background also saw a makeover as we placed the pinball machine in a room with hardwood floors and a brick wall to set the scene of an arcade or dive bar. The classic movie posters ranging from James Bond to Star Wars solidified the 70s theme. The theme of our game was undecided at the beginning of development with ideas of James Bond or Space themes, but we ultimately decided to center our game around the pinball renaissance of the 1970s, so these posters are little callback to our proposed ideas. 

Next, we installed a score system with a counter at the top of the machine and each obstacle provided a certain amount of points that would add to the player's score as they played the game. We also implemented "Start Game" and "Game Over" screens to immerse the player and create a game experience. At this point, we added two unique obstacles into the game to create a fun experience for the player. The three-hit obstacle were polygons placed at the back of the machine that would light up upon hit and reward the player with bonus points if they could hit all three of them. The multiball obstacle would allow the player to launch many balls onto the field at once in quick succession upon hit. We included better controls and a clearer UI at this point as well. 

As we added more features and effects, the final demo day neared closer, and we kicked into overdrive mode to debug our game and fix collision issues. Once these were addressed, we completed our game and presented it in class.

## Challenges we faced and lessons we learned

The first challenge we face was using the example collision detection functions for our project. We found that these did not fit the needs of our project and that we needed to create our own system to handle collisions and physics. We resolved this issue by having each obstacle have a hitbox that was a data member in their class. This hitbox consisted of an array of sides that would each be checked against the position of the pinballs in order to detect collisions and alert the object as a whole of when and where it was hit. This was a challenge in and of itself as we had to create two separate functions for round and polygon objects in order to provide accurate collisions. These hitboxes begain as simple 1x1 boxes, and we would apply the same transformations that we used to draw the object in order to closely match its shape.

The next challenge we faced was implementing the flippers. First, to have them move in a realistic manner, we had to have them rotate on a hinge point, which required implementing a custom rotate function that matched the shape of the flipper. We also had to implement a system to have the hitbox of the flipper move with it as it rotated. The movement of the flipper also provided other challenges when it came to colliding with the ball. As we were nearing the deadline, we discovered that sometimes the ball would phase through the flipper and miss the collision due to the frame rate of the game. We were all hands on deck at this point as we resolved the issue by having the top side of the flipper hitbox attempt to detect collisions from farther away. This fix led to more reliable flipper collisions and a better playing experience. 

Throughout the development of Pinball Wizard, we learned a ton about Javascript, WebGL, git development, and most of all Computer Graphics. We found ourselves consistently applying concepts we learned in class and through the homework projects. This project also allowed us to expand our skills with other tools like image editing for textures, Maya for 3D modeling, Audacity for sound editing, and lastly Zoom for (a lot of) communication. Finally, we learned how to work well in a group and develop a large project like this as a team. We had a lot of fun developing this game and learned a ton along the way!
