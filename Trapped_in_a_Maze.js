//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context
var shaderProgram = null;

var triangleVertexPositionBuffer = null;
var triangleVertexNormalBuffer = null;

// The GLOBAL transformation parameters

var globalAngleXX = 0.0;
var globalAngleYY = 0.0;
var globalAngleZZ = 0.0;

var globalTy = 0.0;
var globalTz = 0.0;

// GLOBAL Animation controls

var globalRotationXX_ON = 0;
var globalRotationXX_DIR = 1;
var globalRotationXX_SPEED = 0.3;

var globalRotationYY_ON = 0;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 0.3;

var globalRotationZZ_ON = 0;
var globalRotationZZ_DIR = 1;
var globalRotationZZ_SPEED = 0.3;


var primitiveType = null;	// way of drawing the model triangles

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];	// Viewer position is at (0,0,0) (perspective projection)

var fovy = 57;

// ---------------------------------------


// translations speed

var ball_speed = 1.0;

// maze rotation animation

var topAngle = -25;		// top perspective angle
var frontAngle = -90;	// front perspective angle
var maze_globalTy = 0.1;
var maze_globalTz = -2.5;

var maze_rotation_ON = 0;		// it's a globalRotationXX
var maze_rotation_DIR = 1;
var maze_rotation_DIR = -1;
var is_top_perspective = true;	// false == front perspective

// jump animation

var jump_ON = 0;
var jump_ITER = 0;		// iterations --- 1 iteration == 1 animate() call
var jump_END_ITER = 50;		// this works as a jump timer

// crystal catch animation

var catch_ON = 0;
var caught_crystals = [];

// maze swings animation

var swing_dir = 1;

// trap triggered animation

var trap_triggered_i =-1;		// map index of the trap triggered trap
var ball_cant_move = false;
var death_light_intensity = 6.0;

// save current globalAngleYY to use in Change Perspective animation
var saveGlobalAngleYY = 0;


//----------------------------------------------------------------------------
//
// To count the number of frames per second (fps)
//

var elapsedTime = 0;

var frameCount = 0;

var lastfpsTime = new Date().getTime();;


function countFrames() {

   var now = new Date().getTime();

   frameCount++;

   elapsedTime += (now - lastfpsTime);

   lastfpsTime = now;

   if(elapsedTime >= 1000) {

       fps = frameCount;

       frameCount = 0;

       elapsedTime -= 1000;

	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}


//----------------------------------------------------------------------------
//
//  Rendering
//

function initBuffers( model ) {

	// Vertex Coordinates

	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;

	// Associating to the vertex shader

	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize,
			gl.FLOAT, false, 0, 0);

	// Vertex Normal Vectors

	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;

	// Associating to the vertex shader

	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
			triangleVertexNormalBuffer.itemSize,
			gl.FLOAT, false, 0, 0);
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( model,
					mvMatrix,
					primitiveType ) {

	// local transformations

	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
	mvMatrix = mult( mvMatrix, rotationZZMatrix( model.rotAngleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( model.rotAngleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( model.rotAngleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );

	// Passing the Model View Matrix to apply the current transformation

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	// Associating the data to the vertex shader

	initBuffers(model);

	// Material properties

	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), flatten(model.kAmbi) );
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"), flatten(model.kDiff) );
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"), flatten(model.kSpec) );
	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), model.nPhong );

    // Light Sources

	var numLights = lightSources.length;
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), numLights );

	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );

		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );

		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }

	// Drawing primitives

	if( primitiveType == gl.LINE_LOOP ) {

		for( var i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {

			gl.drawArrays( primitiveType, 3 * i, 3 );
		}
	}
	else
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);

}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {

	var pMatrix;

	var mvMatrix = mat4();

	// Clearing the frame-buffer and the depth-buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// A standard view volume.--- Ensure that the model is "inside" the view volume
	pMatrix = perspective( fovy, 1, 0.05, 15 );

	// Passing the Projection Matrix to apply the current projection
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Passing the viewer position to the vertex shader
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"), flatten(pos_Viewer) );

	// global transformations

	mvMatrix = mult( mvMatrix, translationMatrix( 0, globalTy, globalTz ));
	mvMatrix = mult( mvMatrix, rotationZZMatrix( globalAngleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( globalAngleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( globalAngleXX ) );

	// light sources --- apply transformations for all light on

	for(var i = 0; i < lightSources.length; i++ )
	{
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() ) {

			if( lightSources[i].isRotXXOn() )
				lightSourceMatrix = mult(lightSourceMatrix, rotationXXMatrix( lightSources[i].getRotAngleXX() ));

			if( lightSources[i].isRotYYOn() )
				lightSourceMatrix = mult(lightSourceMatrix, rotationYYMatrix( lightSources[i].getRotAngleYY() ));

			if( lightSources[i].isRotZZOn() )
				lightSourceMatrix = mult(lightSourceMatrix, rotationZZMatrix( lightSources[i].getRotAngleZZ() ));
		}

		// Passing the Light Source Matrix to apply
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}

	// Instantianting all scene models

	for(var i = 0; i < sceneModels.length; i++ ) {

		drawModel( sceneModels[i], mvMatrix, primitiveType );
	}

	// Counting the frames
	countFrames();
}


//----------------------------------------------------------------------------
//
// Animation
//

var lastTime = 0;
var angle_diff = topAngle - frontAngle;	// difference between the top perspective angle and the front perspective angle

function animate() {

	var timeNow = new Date().getTime();

	if( lastTime != 0 ) {

		// Trigger Trap --------------------------------------

		trigger_trap();

		// ------------------------------------------------

		// Change Perspective -----------------------------

		if ( maze_rotation_ON ) {

			ball_cant_move = true;

			globalAngleYY -= saveGlobalAngleYY/angle_diff;	// corrects globalAngleYY

			if ( maze_rotation_DIR == -1 ) {

				globalAngleXX -= 1;

				globalTy -= maze_globalTy / angle_diff;	// wrong but close enough
				globalTz -= (sideSize * (wallsToBorder+1.35) + maze_globalTz) / angle_diff;	// correct

				// stopping condition

				if ( globalAngleXX % 360 <= frontAngle )
				{
					ball_cant_move = false;

					is_top_perspective = false;		// enable front perspective
					maze_rotation_ON = 0;
					maze_rotation_DIR = 1;
				}
			}
			else if ( maze_rotation_DIR ==  1 ) {

				globalAngleXX += 1;

				globalTy += maze_globalTy / angle_diff;
				globalTz += (sideSize * (wallsToBorder+1.4) + maze_globalTz) / angle_diff;

				// stopping condition

				if ( globalAngleXX % 360  >= topAngle )
				{
					ball_cant_move = false;

					is_top_perspective = true;		// enable top perspective
					maze_rotation_ON = 0;
					maze_rotation_DIR = -1;
				}
			}
		}

		// ------------------------------------------------


		// Ball Jump --------------------------------------

		if ( jump_ON ) {

			if ( jump_ITER < jump_END_ITER/2 ) {

				ball_jump("up");
				++jump_ITER;
			}
			else {
				ball_jump("down");
				++jump_ITER;
			}

			// stopping condition

			if ( jump_ITER == jump_END_ITER ) {	// iterations (number of animate() calls) required for jump animation
				jump_ON = 0;
				jump_ITER = 0;
			}
		}

		// ------------------------------------------------

		// Crystal Catch --------------------------------------

		if ( catch_ON ) {

			crystal_disappears();

			// stopping condition

			if( caught_crystals.length==0 )
				catch_ON = 0;
		}

		// ------------------------------------------------

		// Maze Swing --------------------------------------

		maze_swings();

		// ------------------------------------------------

		var elapsed = timeNow - lastTime;

		// Global rotation

		if( globalRotationXX_ON )
			globalAngleXX += globalRotationXX_DIR * globalRotationXX_SPEED * (90 * elapsed) / 1000.0;

		if( globalRotationYY_ON )
			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;

		if( globalRotationZZ_ON )
			globalAngleZZ += globalRotationZZ_DIR * globalRotationZZ_SPEED * (90 * elapsed) / 1000.0;


		// Local rotations

		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXOn )
				sceneModels[i].rotAngleXX += sceneModels[i].rotXXDir * sceneModels[i].rotXXSpeed * (90 * elapsed) / 1000.0;

			if( sceneModels[i].rotYYOn )
				sceneModels[i].rotAngleYY += sceneModels[i].rotYYDir * sceneModels[i].rotYYSpeed * (90 * elapsed) / 1000.0;

			if( sceneModels[i].rotZZOn )
				sceneModels[i].rotAngleZZ += sceneModels[i].rotZZDir * sceneModels[i].rotZZSpeed * (90 * elapsed) / 1000.0;
		}


		// light sources rotations

		for(var i = 0; i < lightSources.length; i++ )
	    {
			if( lightSources[i].isRotXXOn() ) {

				var angle = lightSources[i].getRotAngleXX() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
				lightSources[i].setRotAngleXX( angle );
			}

			if( lightSources[i].isRotYYOn() ) {

				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
				lightSources[i].setRotAngleYY( angle );
			}

			if( lightSources[i].isRotZZOn() ) {

				var angle = lightSources[i].getRotAngleZZ() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
				lightSources[i].setRotAngleZZ( angle );
			}
		}
	}

	lastTime = timeNow;
}


//----------------------------------------------------------------------------
//
// Handling keyboard events
//

var currentlyPressedKeys = {};

function handleKeys() {

	if (currentlyPressedKeys[38]) {	// up arrow

		rolling( "top" );

		ball_move_ty( ball_speed );
	}

	if (currentlyPressedKeys[40]) {	// down arrow

		rolling( "bottom" );

		ball_move_ty( ball_speed * -1 );
	}

	if (currentlyPressedKeys[39]) {	// right arrow

		rolling( "right" );

		ball_move_tx( ball_speed );
	}

	if (currentlyPressedKeys[37]) {	// left arrow
		
		rolling( "left" );

		ball_move_tx( ball_speed * -1 );
	}

	if (currentlyPressedKeys[16]) {	// shift

		if( jump_ON && jump_ITER == 0)
			jump_ON = 0;
		else
			jump_ON = 1;
	}

	if ( ! currentlyPressedKeys[38] && ! currentlyPressedKeys[40] ) {	// up / down arrows not pressed
		sceneModels[wall_i + 2].rotXXOn = 0;
	}
	if ( ! currentlyPressedKeys[39] && ! currentlyPressedKeys[37] ) {	// left / right arrows not pressed
		sceneModels[wall_i + 2].rotYYOn = 0;
	}
}


//----------------------------------------------------------------------------
//
// Handling mouse events
//

var mouseDown = false;

var lastMouseX = null;			// mouse events only allow to global rotate YY --- for now

function handleMouseDown(event) {
	
    mouseDown = true;
  
    lastMouseX = event.clientX;
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {
	  
      return;
    } 
  
    // Rotation angles proportional to cursor displacement
    
    var newX = event.clientX;  
    var deltaX = newX - lastMouseX;
    
    if( is_top_perspective )
    	globalAngleYY += radians( 10 * deltaX  );
    
    lastMouseX = newX;
    
}


//----------------------------------------------------------------------------

// Timer

function tick() {

	requestAnimFrame(tick);

	handleKeys();

	drawScene();

	animate();
}


//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){

}

//----------------------------------------------------------------------------

function setEventListeners( canvas ){

	// Handling the mouse
	
    canvas.onmousedown = handleMouseDown;
    
    document.onmouseup = handleMouseUp;
    
    document.onmousemove = handleMouseMove;
    

    // Handling the keyboard

    function handleKeyDown(event) {

        currentlyPressedKeys[event.keyCode] = true;
        // console.log("Pressing key: " + event.keyCode);
    }

    function handleKeyUp(event) {

        currentlyPressedKeys[event.keyCode] = false;
    }

	document.onkeydown = handleKeyDown;

    document.onkeyup = handleKeyUp;


	// Dropdown list

	var list = document.getElementById("rendering-mode-selection");

	list.addEventListener("click", function(){

		var mode = list.selectedIndex;

		switch(mode){

			case 0 : primitiveType = gl.TRIANGLES;
				break;

			case 1 : primitiveType = gl.LINE_LOOP;
				break;

		}
	});

	// Button events

	document.getElementById("maze-change-perspective").onclick = function(){

		saveGlobalAngleYY = globalAngleYY;	// used to reset this angle

		if( maze_rotation_ON && (globalAngleXX % 360  >= topAngle || globalAngleXX % 360  <= frontAngle) )
			maze_rotation_ON = 0;
		else
			maze_rotation_ON = 1;

	};

}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {		// initial state

		// Create the WebGL context

		// Some browsers still need "experimental-webgl"
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		// DEFAULT: The viewport occupies the whole canvas

		// background color
		gl.clearColor(1, 1, 0, 0.5);

		primitiveType = gl.TRIANGLES;

		// Enable FACE CULLING --- BACK FACE is culled
		gl.enable( gl.CULL_FACE );

		// Enable DEPTH-TEST
		gl.enable( gl.DEPTH_TEST );

		// initial global transformations
		globalAngleXX = topAngle;
		globalTy = maze_globalTy;
		globalTz = maze_globalTz;
		globalRotationXX_DIR = maze_rotation_DIR;
		saveGlobalAngleYY = globalAngleYY;

	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

//----------------------------------------------------------------------------

function runWebGL() {

	var canvas = document.getElementById("my-canvas");

	initWebGL( canvas );

	shaderProgram = initShaders( gl );

	setEventListeners( canvas );

	tick();		// A timer controls the rendering / animation

	outputInfos();
}
