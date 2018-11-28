//----------------------------------------------------------------------------
//
//  Model functions / interface
//


//----------------------------------------------------------------------------
//
//	Movement
//
//	top perspective:
//		ball moves in the speed direction
//
//	front perspective:
//		walls, floor and crystals move in the opposite direction of the speed
//
//	the ball can't cross walls
//	the ball can't leave the maze
//	the ball can collide with crystals to trigger animations
//

function ball_move_tx( speed ) {

	if ( ball_cant_move ) {
		return;
	}

	catch_crystal_tx( speed );


	if (is_top_perspective) {			// TOP PERSPECTIVE

		// NORMAL movement

		ballModel.tx += speed * speed_constant();

		//

		step_trap();

		// don't pass maze boundaries --- restore previous position

		if (ballModel.tx +ballModel.sx> 1 || ballModel.tx -ballModel.sx< -1) {

			ballModel.tx += speed * speed_constant() * -1;
		}
		else {

			// right COLLISION --- restore previous position

			right_colision( speed );

			// left COLLISION --- restore previous position

			left_colision( speed );
		}

	}
	else {								// FRONT PERSPECTIVE

		// NORMAL movement

		front_movement_tx( speed * -1 );

		//

		step_trap();

		// don't pass maze boundaries --- restore previous position

		if( floorModel.tx +ballModel.sx > 1 || floorModel.tx -ballModel.sx < -1 )
		{
			front_movement_tx( speed );
		}
		else {

			// right COLLISION --- restore previous position

			right_colision( speed );

			// left COLLISION --- restore previous position

			left_colision( speed );
		}

	}
}

function ball_move_ty( speed ) {


	if ( ball_cant_move ) {
		return;
	}

	catch_crystal_ty( speed );

	if (is_top_perspective) {			// TOP PERSPECTIVE

		// NORMAL movement

		ballModel.ty += speed * speed_constant();

		//

		step_trap();

		// don't pass maze boundaries --- restore previous position

		if ( ballModel.ty +ballModel.sy > 1 || ballModel.ty -ballModel.sy < -1 )
		{
			ballModel.ty += speed * speed_constant() * -1;
		}
		else
		{

			// top COLLISION --- restore previous position

			top_colision( speed );

			// bottom COLLISION --- restore previous position

			bottom_colision( speed );
		}

	}

	else {								// FRONT PERSPECTIVE

		// NORMAL movement

		front_movement_ty( speed * -1 );

		//

		step_trap();

		// don't pass maze boundaries --- restore previous position

		var floor_position = floorModel.ty -sideSize/2;
		if ( floor_position +ballModel.sy  > 0 || floor_position -ballModel.sy < -2 )
		{
			front_movement_ty( speed );
		}
		else
		{

			// top COLLISION --- restore previous position

			top_colision( speed );

			// bottom COLLISION --- restore previous position

			bottom_colision( speed );
		}

	}
}


//----------------------------------------------------------------------------
//
//	Other animations
//
// 	- ball jumps
//	- ball rolls
//	- crystals disappear
//	- maze swings
//	- step trap
//	- step trap
//	- trigger trap
//

var jump_speed = 3;
function ball_jump( state ) {

	if ( ball_cant_move ) {
		return;
	}

	if (is_top_perspective) {			// TOP PERSPECTIVE

		if( state=="up" ){
			ballModel.tz += jump_speed * speed_constant();
		}
		else {
			ballModel.tz += jump_speed * speed_constant() * -1;
		}

	}
	else {								// FRONT PERSPECTIVE
		
		if( state=="up" ){
			globalTy -= 0.002;		// a temporary attempt see a little bellow during the jump
			front_movement_tz( jump_speed * -1 );
		}
		else {
			globalTy += 0.002;
			front_movement_tz( jump_speed );
		}

	}
}

function rolling( direction ) {

	if ( ball_cant_move ) {
		return;
	}

	if( ! ballModel.rotYYOn && direction=="top") {
		ballModel.rotXXOn = 1;
		ballModel.rotXXDir =-1;
	}
	if( ! ballModel.rotYYOn && direction=="bottom") {
		ballModel.rotXXOn = 1;
		ballModel.rotXXDir = 1;
	}
	if( ! ballModel.rotYYOn && direction=="right") {
		ballModel.rotYYOn = 1;
		ballModel.rotYYDir = 1;
	}
	if( ! ballModel.rotYYOn && direction=="left") {
		ballModel.rotYYOn = 1;
		ballModel.rotYYDir = -1;
	}
}

var top_persp_speed = 0.6;
var front_persp_speed = 0.4;

function crystal_disappears() {

	for(var i=0; i<caught_crystals.length; i++) {	// to all caught crystals

		var index = caught_crystals[i];

		// transformations
		
		if( is_top_perspective )
			sceneModels[index].tz += top_persp_speed * speed_constant();
		else
			sceneModels[index].tz += front_persp_speed * speed_constant();

		sceneModels[index].rotZZSpeed += 20 / 100;
		sceneModels[index].sx -= (0.15/dim) / 100;
		sceneModels[index].sy -= (0.15/dim) / 100;
		sceneModels[index].sz -= (0.6/dim) / 100;

		// lights
		
		lightSources[0].setRotationSpeed( 10 );
		lightSources[0].setIntensity( 0.8, 0.8, 1.5 );
		lightSources[1].setIntensity( 0.8, 0.8, 1.5 );

		// update crystals caught
		if ( sceneModels[index].sx <= 0 )
			caught_crystals.splice( i, 1 );
	}

	if( caught_crystals.length==0 ) {
		// restore lights settings
		lightSources[0].setRotationSpeed( 3 );
		lightSources[0].setIntensity( 1.2, 1.2, 1.2 );
		lightSources[1].setIntensity( 1.2, 1.2, 1.2 );
	}
}

function maze_swings() {

	if( ! is_top_perspective ) {		// maze swings if front perspective

		if( swing_dir==1 ) {
			globalAngleZZ += 0.08;
			if( globalAngleZZ > 5 )
				swing_dir=0;
		}
		else {
			globalAngleZZ -= 0.08;
			if( globalAngleZZ < -5 )
				swing_dir=1;
		}
	}
	else
		globalAngleZZ -= globalAngleZZ;	// corrects globalAngleZZ ---  could be smoother
}

function step_trap() {

	if (((ballModel.tz<=floorModel.sz + ballModel.sz + 0.01) && is_top_perspective)
		|| (floorModel.tz>=0-0.01 && ! is_top_perspective))
	{			// if the ball is not jumping

		var ball_i = ball_compute_index();	// get ball index in map

		if( maze_map[ball_i] == 4 ) {	// found stepped trap index in maze map

			var begin = trap_i-traps_number;
			var end = sceneModels.length;

			for(var i=begin; i<end; i++) {

				if( ball_i==sceneModels[i].map_i ) {	// found model index

					// animation
					sceneModels[i].sz = 0.2/dim;
					sceneModels[i].tz = floorModel.sz + sceneModels[i].sz;

					lightSources[0].switchOff();
					lightSources[1].switchOff();
					lightSources[2].switchOff();
					lightSources[3].switchOff();
					lightSources[4].switchOn();

					trap_triggered_i = i;
					ball_cant_move = true;
				}
			}
		}
	}
}

function trigger_trap() {

	if ( trap_triggered_i!=-1 ) {		// can be improve by local rotating the ball to end up aligned with the floor

		if( ballModel.sz>0 ) {
			ballModel.sx -= (0.4/dim)/500;
			ballModel.sy -= (0.4/dim)/500;
			ballModel.sz -= (0.4/dim)/500;
			ballModel.tz = floorModel.sz + ballModel.sz;
		}

		if( death_light_intensity > 0 )
			death_light_intensity -= 0.02;
		lightSources[4].setIntensity( death_light_intensity, 0.0, 0.0 );
	}
}


//----------------------------------------------------------------------------
//
// Models auxiliar functions
//
// 	- speed_constant
//		allow proportional speed in mazes with different dimensions
//
//	- front_movement_tx
//	- front_movement_ty
//	- front_movement_tz
//		regular state movement in front perspective
//
//	- get_model_on_right
//	- get_model_on_left
//	- get_model_on_top
//	- get_model_on_bottom
//		get map index of model next to given the model or -1 if there isn't one
//
//	- ball_compute_index
//		get current map index of the ball
//
//	- catch_crystal_tx
//	- catch_crystal_ty
//		when the ball collides with crystals, triggers crystals disappear animation
//
//	- right_colision
//	- left_colision
//	- top_colision
//	- bottom_colision
//		when the ball collides with walls, ie, when a wall is crossed, the previous
//		ball postion is restored
//
//	- coordinates
//		saves coordinates and map index of a model
//

function speed_constant() {

	// sideSize => allows proportional speed in mazes with different dimensions
	// 0.03 => regulates speed
	return sideSize * 0.03;	

}

function front_movement_tx( speed ) {
	
	for(var i = 0; i <= wall_i; i++ ) {
		sceneModels[i].tx += speed * speed_constant();
	}
	
	floorModel.tx += speed * speed_constant();

	for(var i = wall_i+3; i < sceneModels.length; i++ ) {
		sceneModels[i].tx += speed * speed_constant();
	}
}
function front_movement_ty( speed ) {
	
	for(var i = 0; i <= wall_i; i++ ) {
		sceneModels[i].ty += speed * speed_constant();
	}
	
	floorModel.ty += speed * speed_constant();

	for(var i = wall_i+3; i < sceneModels.length; i++ ) {
		sceneModels[i].ty += speed * speed_constant();
	}
}
function front_movement_tz( speed ) {
	
	for(var i = 0; i <= wall_i; i++ ) {
		sceneModels[i].tz += speed * speed_constant();
	}

	floorModel.tz += speed * speed_constant();

	for(var i = wall_i+3; i < sceneModels.length; i++ ) {
		sceneModels[i].tz += speed * speed_constant();
	}
}

function get_model_on_right( i ) {	// return right model index OR -1

	if ( maze_map[i+1]==1 && (i+1)%dim!=0 )		// IF wall on right AND is not last in row
		return i+1;	// index of the wall on the right

	return -1;		// no wall on the right
}

function get_model_on_left( i ) {	// return left model index OR -1

	if ( maze_map[i-1]==1 && i%dim!=0 )
		return i-1;

	return -1;
}

function get_model_on_top( i ) {	// return top model index OR -1

	if ( maze_map[i+dim]==1 && typeof maze_map[i+dim]!="undefined" )
		return i+dim;

	return -1;
}

function get_model_on_bottom( i ) {	// return bottom model index OR -1

	if ( maze_map[i-dim]==1 && typeof maze_map[i-dim]!="undefined" )
		return i-dim;

	return -1;
}


function ball_compute_index() {

	var x_i = 0;	// horizontal index, goes from 0 (left) to dim-1 (right)
	var y_i = 0;	// vertical index, goes from 0 (bottom) to dim-1 (top)

	if ( is_top_perspective )			// TOP PERSPECTIVE
	{

		var x = -1;
		var y = -1;

		for (var i=0; i<dim; ++i) {

			// left to right
			if ( x < ballModel.tx && ballModel.tx <= (x + sideSize))
				x_i = i;

			x += sideSize;

			// bottom to top
			if (y < ballModel.ty && ballModel.ty <= (y + sideSize))
				y_i = i;

			y += sideSize;
		}

	}
	else {								// FRONT PERSPECTIVE

		// using floorModel to find ball position
		// floorModel moves in the opposite direction of the movement requested --- ex: IF move right THEN floor moves left

		var x = 1;	// start in right border
					// instead of x=-1 (left border) because the floor moves in the opposite direction

		var y = 1 -1 +sideSize/2;	// start in bottom border ( y=1 )
									// instead of y=-1 (top border) because the floor moves in the opposite direction
									// we need ball position ( x=0, y= -1+sideSize/2 ), not wall position ( x=0, y=0 )

		for (var i=0; i<dim; ++i) {

			// left to right --- floor is going from (+) to (-)
			if (floorModel.tx < x && floorModel.tx >= (x - sideSize))
				x_i = i;

			x -= sideSize;

			// bottom to top
			if (floorModel.ty < y && floorModel.ty >= (y - sideSize))
				y_i = i;

			y -= sideSize;
		}
	}

	var ball_i = x_i + y_i*dim;

	return ball_i;
}

function catch_crystal_tx( speed ) {

	var ball_i = ball_compute_index();	// get ball index in map

	for(var i=wall_i+3; i<sceneModels.length-traps_number; ++i) {

		if ( ball_i==sceneModels[i].map_i ) {	// found crystal near by / get crystal index

			if ( sceneModels[i].sx>0 ) {		// IF crystal didn't disappear

				if ( speed>0 ) {	// IF moving to right

					// compute left border of crystal
					var crystal_border = sceneModels[i].tx-sceneModels[i].sx;
					// compute border of ball
					var ball_border = sceneModels[wall_i +2 ].tx+sceneModels[wall_i +2 ].sx;

					if ( crystal_border - ball_border < 0 ) {	// IF both boders touch

						if( ! caught_crystals.includes(i) ) {
							catch_ON = 1;
							caught_crystals.push( i );
						}
					}

				}
				else {		// IF moving to left

					// compute right border of crystal
					var crystal_border = sceneModels[i].tx+sceneModels[i].sx;
					// compute border of ball
					var ball_border = sceneModels[wall_i +2 ].tx-sceneModels[wall_i +2 ].sx;

					if ( crystal_border - ball_border > 0 ) {	// IF both boders touch

						if( ! caught_crystals.includes(i) ) {
							catch_ON = 1;
							caught_crystals.push( i );
						}
					}

				}
			}
			break;
		}
	}
}

function catch_crystal_ty( speed ) {

	var ball_i = ball_compute_index();	// get ball index in map

	for(var i=wall_i+3; i<sceneModels.length-traps_number; ++i) {

		if ( ball_i==sceneModels[i].map_i ) {	// found crystal near by / get crystal index

			if ( sceneModels[i].sx>0 ) {		// IF crystal didn't disappear

				if ( speed>0 ) {	// IF moving front

					// compute bottom border of crystal
					var crystal_border = sceneModels[i].ty-sceneModels[i].sy;
					// compute border of ball
					var ball_border = sceneModels[wall_i +2 ].ty+sceneModels[wall_i +2 ].sy;

					if ( crystal_border - ball_border < 0 ) {	// IF both boders touch

						if( ! caught_crystals.includes(i) ) {
							catch_ON = 1;
							caught_crystals.push( i );
						}
					}

				}
				else {		// IF moving bottom

					// compute top border of crystal
					var crystal_border = sceneModels[i].ty+sceneModels[i].sy;
					// compute border of ball
					var ball_border = sceneModels[wall_i +2 ].ty-sceneModels[wall_i +2 ].sy;

					if ( crystal_border - ball_border > 0 ) {	// IF both boders touch

						if( ! caught_crystals.includes(i) ) {
							catch_ON = 1;
							caught_crystals.push( i );
						}
					}

				}
			}
			break;
		}
	}
}

function right_colision( speed ) {

	var ball_i = ball_compute_index();	// get ball index in map

	var right_wall_i = get_model_on_right( ball_i );	// get index of wall on right

	if ( right_wall_i!=-1 ) {		// IF wall on right

		for(var i=0; i<=wall_i; ++i) {

			if ( right_wall_i == sceneModels[i].map_i ) {	// found / get model of wall on the right

				// compute border of wall on the right
				var right_wall_border = sceneModels[i].tx-sceneModels[i].sx;
				// compute border of ball
				var ball_border = sceneModels[wall_i +2 ].tx+sceneModels[wall_i +2 ].sx;

				if ( right_wall_border - ball_border < 0 ) {	// IF both boders touch


					if ( is_top_perspective ) {			// TOP PERSPECTIVE

						ballModel.tx += speed * speed_constant() * -1;	// restore ball previous position
					}
					else {								// FRONT PERSPECTIVE

						front_movement_tx( speed );	// restore walls, floor and crystals previous position
					}


				}
				break;
			}
		}
	}
}

function left_colision( speed ) {

	var ball_i = ball_compute_index();	// get ball index in map

	var left_wall_i = get_model_on_left( ball_i );	// get index of wall on left

	if ( left_wall_i!=-1 ) {		// IF wall on left

		for(var i=0; i<=wall_i; ++i) {

			if ( left_wall_i == sceneModels[i].map_i ) {	// found / get model of wall on the left

				var left_wall_border = sceneModels[i].tx+sceneModels[i].sx;
				var ball_border = sceneModels[wall_i +2 ].tx-sceneModels[wall_i +2 ].sx;

				if ( left_wall_border - ball_border > 0 ) {	// IF both boders touch


					if ( is_top_perspective ) {			// TOP PERSPECTIVE

						ballModel.tx += speed * speed_constant() * -1;	// restore ball previous position
					}
					else {								// FRONT PERSPECTIVE

						front_movement_tx( speed );	// restore walls, floor and crystals previous position
					}


				}
				break;
			}
		}
	}
}

function top_colision( speed ) {
	
	var ball_i = ball_compute_index();	// get ball index in map

	var top_wall_i = get_model_on_top( ball_i );	// get index of wall on top

	if ( top_wall_i!=-1 ) {		// IF wall on top

		for(var i=0; i<=wall_i; ++i) {

			if ( top_wall_i == sceneModels[i].map_i ) {	// found / get model of wall on the top

				var top_wall_border = sceneModels[i].ty-sceneModels[i].sy;
				var ball_border = sceneModels[wall_i +2 ].ty+sceneModels[wall_i +2 ].sy;

				if ( top_wall_border - ball_border < 0 ) {	// IF both boders touch


					if ( is_top_perspective ) {			// TOP PERSPECTIVE

						ballModel.ty += speed * speed_constant() * -1;	// restore ball previous position
					}
					else {								// FRONT PERSPECTIVE

						front_movement_ty( speed );	// restore walls, floor and crystals previous position
					}

						
				}
				break;
			}
		}
	}
}

function bottom_colision( speed ) {

	var ball_i = ball_compute_index();	// get ball index in map

	var bottom_wall_i = get_model_on_bottom( ball_i );	// get index of wall on bottom

	if ( bottom_wall_i!=-1 ) {		// IF wall on bottom

		for(var i=0; i<=wall_i; ++i) {

			if ( bottom_wall_i == sceneModels[i].map_i ) {	// found / get model of wall on the bottom

				var bottom_wall_border = sceneModels[i].ty+sceneModels[i].sy;
				var ball_border = sceneModels[wall_i +2 ].ty-sceneModels[wall_i +2 ].sy;

				if ( bottom_wall_border - ball_border > 0 ) {	// IF both boders touch


					if ( is_top_perspective ) {			// TOP PERSPECTIVE

						ballModel.ty += speed * speed_constant() * -1;	// restore ball previous position
					}
					else {								// FRONT PERSPECTIVE

						front_movement_ty( speed );	// restore walls, floor and crystals previous position
					}

						
				}
				break;
			}
		}
	}
}

function coordinates( i, x, y ) {
    this.map_i = i; // save map position
    this.x = x;
    this.y = y;
}
