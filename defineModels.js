//----------------------------------------------------------------------------
//
//  Models definitions
//

//----------------------------------------------------------------------------
//
//	emptyModelFeatures
//
//	wallModelFeatures
//	ballModelFeatures
//	floorModelFeatures
//	crystalModelFeatures
//
//	wallModel
//	ballModel
//	floorModel
//	crystalModel
//
//	getVertices
//	getMaterial
//

function emptyModelFeatures() {

	// common features to all models

	this.vertices = [];
	this.normals = [];

	// Transformation parameters

	// Displacement vector

	this.tx = 0.0;
	this.ty = 0.0;
	this.tz = 0.0;

	// Rotation angles

	this.rotAngleXX = 0.0;
	this.rotAngleYY = 0.0;
	this.rotAngleZZ = 0.0;

	// Scaling factors

	this.sx = 1.0;
	this.sy = 1.0;
	this.sz = 1.0;

	// Animation controls

	this.rotXXOn = false;
	this.rotYYOn = false;
	this.rotZZOn = false;

	this.rotXXSpeed = 1.0;
	this.rotYYSpeed = 1.0;
	this.rotZZSpeed = 1.0;

	this.rotXXDir = 1;
	this.rotYYDir = 1;
	this.rotZZDir = 1;

	// Material features

	this.kAmbi = [ 0.2, 0.2, 0.2 ];
	this.kDiff = [ 0.7, 0.7, 0.7 ];
	this.kSpec = [ 0.7, 0.7, 0.7 ];
	this.nPhong = 100;
}


function wallModelFeatures() {

	var wall = new emptyModelFeatures();

	// index in the maze_map

	wall.map_i = -1;

	// Material features

	var mat = new getMaterial().polishedSilver;
	wall.kAmbi = mat[0];
	wall.kDiff = mat[1];
	wall.kSpec = mat[2];
	wall.nPhong = mat[3];

	return wall;
}


function floorModelFeatures() {

	var floor = new emptyModelFeatures();

	// Material features

	var mat = new getMaterial().polishedSilver;
	floor.kAmbi = mat[0];
	floor.kDiff = mat[1];
	floor.kSpec = mat[2];
	floor.nPhong = mat[3];

	return floor;
}


function ballModelFeatures() {

	var ball = new emptyModelFeatures();

	// rolling speed

	ball.rotXXSpeed = 3.0;

	ball.rotYYSpeed = 3.0;

	// Material features

	var mat = new getMaterial().brightBlue;
	ball.kAmbi = mat[0];
	ball.kDiff = mat[1];
	ball.kSpec = mat[2];
	ball.nPhong = mat[3];

	return ball;
}

function crystalModelFeatures() {

	var crystal = new emptyModelFeatures();

	// index in the maze_map

	crystal.map_i = -1;

	// rotation

	crystal.rotZZOn = true;

	crystal.rotZZSpeed = 2.5;

	// Material features

	var mat = new getMaterial().bronze;
	crystal.kAmbi = mat[0];
	crystal.kDiff = mat[1];
	crystal.kSpec = mat[2];
	crystal.nPhong = mat[3];

	return crystal;
}

function trapModelFeatures() {

	var trap = new emptyModelFeatures();

	// index in the maze_map

	trap.map_i = -1;

	// Material features

	var mat = new getMaterial().redPlastic;
	trap.kAmbi = mat[0];
	trap.kDiff = mat[1];
	trap.kSpec = mat[2];
	trap.nPhong = mat[3];

	return trap;
}


function wallModel( subdivisionDepth = 0, get_model_on_right, get_model_on_left, get_model_on_top, get_model_on_bottom ) {

	var wall = new wallModelFeatures();

	var vertices = new getVertices();

	// set some attributes

	wall.has_right_face = get_model_on_right == -1;	// IF NO model on right THEN has right face
	wall.has_left_face = get_model_on_left == -1;
	wall.has_top_face = get_model_on_top == -1;
	wall.has_bottom_face = get_model_on_bottom == -1;

	// enable faces

	if( get_model_on_right == -1 )	// IF NO model on right THEN has right face
		wall.vertices = wall.vertices.concat(vertices.xp);

	if( get_model_on_left == -1 )
		wall.vertices = wall.vertices.concat(vertices.xn);
	
	if( get_model_on_top == -1 )
		wall.vertices = wall.vertices.concat(vertices.yp);
	
	if( get_model_on_bottom == -1 )
		wall.vertices = wall.vertices.concat(vertices.yn);

	// front is always visible --- back is never visible
	wall.vertices = wall.vertices.concat(vertices.zp);

	midPointRefinement( wall.vertices, subdivisionDepth );

	computeVertexNormals( wall.vertices, wall.normals );

	return wall;
}

function floorModel( subdivisionDepth = 0 ) {

	var square = new floorModelFeatures();

	var vertices = new getVertices();

	// front --- vertices represent a square oriented to front
	square.vertices = vertices.zp;

	midPointRefinement( square.vertices, subdivisionDepth );

	computeVertexNormals( square.vertices, square.normals );

	return square;
}

function ballModel( subdivisionDepth = 0 ) {

	var ball = new ballModelFeatures();

	var vertices = new getVertices();

	ball.vertices = [].concat.apply([], [		// this is a cube model
		vertices.xp,	// right --- vertices represent a square oriented to right
		vertices.xn,	// left
		vertices.yp,	// top
		vertices.yn,	// bottom
		vertices.zp,	// front
		vertices.zn,	// back
	]);

	midPointRefinement( ball.vertices, subdivisionDepth );

	moveToSphericalSurface( ball.vertices )	// now it's a sphere model

	computeVertexNormals( ball.vertices, ball.normals );

	return ball;
}

function crystalModel( subdivisionDepth = 0 ) {

	var crystal = new crystalModelFeatures();

	var vertices = new getVertices();

	crystal.vertices = [].concat.apply([], [
		vertices.xp,	// right
		vertices.xn,	// left
		vertices.yp,	// top
		vertices.yn,	// bottom
		vertices.zp,	// front
		vertices.zn,	// back
	]);

	midPointRefinement( crystal.vertices, subdivisionDepth );

	moveToSphericalSurface( crystal.vertices )	// now it's a sphere model

	computeVertexNormals( crystal.vertices, crystal.normals );

	return crystal;
}

function trapModel( subdivisionDepth = 0 ) {

	var trap = new trapModelFeatures();

	var vertices = new getVertices();

	trap.vertices = [].concat.apply([], [
		vertices.xp,	// right
		vertices.xn,	// left
		vertices.yp,	// top
		vertices.yn,	// bottom
		vertices.zp,	// front
	]);

	midPointRefinement( trap.vertices, subdivisionDepth );

	computeVertexNormals( trap.vertices, trap.normals );

	return trap;
}


function getVertices() {

	this.xp = [	// right
		 1.000000, -1.000000,  1.000000,
         1.000000, -1.000000, -1.000000,
		 1.000000,  1.000000, -1.000000,
         1.000000, -1.000000,  1.000000,
         1.000000,  1.000000, -1.000000,
         1.000000,  1.000000,  1.000000,
	];

	this.xn = [	// left
        -1.000000, -1.000000, -1.000000,
		-1.000000, -1.000000,  1.000000,
		-1.000000,  1.000000,  1.000000,
		-1.000000, -1.000000, -1.000000,
		-1.000000,  1.000000,  1.000000,
		-1.000000,  1.000000, -1.000000,
	] ;

	this.yp = [	// top
		 1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000,  1.000000,
		 1.000000,  1.000000, -1.000000,
		-1.000000,  1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
	];

	this.yn = [	// bottom
		-1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000,  1.000000,
		-1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000,  1.000000,
		-1.000000, -1.000000,  1.000000,
	];

	this.zp = [	// front
		-1.000000, -1.000000,  1.000000,
		 1.000000, -1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
		-1.000000, -1.000000,  1.000000,
		 1.000000,  1.000000,  1.000000,
		-1.000000,  1.000000,  1.000000,
	];

	this.zn = [	// back
         1.000000, -1.000000, -1.000000,
        -1.000000, -1.000000, -1.000000,
        -1.000000,  1.000000, -1.000000,
         1.000000, -1.000000, -1.000000,
        -1.000000,  1.000000, -1.000000,
         1.000000,  1.000000, -1.000000,
	];

}

function getMaterial() {

	this.bronze = [
		[ 0.21, 0.13, 0.05 ],
		[ 0.71, 0.43, 0.18 ],
		[ 0.39, 0.27, 0.17 ],
		[25.6]
	];

	this.chromium = [
		[ 0.25, 0.25, 0.25 ],
		[ 0.4, 0.4, 0.4 ],
		[ 0.77, 0.77, 0.77 ],
		[76.8]
	];

	this.brass = [
		[ 0.33, 0.22, 0.03 ],
		[ 0.78, 0.57, 0.11 ],
		[ 0.99, 0.94, 0.81 ],
		[27.9]
	];

	this.gold = [
		[ 0.25, 0.20, 0.07 ],
		[ 0.75, 0.60, 0.23 ],
		[ 0.63, 0.56, 0.37 ],
		[51.2]
	];

	this.polishedGold = [
		[ 0.25, 0.22, 0.06 ],
		[ 0.35, 0.31, 0.09 ],
		[ 0.80, 0.73, 0.21 ],
		[83.2]
	];

	this.polishedSilver = [
		[ 0.23, 0.23, 0.23 ],
		[ 0.28, 0.28, 0.28 ],
		[ 0.77, 0.77, 0.77 ],
		[89.6]
	];

	this.brightBlue = [
		[ 0.0, 0.0, 0.5 ],
		[ 0.0, 0.0, 1.0 ],
		[ 1.0, 1.0, 1.0 ],
		[125.0]
	];

	this.redPlastic = [
		[ 0.3, 0.0, 0.0 ],
		[ 0.6, 0.0, 0.0 ],
		[ 0.8, 0.6, 0.6 ],
		[32.0]
	];

	this.grey = [
		[ 0.1, 0.1, 0.1 ],
		[ 0.5, 0.5, 0.5 ],
		[ 0.7, 0.7, 0.7 ],
		[1.0]
	];
}
