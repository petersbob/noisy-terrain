//////////////////////////////////////////////////////

let canvas = document.getElementById("c");

let gl = canvas.getContext("webgl");
if (!gl) {
    console.log("WebGL not working");
}

let terrain = new Terrain(
    24000,
    64
);

let vertexShaderSource = document.getElementById("3d-vertex-shader").text;
let fragmentShaderSource = document.getElementById("mountain-3d-fragment-shader").text;

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

let cameraLocation = gl.getUniformLocation(program, "u_camera");

let attenuationLocation = gl.getUniformLocation(program, "u_attenuation");
let fogColorLocation = gl.getUniformLocation(program, "u_fog_color");

let gradientCenterLocation = gl.getUniformLocation(program, "u_gradient_center");

let light_position = [terrain.guiParams["Light Params"]["Light X"], terrain.guiParams["Light Params"]["Light Y"], terrain.guiParams["Light Params"]["Light Z"]];

let cameraPosition = [0,13000,19200];

let verticies = [];
let normals = [];

let positionBuffer = gl.createBuffer();
let normalBuffer = gl.createBuffer();

let scale = [1, 1, 1];
let fieldOfViewInRadians = degToRad(60);

requestAnimationFrame(drawScene);
//drawScene();

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

    generateGeomtry();

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(terrain.guiParams["Fog Params"]["Fog Color"][0]/255, terrain.guiParams["Fog Params"]["Fog Color"][1]/255, terrain.guiParams["Fog Params"]["Fog Color"][2]/255, 1);
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
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 40000;
    let projectionMatrix = m4.perspective(fieldOfViewInRadians, aspect, zNear, zFar);

    gl.uniform3fv(lightLocation, m4.normalize(light_position));

    gl.uniform3fv(cameraLocation, cameraPosition);

    gl.uniform1f(attenuationLocation, terrain.guiParams["Fog Params"]["Fog Attenuation"]);
    gl.uniform3fv(fogColorLocation, [terrain.guiParams["Fog Params"]["Fog Color"][0]/255,terrain.guiParams["Fog Params"]["Fog Color"][1]/255,terrain.guiParams["Fog Params"]["Fog Color"][2]/255])
    gl.uniform1f(gradientCenterLocation, terrain.guiParams["Fog Params"]["Gradient Center"]);

    let target = [0, 0, 5000];
    let cameraMatrix = m4.lookAt(cameraPosition, target);

    let viewMatrix = m4.inverse(cameraMatrix);

    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.multiply(
        m4.xRotation(0),
        m4.yRotation(0)
    );
    worldMatrix = m4.zRotate(worldMatrix, 0);
    worldMatrix = m4.scale(worldMatrix, scale[0], scale[1], scale[2]);
    worldMatrix = m4.translate(worldMatrix, -terrain.size/2, 0, -terrain.size/2);

    let worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    let primitiveType = gl.TRIANGLES;
    type = gl.UNSIGNED_SHORT;
    offset = 0;
    let count = verticies.length / 3;
    gl.drawArrays(primitiveType, 0, count);

    requestAnimationFrame(drawScene);

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

// function changeTerrain() {
//     let terrainShader;

//     if (terrainParams["Terrain"] == "Mountain") {
//         terrainShader = "mountain-3d-fragment-shader";
//     } else if (terrainParams["Terrain"] == "Desert") {
//         terrainShader = "desert-3d-fragment-shader";
//     } else if (terrainParams["Terrain"] == "Tundra") {
//         terrainShader = "tundra-3d-fragment-shader";
//     }

//     terrain.currentAlgorithm = terrainParams["Algorithm"];

//     fragmentShaderSource = document.getElementById(terrainShader).text;

//     vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
//     fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//     program = createProgram(gl, vertexShader, fragmentShader);

//     // lookup uniforms
//     worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
//     worldLocation = gl.getUniformLocation(program, "u_world");

//     matrixLocation = gl.getUniformLocation(program, "u_matrix");

//     lightLocation = gl.getUniformLocation(program, "u_light");

//     cameraLocation = gl.getUniformLocation(program, "u_camera");

//     attenuationLocation = gl.getUniformLocation(program, "u_attenuation");
//     fogColorLocation = gl.getUniformLocation(program, "u_fog_color");

//     gradientCenterLocation = gl.getUniformLocation(program, "u_gradient_center");

//     drawScene();
// }