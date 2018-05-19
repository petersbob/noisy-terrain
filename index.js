
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
gui.add(params,"x",-200,200).onChange(setValue);
gui.add(params,"y",-200,200).onChange(setValue);
gui.add(params,"z",-400,0).onChange(setValue);
gui.add(params,"angleX",-360,360).onChange(setValue);
gui.add(params,"angleY",-360,360).onChange(setValue);
gui.add(params,"angleZ",-360,360).onChange(setValue);
gui.add(params,"scaleX",-3,3).onChange(setValue);
gui.add(params,"scaleY",-3,3).onChange(setValue);
gui.add(params,"scaleZ",-3,3).onChange(setValue);
///////////////////////////////////////////////////////

let canvas = document.getElementById("c");

let gl = canvas.getContext("webgl");
if (!gl) {
    console.log("WebGL not working");
}

let width = 40; // number of points in the grid with
let step = 50; // distance between the grid points

var data = new Data(width,step);

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

let cameraPosition = [800,1000,800];

let verticies = data.FlatVerticies;
let normals = data.FlatNormals;

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

    let target = [0,0,0];

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

document.addEventListener('keydown', function(event) {

    function cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    event.preventDefault();

    let toCenter = [0,0,0];

    let perp, dist, tempPosition, normalized = [0,0,0];
    
    switch (event.key) {
    case "ArrowDown":

	perp = m4.normalize(cross(cameraPosition,[1,cameraPosition[1],cameraPosition[2]]))

	dist = Math.sqrt(Math.pow(cameraPosition[0],2) + Math.pow(cameraPosition[1],2) + Math.pow(cameraPosition[2],2));

	tempPosition = [cameraPosition[0]+= perp[0]*40,
			cameraPosition[1]+= perp[1]*40,
			cameraPosition[2]+= perp[2]*40,
		       ];

	normalized = m4.normalize(tempPosition);

	cameraPosition = [normalized[0]*dist,normalized[1]*dist,normalized[2]*dist];
	break;
	
    case "ArrowUp":
	perp = m4.normalize(cross(cameraPosition,[1,cameraPosition[1],cameraPosition[2]]))

	dist = Math.sqrt(Math.pow(cameraPosition[0],2) + Math.pow(cameraPosition[1],2) + Math.pow(cameraPosition[2],2));

	tempPosition = [cameraPosition[0]-= perp[0]*40,
			cameraPosition[1]-= perp[1]*40,
			cameraPosition[2]-= perp[2]*40,
		       ];

	normalized = m4.normalize(tempPosition);

	cameraPosition = [normalized[0]*dist,normalized[1]*dist,normalized[2]*dist];
	break;

    case "ArrowLeft":

	perp = m4.normalize(cross(cameraPosition,[cameraPosition[0],1,cameraPosition[2]]))

	dist = Math.sqrt(Math.pow(cameraPosition[0],2) + Math.pow(cameraPosition[1],2) + Math.pow(cameraPosition[2],2));

	tempPosition = [cameraPosition[0]+= perp[0]*40,
			    cameraPosition[1]+= perp[1]*40,
			    cameraPosition[2]+= perp[2]*40,
			    ];

	normalized = m4.normalize(tempPosition);

	cameraPosition = [normalized[0]*dist,normalized[1]*dist,normalized[2]*dist];
	break;

    case "ArrowRight":
	perp = m4.normalize(cross(cameraPosition,[cameraPosition[0],1,cameraPosition[2]]))

	dist = Math.sqrt(Math.pow(cameraPosition[0],2) + Math.pow(cameraPosition[1],2) + Math.pow(cameraPosition[2],2));

	tempPosition = [cameraPosition[0]-= perp[0]*40,
			    cameraPosition[1]-= perp[1]*40,
			    cameraPosition[2]-= perp[2]*40,
			    ];

	normalized = m4.normalize(tempPosition);

	cameraPosition = [normalized[0]*dist,normalized[1]*dist,normalized[2]*dist];

	break;
	
	
    }

    drawScene();

});
