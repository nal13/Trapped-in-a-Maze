//----------------------------------------------------------------------------
//
//  Instantiating scene models
//

//----------------------------------------------------------------------------
//
//  Instantiate wall models
//

// remove newLines and reverse string maze
maze = reverse( maze.replace(/\n/g, '') );

// dim = sqrt( height * width )  // maze dimension must be a perfect square 2*2 3*3 4*4
var dim = Math.sqrt(maze.length);

// array that maps the position of the models in the maze
// 0 => empty, 1 => wall, 2=> ball
var maze_map = new Array( maze.length ).fill(1);	// fill with walls

// map empty spaces
for(var i=0; i<maze.length; ++i) {
	if(maze[i]==' ')
		maze_map[i] = 0;
}
var emptySpaces_count = 0;

// wall side size --- this is our TRANSLATION UNIT
var sideSize = 2/dim;				// why 2/dim => canvas is width and height are 2, not 1

// number of walls to reach top/left border
var wallsToBorder = (dim-1)/2;

// xx start left to right
var xx = - sideSize * wallsToBorder;	// same as -1 +sideSize/2, ie, left_border - half_wall_side
// yy starts bottom to top
var yy = - sideSize * wallsToBorder;

// store wall models
var sceneModels = [];

// wall model index --- after all instantiated, get number(+1) of walls with it
var wall_i = 0;

var spaces = [];

for (var i=0; i<maze_map.length; ++i) {

	// can pass discontinuous index to sceneModels
	wall_i = i - emptySpaces_count;

	// if space => no model in this map index
	if( maze_map[i]===1 ) {

		// instantiate wall model
		sceneModels.push( new wallModel(
			3,
			get_model_on_right( i ),
			get_model_on_left( i ),
			get_model_on_top( i ),
			get_model_on_bottom( i )
		));

		// set model variables
		sceneModels[wall_i].tx = xx;
		sceneModels[wall_i].ty = yy;
		sceneModels[wall_i].sx = 1.0/dim;		// this.sx *2 == sideSize
		sceneModels[wall_i].sy = 1.0/dim;
		sceneModels[wall_i].sz = 1.0/dim;
		sceneModels[wall_i].map_i = i;			// save map position

	}
	if( maze_map[i]==0 ) {
		++emptySpaces_count;
		spaces.push( new coordinates( i, xx, yy ) );	// save free space index and coordinates
	}

	// next model goes left of xx
	xx += sideSize;
	// if passes xx border: begin xx in left and yy goes 1 up
	if( (i+1)%dim==0 ) {
		xx = - sideSize * wallsToBorder;
		yy += sideSize;
	}
}


//----------------------------------------------------------------------------
//
//  Instantiate floor model
//

// instantiate floor model
sceneModels.push( new floorModel( 5 ) );
// set model variables
var floorModel = sceneModels[ wall_i+1 ];
floorModel.tx = 0;
floorModel.ty = 0;
floorModel.tz = 0;
floorModel.sx = 1;
floorModel.sy = 1;
floorModel.sz = - sideSize / 2;


//----------------------------------------------------------------------------
//
//  Instantiate ball model
//

// instantiate ball model
sceneModels.push( new ballModel( 3 ) );
// set model variables
var ballModel = sceneModels[ wall_i+2 ];
ballModel.tx = 0;
ballModel.ty = - sideSize * wallsToBorder;
ballModel.sx = 0.4/dim;
ballModel.sy = 0.4/dim;
ballModel.sz = 0.4/dim;
ballModel.tz = floorModel.sz + ballModel.sz;


//----------------------------------------------------------------------------
//
//  Instantiate cystal models
//

var spaces_number = maze_map.length - (wall_i+1);

// number of crystals --- proportional to amount of free spaces and maze dimension
var crystals_number = Math.ceil(spaces_number*2 / dim);

var crystal_i = sceneModels.length-1;	// index before first crystal

for(var i=0; i<crystals_number; ++i){

	crystal_i += 1;

	var random_space_i = Math.floor(Math.random() * spaces.length);

	// instantiate crystal model
	sceneModels.push( new crystalModel( 1 ) );
	// set model variables
	sceneModels[crystal_i].tx = spaces[random_space_i].x;	// place randomly by the free spaces
	sceneModels[crystal_i].ty = spaces[random_space_i].y;
	sceneModels[crystal_i].sx = 0.15/dim;
	sceneModels[crystal_i].sy = 0.15/dim;
	sceneModels[crystal_i].sz = 0.6/dim;
	sceneModels[crystal_i].tz = floorModel.sz + sceneModels[crystal_i].sz;

	map_i = spaces[random_space_i].map_i;

	sceneModels[crystal_i].map_i = map_i;	// save map position
	maze_map[ map_i ] = 3;

	spaces.splice(random_space_i, 1);	// remove free space so it can't be reused
}


//----------------------------------------------------------------------------
//
//  Instantiate cystal models
//

// number of traps
var traps_number = Math.floor( spaces_number / dim);

var trap_i = sceneModels.length-1;	// index before first trap

for(var i=0; i<traps_number; ++i){

	trap_i += 1;

	var random_space_i = Math.floor(Math.random() * spaces.length);

	// instantiate trap model
	sceneModels.push( new trapModel( 3 ) );
	// set model variables
	sceneModels[trap_i].tx = spaces[random_space_i].x;	// place randomly by the free spaces
	sceneModels[trap_i].ty = spaces[random_space_i].y;
	sceneModels[trap_i].sx = 1.0/dim;
	sceneModels[trap_i].sy = 1.0/dim;
	sceneModels[trap_i].sz = 0.05/dim;
	sceneModels[trap_i].tz = floorModel.sz + sceneModels[trap_i].sz;

	map_i = spaces[random_space_i].map_i;

	sceneModels[trap_i].map_i = map_i;	// save map position
	maze_map[ map_i ] = 4;

	spaces.splice(random_space_i, 1);	// remove free space so it can't be reused
}
