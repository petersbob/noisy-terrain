// create data.gui
let params = {
    "X": 0,
    "Y": 0,
    "Z": 0,

    "Light X": 0,
    "Light Y": 1000,
    "Light Z": 1000,

}

let terrainParams = {
    "Resolution": 75,
    "Scale Factor": 20,

    "X scale": 1,
    "Y scale": 1,
    "Z scale": 1,
}

let gui = new dat.GUI();

var guiTerrainControls = gui.addFolder("Terrain Controls");

guiTerrainControls.add(terrainParams, "Resolution", 1, 100).onChange(setValue).step(1);
guiTerrainControls.add(terrainParams, "Scale Factor", 1, 100).onChange(setValue).step(1);
guiTerrainControls.add(terrainParams, "X scale", -3, 3).onChange(setValue);
guiTerrainControls.add(terrainParams, "Y scale", -3, 3).onChange(setValue);
guiTerrainControls.add(terrainParams, "Z scale", -3, 3).onChange(setValue);
guiTerrainControls.open();

var guiCameraControls = gui.addFolder("Camera Controls");

guiCameraControls.add(params, "X", -2000, 2000).onChange(setValue);
guiCameraControls.add(params, "Y", -2000, 2000).onChange(setValue);
guiCameraControls.add(params, "Z", -2000, 2000).onChange(setValue);
guiCameraControls.open();

var guiLightPosition = gui.addFolder("Light Controls");

guiLightPosition.add(params, "Light X", -3000, 3000).onChange(setValue);
guiLightPosition.add(params, "Light Y", -3000, 3000).onChange(setValue);
guiLightPosition.add(params, "Light Z", -3000, 3000).onChange(setValue);
guiLightPosition.open();

///////////////////////////////////////////////////////

let canvas = document.getElementById("c");

let gl = canvas.getContext("webgl");
if (!gl) {
    console.log("WebGL not working");
}

let terrain = new Terrain(
    24000,
    terrainParams["Resolution"],
    terrainParams["Scale Factor"]
);

let vertexShaderSource = document.getElementById("3d-vertex-shader").text;
let fragmentShaderSource = document.getElementById("3d-fragment-shader").text;

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

let program = createProgram(gl, vertexShader, fragmentShader);

// look up where the vertex data needs to go.
let positionLocation = gl.getAttribLocation(program, "a_position");
let normalLocation = gl.getAttribLocation(program, "a_normal");

// lookup uniforms
let worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
let worldLocation = gl.getUniformLocation(program, "u_world");

let matrixLocation = gl.getUniformLocation(program, "u_matrix");

let lightLocation = gl.getUniformLocation(program, "u_light");

let light_position = [params["Light X"], params["Light Y"], params["Light Z"]];

let cameraPosition = [0, 5000, 8000];
let verticies = [];
let normals = [];

let positionBuffer = gl.createBuffer();
let normalBuffer = gl.createBuffer();

let translation = [0, 0, 0];
let scale = [1, 1, 1];
let fieldOfViewInRadians = degToRad(60);

generateGeomtry();
drawScene();

function generateGeomtry() {

    verticies = terrain.FlatVerticies;
    normals = terrain.FlatNormals;

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // Put the normal data into the buffer
    setNormals(gl);
}

function drawScene() {

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.5, 0.6, 0.7, 1);
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
        positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 20000;
    let projectionMatrix = m4.perspective(fieldOfViewInRadians, aspect, zNear, zFar);

    gl.uniform3fv(lightLocation, m4.normalize(light_position));

    let target = [0, 0, 0];

    let cameraMatrix = m4.lookAt(cameraPosition, target);

    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.multiply(
        m4.xRotation(0),
        m4.yRotation(0)
    );
    worldMatrix = m4.zRotate(worldMatrix, 0);
    worldMatrix = m4.scale(worldMatrix, scale[0], scale[1], scale[2]);
    worldMatrix = m4.translate(worldMatrix, translation[0], translation[1], translation[2]);

    let worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    let primitiveType = gl.TRIANGLES;
    type = gl.UNSIGNED_SHORT;
    offset = 0;
    let count = verticies.length / 3;
    gl.drawArrays(primitiveType, 0, count);

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

    translation[0] = params["X"];
    translation[1] = params["Y"];
    translation[2] = params["Z"];

    scale[0] = terrainParams["X scale"];
    scale[1] = terrainParams["Y scale"];
    scale[2] = terrainParams["Z scale"];

    light_position[0] = params["Light X"];
    light_position[1] = params["Light Y"];
    light_position[2] = params["Light Z"];

    if (terrain.resolution != terrainParams["Resolution"]
        || terrain.scaleFactor != terrainParams["Scale Factor"]) {

        terrain.resolution = terrainParams["Resolution"];
        terrain.scaleFactor = terrainParams["Scale Factor"];

        terrain.gridSize = terrain.size / terrain.resolution;

        terrain.GenerateTerrain();

        generateGeomtry();
    }

    drawScene();
}

document.addEventListener("keydown", function (event) {

    function cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    let perp, dist, tempPosition, normalized = [0, 0, 0];

    switch (event.key) {
        case "ArrowDown":

            perp = m4.normalize(cross(cameraPosition, [1, cameraPosition[1], cameraPosition[2]]));

            dist = Math.sqrt(Math.pow(cameraPosition[0], 2) + Math.pow(cameraPosition[1], 2) + Math.pow(cameraPosition[2], 2));

            tempPosition = [cameraPosition[0] += perp[0] * 40,
            cameraPosition[1] += perp[1] * 40,
            cameraPosition[2] += perp[2] * 40,
            ];

            normalized = m4.normalize(tempPosition);

            cameraPosition = [normalized[0] * dist, normalized[1] * dist, normalized[2] * dist];
            break;

        case "ArrowUp":
            perp = m4.normalize(cross(cameraPosition, [1, cameraPosition[1], cameraPosition[2]]));

            dist = Math.sqrt(Math.pow(cameraPosition[0], 2) + Math.pow(cameraPosition[1], 2) + Math.pow(cameraPosition[2], 2));

            tempPosition = [cameraPosition[0] -= perp[0] * 40,
            cameraPosition[1] -= perp[1] * 40,
            cameraPosition[2] -= perp[2] * 40,
            ];

            normalized = m4.normalize(tempPosition);

            cameraPosition = [normalized[0] * dist, normalized[1] * dist, normalized[2] * dist];
            break;

        case "ArrowLeft":

            perp = m4.normalize(cross(cameraPosition, [cameraPosition[0], 1, cameraPosition[2]]));

            dist = Math.sqrt(Math.pow(cameraPosition[0], 2) + Math.pow(cameraPosition[1], 2) + Math.pow(cameraPosition[2], 2));

            tempPosition = [cameraPosition[0] += perp[0] * 40,
            cameraPosition[1] += perp[1] * 40,
            cameraPosition[2] += perp[2] * 40,
            ];

            normalized = m4.normalize(tempPosition);

            cameraPosition = [normalized[0] * dist, normalized[1] * dist, normalized[2] * dist];
            break;

        case "ArrowRight":
            perp = m4.normalize(cross(cameraPosition, [cameraPosition[0], 1, cameraPosition[2]]));

            dist = Math.sqrt(Math.pow(cameraPosition[0], 2) + Math.pow(cameraPosition[1], 2) + Math.pow(cameraPosition[2], 2));

            tempPosition = [cameraPosition[0] -= perp[0] * 40,
            cameraPosition[1] -= perp[1] * 40,
            cameraPosition[2] -= perp[2] * 40,
            ];

            normalized = m4.normalize(tempPosition);

            cameraPosition = [normalized[0] * dist, normalized[1] * dist, normalized[2] * dist];

            break;


    }

    drawScene();

});