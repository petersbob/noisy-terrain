function generateVerticies() {

    let grid_width = 50;
    let nRV = []; // nonRepeated Verticies

    for (let i=0;i<grid_width;i++) {
	for(let j=0;j<grid_width;j++) {
	    const x = i*40;
	    const z = j*40;
	    const y = noise(x,z) * 300;
	    
	    nRV.push(x,y,z);
	}
    }

    let width = grid_width;

    let verticies = [];

    for(let i=0;i<width-1;i++) {
	for(let j=0;j<width-1;j++) {
	    verticies.push(
		// first triangle
		nRV[(j+width*i)*3],nRV[(j+width*i)*3+1],nRV[(j+width*i)*3+2],

		nRV[(j+1+width*i)*3],nRV[(j+1+width*i)*3+1],nRV[(j+1+width*i)*3+2],

		nRV[(j+width+width*i)*3],nRV[(j+width+width*i)*3+1],nRV[(j+width+width*i)*3+2],

		nRV[(j+1+width*i)*3],nRV[(j+1+width*i)*3+1],nRV[(j+1+width*i)*3+2],
		
		nRV[(j+width+1+width*i)*3],nRV[(j+width+1+width*i)*3+1],nRV[(j+width+1+width*i)*3+2],

		nRV[(j+width+width*i)*3],nRV[(j+width+width*i)*3+1],nRV[(j+width+width*i)*3+2]
	    )
	}
    }

    return verticies;

}

function generateNormals(verticies) {

    function arraySub(a,b) {
	// array a - array b
	return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
    }

    function cross(vector1, vector2) {
	let result = new Array(3);
	result[0] = vector1[1]*vector2[2] - vector1[2]*vector2[1];
	result[1] = vector1[2]*vector2[0] - vector1[0]*vector2[2];
	result[2] = vector1[0]*vector2[1] - vector1[1]*vector2[0];
	return result;
    }

    let normals = [];

    for(let i=0;i<verticies.length;i+=9) {

	let pointA = [verticies[i+0],verticies[i+1],verticies[i+2]];
	let pointB = [verticies[i+3],verticies[i+4],verticies[i+5]];
	let pointC = [verticies[i+6],verticies[i+7],verticies[i+8]];

	const normal = cross(arraySub(pointC,pointA),arraySub(pointB,pointA));
	
	normals.push(normal[0],normal[1],normal[2]);
	normals.push(normal[0],normal[1],normal[2]);
	normals.push(normal[0],normal[1],normal[2]);
    }

    return normals;
}

// create data.gui
class parameters  {
    constructor() {
	this.x = -150;
	this.y = 0;
	this.z = -360;
	this.angleX = 190;
	this.angleY = 40;
	this.angleZ = 320;
	this.scaleX = 1;
	this.scaleY = 1;
	this.scaleZ = 1;
    }
};

let params = new parameters();
let gui = new dat.GUI();
gui.add(params,'x',-200,200).onChange(setValue);
gui.add(params,'y',-200,200).onChange(setValue);
gui.add(params,'z',-400,0).onChange(setValue);
gui.add(params,'angleX',-360,360).onChange(setValue);
gui.add(params,'angleY',-360,360).onChange(setValue);
gui.add(params,'angleZ',-360,360).onChange(setValue);
gui.add(params,'scaleX',-3,3).onChange(setValue);
gui.add(params,'scaleY',-3,3).onChange(setValue);
gui.add(params,'scaleZ',-3,3).onChange(setValue);
///////////////////////////////////////////////////////

let canvas = document.getElementById("c");

let gl = canvas.getContext("webgl");
if (!gl) {
    console.log("WebGL not working");
}

let vertexShaderSource = document.getElementById("3d-vertex-shader").text;
let fragmentShaderSource = document.getElementById("3d-fragment-shader").text;

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

let program = createProgram(gl, vertexShader, fragmentShader);

// look up where the vertex data needs to go.
let positionLocation = gl.getAttribLocation(program, "a_position");
let normalLocation = gl.getAttribLocation(program,"a_normal");

// lookup uniforms
let worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
let worldLocation = gl.getUniformLocation(program, "u_world");

let matrixLocation = gl.getUniformLocation(program, "u_matrix");

let lightLocation = gl.getUniformLocation(program, "u_light");

let verticies = generateVerticies();
let normals = generateNormals(verticies);

// Create a buffer to put positions in
let positionBuffer = gl.createBuffer();
// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// Put geometry data into buffer
setGeometry(gl);

let normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// Put the normal data into the buffer
setNormals(gl);

let translation = [-150,0,-360];
let scale = [1,1,1];
let rotation = [degToRad(190),degToRad(40),degToRad(320)];
let fieldOfViewInRadians = degToRad(60);

let rotationSpeed = 1.5;

let previousTime = 0;

let spin = false;

if (spin) {
    requestAnimationFrame(drawScene)
} else {
    drawScene();
}

function drawScene(currentTime) {

    if (spin) {
	currentTime *=.001;
	let deltaTime = currentTime - previousTime;

	rotation[1] += rotationSpeed * deltaTime;
	previousTime = currentTime;
    }

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.4, 0.4, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE); // cull the back face by default
    
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 3;
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(
     positionLocation, size, type, normalize, stride, offset)
     
    gl.enableVertexAttribArray(normalLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

     type = gl.FLOAT;
     normalize = false;
     stride = 0;
     offset = 0;
     gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewInRadians, aspect, zNear, zFar);

    let light_position = [0,100,100];

    gl.uniform3fv(lightLocation, m4.normalize(light_position));

    let target = [0,0,500];

    let cameraPosition = [800,1000,800];

    let cameraMatrix = m4.lookAt(cameraPosition,target);
    
    let viewMatrix = m4.inverse(cameraMatrix);
    
    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.yRotation(rotation[1]);

    let worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    
    let primitiveType = gl.TRIANGLES;
    type = gl.UNSIGNED_SHORT;
    offset = 0;
    let count = verticies.length/3;
    gl.drawArrays(primitiveType,0,count);

    if (spin) {
	requestAnimationFrame(drawScene);
    }
}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    
  let typedData = new Float32Array(verticies);	    

  gl.bufferData(
      gl.ARRAY_BUFFER,
      typedData,
      gl.STATIC_DRAW);

}

function setNormals(gl) {

    let typedData = new Float32Array(normals);

    gl.bufferData(
	gl.ARRAY_BUFFER,
	typedData,
	gl.STATIC_DRAW
    );

}

// change variables when dat.gui is changed
function setValue() {
    
    translation[0] = params.x;
    translation[1] = params.y;
    translation[2] = params.z;
    
    rotation[0] = degToRad(params.angleX);
    rotation[1] = degToRad(params.angleY);
    rotation[2] = degToRad(params.angleZ);
    
    scale[0] = params.scaleX;
    scale[1] = params.scaleY;
    scale[2] = params.scaleZ;
    
    drawScene();
}
