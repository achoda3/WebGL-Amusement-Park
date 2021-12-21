/* HW4.js
//	
//	Written by Aryann Chodankar for CS 425
	This file calls the Cone creating functions in HW2Functions.js and implements them to do composite rotations and create the image of a Merry Go Round
	Also creates the keypressed functions (user Interaction) which allows the user to control the Camera!   
*/

// Globals are evil, but necessary when callback functions are used

// Object-independent variables
var gl;				// WebGL graphics environment
var program;		// The shader program
var aspectRatio;	// Aspect ratio of viewport

// Axes-related  variables
var nAxesPoints = 0;	// Number of points in the vertex arrays for the axes
var vbufferID_axes;		// ID of buffer holding axes positions
var cbufferID_axes;		// ID of buffer holding axes colors

// Cone-related variables - Only buffer IDs when using separate functions
var midConeBuffers;		// Array of buffer IDs for the mid cones
var coneBuffers;		// Array of buffer IDs used by the randomly colored cone
var sphereBuffers;		// Array of buffer IDs to make spheres
var solidConeBuffers = [];	// Array of buffer IDs used by the solid color cone
var cylinderBuffers;	// Array of buffer IDs used by the cylinders
var textureBuffers;		// Array of Buffer IDs used to make the texture Objects
var nConeSectors = 15;	// Number of sectors in first cone
var nConeSectors2 = 15;	// Number of sectors in second cone
var nLatSphere = 13;	// Number of Latitudinal points for sphere
var nLongSphere = 15;	// Number of Longittudinal points for sphere
var sphereCheck = false;// Boolean for checking if spheres or cone is light source
var coneCheck = true;
// Initialization function runs whenever the page is loaded

window.onload = function init( ) {

	document.getElementById("Gouraud").onclick = function() {
		var checkGouraudLoc = gl.getUniformLocation( program, "checkGouraud" );
		gl.uniform1iv( checkGouraudLoc, [ 1 ] );
		var checkPhongLoc = gl.getUniformLocation( program, "checkPhong" );
		gl.uniform1iv( checkPhongLoc, [ 0 ] );
	};
	document.getElementById("Phong").onclick = function() {
		var checkPhongLoc = gl.getUniformLocation( program, "checkPhong" );
		gl.uniform1iv( checkPhongLoc, [ 1 ] );
		var checkGouraudLoc = gl.getUniformLocation( program, "checkGouraud" );
		gl.uniform1iv( checkGouraudLoc, [ 0 ] );
	};
	document.getElementById("SphereLight").onclick = function() {
		sphereCheck = true;
		coneCheck = false;
	};
	document.getElementById("ConeLight").onclick = function() {
		coneCheck = true;
		sphereCheck = false;
	}
	// Establish arrays to hold vertex data
	var axesPoints = [ ];	// Vertex location data for axes
	var axesColors = [ ];	// Vertex color data for axes
	
	// Set up the canvas, viewport, and clear color

	var canvas = document.getElementById( "gl-canvas" );
	gl=WebGLUtils.setupWebGL( canvas );
	if( !gl ) {
		alert( "No WebGL" );
	}
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	aspectRatio = canvas.width / canvas.height ;
	gl.clearColor( 0.3, 0.2, 0.4, 1.0 );
	
	// Load the shaders, create a GLSL program, and use it.
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	
	// Generate Points and Colors
	
	// First the points and colors for the axes.
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 1, 0, 0 ) );
	axesPoints.push( vec3( 1, 0, 0 ) );
	axesColors.push( vec3( 1, 0, 0 ) );
	
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 0, 1, 0 ) );
	axesPoints.push( vec3( 0, 1, 0 ) );
	axesColors.push( vec3( 0, 1, 0 ) );
	
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 0, 0, 1 ) );
	axesPoints.push( vec3( 0, 0, 1 ) );
	axesColors.push( vec3( 0, 0, 1 ) );
	nAxesPoints = 6;
	
	// Okay.  All axes data calculated.  Time to put it in GPU buffers
	
	// Push Axis Vertex Location Data to GPU
	// Hold off on connecting the data to the shader variables
	
	vbufferID_axes = gl.createBuffer( );	// Note:  All bufferIDs are globals
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID_axes );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( axesPoints ), gl.STATIC_DRAW );
	
	// Push Axis Vertex Color Data to GPU
	// Hold off on connecting the data to the shader variables
	
	cbufferID_axes = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID_axes );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( axesColors ), gl.STATIC_DRAW );
	
	// Unbind the buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	// Creating coneBuffers to initialize the buffers for creating cone with random varying colors which will serve as top and bottom of Merry Go Round
	coneBuffers = createCone(nConeSectors, gl, [Math.random(), Math.random(), Math.random()]);
	// Creating an array of solidConeBuffers to have each Horse of the Merry Go Round a different color
	solidConeBuffers.push(createCone(nConeSectors2, gl, [Math.random(), Math.random(), Math.random()]));
	solidConeBuffers.push(createCone(nConeSectors2, gl, [Math.random(), Math.random(), Math.random()]));
	solidConeBuffers.push(createCone(nConeSectors2, gl, [Math.random(), Math.random(), Math.random()]));
	solidConeBuffers.push(createCone(nConeSectors2, gl, [Math.random(), Math.random(), Math.random()]));
	// Mid Cones
	midConeBuffers = createCone(nConeSectors, gl, [1.0, 1.0, 0.0]);
	// Creating Sphere to place on top of the Amusement park
	sphereBuffers = createSphere(gl, nLatSphere, nLongSphere, [1,1,1]);
	// Creating cylinders for spokes
	cylinderBuffers = createCylinder(gl, nLongSphere, [0.2,0.2,0.2]);
	// Creating Sign
	textureBuffers = createTexture(gl);

	gl.enable( gl.DEPTH_TEST );

	// Set uGouraud, uPhong, checkGourad, checkPhong and checkSign initially
	var checkGouraudLoc = gl.getUniformLocation( program, "checkGouraud" );
	gl.uniform1iv( checkGouraudLoc, [ 1 ] );
	var checkPhongLoc = gl.getUniformLocation( program, "checkPhong" );
	gl.uniform1iv( checkPhongLoc, [ 0 ] );
	var checkSignLoc = gl.getUniformLocation( program, "checkSign" );
	gl.uniform1iv( checkSignLoc, [ 0 ] );
	var uGouraudLoc = gl.getUniformLocation( program, "uGouraud" );
	gl.uniform1iv( uGouraudLoc, [ 0 ] );
	var uPhongLoc = gl.getUniformLocation( program, "uPhong" );
	gl.uniform1iv( uPhongLoc, [ 0 ] );
	// Set the normal matrix as a mat3 Identity matrix and send it to the GPU
	
	var normalMatrix = mat3( );
	var uNormalMatrixLoc = gl.getUniformLocation( program, "uNormalMatrix" );
	gl.uniformMatrix3fv( uNormalMatrixLoc, false, flatten( normalMatrix ) );

	// Initialization is done.  Now initiate first rendering
	render(then);
}

// Animation Related Variables
var then = 0.0; // Used for saving the previous time
var eye = vec3(2.0, 1.2, 1.5); // Global for keeping track the position of Camera
var at = vec3(-0.5,0.3,0); // Global for keeping track of where it is currently looking
// Next 4 variables assist in calculating the change in Direction for camera movement and rotation
var sub = vec3(at[0]-eye[0], at[1]-eye[1], at[2]-eye[2]);
var mag = Math.sqrt(sub[0]*sub[0]+sub[1]*sub[1]+sub[2]*sub[2]);
var atDirection = vec3(sub[0]/mag, sub[1]/mag, sub[2]/mag);
var forwardDirection = vec3(atDirection[0], 0, atDirection[2]);
var rotate = mat4(); //Rotating Camera
var theta = 0; //Used for Keeping track of rotations of Horse around Wheel
var cameraTheta = 0; //Used for Camera Adjustments
var q=false; //Used to quit
var h=false; //Used for toggling help
var height = vec4(0,0.2,0.4,0.6); //Used for keeping track of heights of the Horses
var inc = vec4(true,true,true,true); //Used for keeping track of whether to increase or decrease height of Horses

// Keyboard input

window.onkeydown = function(event){
	var key = String.fromCharCode(event.keyCode);
	switch(key){
		//Move Forward
		case 'W':
		case 'w':
			eye=vec3(eye[0]+forwardDirection[0],eye[1]+forwardDirection[1],eye[2]+forwardDirection[2]);
			at=vec3(eye[0]+atDirection[0],eye[1]+atDirection[1],eye[2]+atDirection[2]);
			break;
		//Rotate Left
		case 'A':
		case 'a':
			cameraTheta+=20;
			rotate = rotateY(radians(cameraTheta));
			break;
		//Move Backward
		case 'S':
		case 'S':
			eye=vec3(eye[0]-forwardDirection[0],eye[1]-forwardDirection[1],eye[2]-forwardDirection[2]);
			at=vec3(eye[0]+atDirection[0],eye[1]+atDirection[1],eye[2]+atDirection[2]);
			break;
		//Rotate Right
		case 'D':
		case 'd':
			cameraTheta-=20;
			rotate = rotateY(radians(cameraTheta));
			break;
		//Reset Position and Rotation
		case 'R':
		case 'r':
			eye = vec3(2.0, 1.2, 1.5);
			at = vec3(-0.5,0,0);
			cameraTheta=0;
			rotate = rotateY(radians(cameraTheta));
			break;
		//Quit
		case 'Q':
		case 'q':
			q=true;
			break;
		//Help
		case 'H':
		case 'h':
		case '¿':
			if(h==false){
				document.getElementById("p1").textContent+=" Press W to  Move Forward, S to Move Backward, A to rotate Left and D to Rotate right, Press H/? to toggle Help, Press R to Restart and Press Q to quit";
				h = true;
			} else {
				document.getElementById("p1").textContent="'Press H for Help':";
				h = false;
			}
			
	}
}


function render(now) {
	//Quit condition
	if(q==true){
		gl.deleteBuffer(vbufferID_axes);
		gl.deleteBuffer(cbufferID_axes);
		gl.deleteBuffer(coneBuffers);
		gl.deleteBuffer(solidConeBuffers);
		gl.deleteProgram(program);
	}

	//Calculating DeltaTime for use in Theta Calculation
	deltaTime = (now - then) * 0.001;
	if(deltaTime>1.0)
		deltaTime=0.0;
	then = now;
	theta += deltaTime*50;

	//Height Calculation
	for(let i=0; i<4; i++){
		if(inc[i]==true){
			height[i]+=0.01;
			if(height[i]>=1){
				inc[i] = false;
			}
		} else {
			height[i]-=0.01;
			if(height[i]<=0.2){
				inc[i] = true;
			}
		}
	}
	
	// Clear out the color buffers and the depth buffers.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Create mat4 transformation matrices as needed to transform vertices.
	// May include object transformation, camera movelView, and camera projection
	
	// Create modelView using lookAt( eye, at, up );
	// Push it to the GPU as a uniform variable.
	//var modelView = mat4( ); // Identity matrix unless changed otherwise.
	var modelView = lookAt( eye, at, vec3( 0, 1, 0 ) );
	modelView = mult(rotate, modelView);
	var vModelView = gl.getUniformLocation( program, "vModelView" );
	gl.uniformMatrix4fv( vModelView, false, flatten( modelView ) );
	// Create another mat4 using perspective( ) and send it to the GPU
	
	var projection = perspective( 60, aspectRatio, 0.1, 20.0 );
	var vProjection = gl.getUniformLocation( program, "vProjection" );
	gl.uniformMatrix4fv( vProjection, false, flatten( projection ) );
	
	// Set the transformation matrix as a mat4 Identity matrix and send it to the GPU
	
	var transformation = mat4( );
	var vTransformation = gl.getUniformLocation( program, "vTransformation" );
	gl.uniformMatrix4fv( vTransformation, false, flatten( transformation ) );
	
	// Set the Center of Rotation which holds the exact Position of where the Center of the Merry Go Round is and sends it to vertex Shader for calculation of Composite Matrix

	var centerOfRotation = vec3();
	var vCenter = gl.getUniformLocation(program, "vCenter");
	gl.uniform3fv(vCenter, flatten(centerOfRotation));
	
	// Set the Rotation which will help us get rotation about the translated Y Axis (not Origin) using Composite Matrix

	var Rotation = mat4( );
	var vRotate = gl.getUniformLocation(program, "vRotate");
	gl.uniformMatrix4fv(vRotate, false, flatten(Rotation));
	
	// Normal Matrix Setup
	var uNormalMatrixLoc = gl.getUniformLocation( program, "uNormalMatrix" );

	// Set the uGouraud to 0, so points pass through
	var uGouraudLoc = gl.getUniformLocation( program, "uGouraud" );
	var uPhongLoc = gl.getUniformLocation( program, "uPhong" );
	var checkSignLoc = gl.getUniformLocation( program, "checkSign" );

	// Set the Light Position
	var uLightPositionLoc = gl.getUniformLocation( program, "uLightPosition" );

	// Connect the axes vertex data to the shader variables - First positions
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID_axes );
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
	
	// Then the axes colors
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID_axes );
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );
	
	// Unbind the buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	Rotation = rotateY(0);
	gl.uniformMatrix4fv(vRotate, false, flatten(Rotation));

	// Draw the axes
	//gl.drawArrays( gl.LINES, 0, nAxesPoints );
	
	// Set Overall MGR Rotation
	MGR = mult ( translate(-0.5,0,0) , rotateY(theta));
	
	// We want our objects of light (Sphere and Cones) to not be affected by the lighting
	gl.uniform1iv( uGouraudLoc, [ 0 ] );
	gl.uniform1iv( uPhongLoc, [ 0 ] );
	gl.uniform1iv( checkSignLoc, [ 0 ] );

	var lightPosition;
	// Draw a sphere
	transformation = mult( translate(0, 1.7, 0), scalem( 0.2, 0.2, 0.2 ) );
	transformation = mult( MGR, transformation);
	if(sphereCheck){
		// Set the light Positions to be at points of Sphere
		lightPosition = vec3( mult( transformation, vec4( 0.0, 0.0, 0.0, 1.0 ) ) );
		gl.uniform3fv( uLightPositionLoc, flatten( lightPosition ) );
	}
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderSphere(sphereBuffers, gl, program, nLatSphere, nLongSphere);

	// Draw mid Cones
	transformation = mult( translate(0, 0.7, 0), scalem( 0.2, 0.6, 0.2 ) );
	transformation = mult( MGR, transformation);
	if(coneCheck){
		// Set light position to be at points of cones
		lightPosition = vec3( mult( transformation, vec4( 0.0, 0.0, 0.0, 1.0 ) ) );
		gl.uniform3fv( uLightPositionLoc, flatten( lightPosition ) );
	}
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderCone( midConeBuffers, nConeSectors, gl, program);

	transformation = mult( translate(0, 0.7, 0), mult(rotateX(180), scalem( 0.2, 0.6, 0.2 )) );
	transformation = mult( MGR, transformation);
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderCone( midConeBuffers, nConeSectors, gl, program);


	// Render the Sign
	gl.uniform1iv( checkSignLoc, [ 1 ] );
	transformation = mult( translate(0.25, 0, -1), scalem(1, 0.6, 1));
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderTexture(textureBuffers, gl, program, 1);

	// Render the Background
	transformation = mult( translate(-8, -0.5, 4), mult(rotateY(55), scalem( 15, 3.5, 2 )));
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderTexture(textureBuffers, gl, program, 2);
	gl.uniform1iv( checkSignLoc, [ 0 ] );

	// Set uGouraud to 1 to give ambient lighting to non light sources
	gl.uniform1iv( uGouraudLoc, [ 1 ] );
	gl.uniform1iv( uPhongLoc, [ 1 ] );

	// Top Of Cone
	transformation = mult( translate(0, 1.2, 0), scalem( 1, 0.5, 1 ) );
	transformation = mult( MGR, transformation);
	// Set the Normal Matrix for our object
	gl.uniformMatrix3fv( uNormalMatrixLoc, false, flatten( calcNormalMatrix( modelView, transformation ) ) );
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderCone( coneBuffers, nConeSectors2, gl, program);

	//Bottom Of Cone
	transformation = mult( translate(0, 0, 0), scalem( 1, -0.1, 1 ) );
	transformation = mult( MGR, transformation);
	// Set the Normal Matrix for our object
	gl.uniformMatrix3fv( uNormalMatrixLoc, false, flatten( calcNormalMatrix( modelView, transformation ) ) );
	gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
	renderCone( coneBuffers, nConeSectors2, gl, program);

	//Set the translations for all the Horses
	var horseTranslations = [];
	horseTranslations.push(translate(0.75, 0, 0));
	horseTranslations.push(translate(0, 0, 0.75));
	horseTranslations.push(translate(-0.75, 0, 0));
	horseTranslations.push(translate(0, 0, -0.75));
	//Set the rotations for all the Horses
	var horseRotations = [];
	horseRotations.push(mult(rotateY(180), rotateX(90)));
	horseRotations.push(mult(rotateY(90), rotateX(90)));
	horseRotations.push(mult(rotateY(0), rotateX(90)));
	horseRotations.push(mult(rotateY(270), rotateX(90)));
	var MGR = mat4();
	//Draw all of them
	for(let i=0; i<4; i++){
		transformation = mult( translate(0,height[i], 0), mult( horseTranslations[i], mult( horseRotations[i], scalem(0.25, 0.5, 0.25))));
		// Set the Normal Matrix for our objects
		MGR = mult ( translate(-0.5,0,0) , rotateY(theta));
		transformation = mult( MGR, transformation);
		gl.uniformMatrix3fv( uNormalMatrixLoc, false, flatten( calcNormalMatrix( modelView, transformation ) ) );
		gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
		renderCone( solidConeBuffers[i], nConeSectors, gl, program);
		transformation = mult( translate(0,0.60, 0), mult( horseTranslations[i], scalem(0.075, 0.65, 0.075)));
		MGR = mult ( translate(-0.5,0,0) , rotateY(theta+10));
		transformation = mult( MGR, transformation);
		gl.uniformMatrix3fv( uNormalMatrixLoc, false, flatten( calcNormalMatrix( modelView, transformation ) ) );
		gl.uniformMatrix4fv(vTransformation, false, flatten(transformation));
		renderCyclinder(cylinderBuffers, gl, program, nLongSphere);
	}
	//Request new frame
	requestAnimationFrame(render);
}

function calcNormalMatrix( viewXform, modelXform ) {
	var modelView =( mult( viewXform, modelXform ) );
	var N = mat3( );
	for( var i = 0; i < 3; i++ )
		for( var j = 0; j < 3; j++ )
			N[ i ][ j ] = modelView[ i ][ j ];
	return transpose( inverse3( N ) );
}