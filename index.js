
let canvas = document.getElementById("c");

let gl = canvas.getContext("webgl");
if (!gl) {
    console.log("WebGL not working");
}

let terrain = new Terrain(
    24000,
    64
);

let programInfo = createProgramInfo(gl, ["3d-vertex-shader", "mountain-3d-fragment-shader"]);

let arrays = {
    position: { numComponents: 3, data: terrain.FlatVerticies},
    normal: { numComponents: 3, data: terrain.FlatNormals},
};

let bufferInfo = createBufferInfoFromArrays(gl,arrays);

let uniforms = {
    u_camera: [0,13000,19200],
};

let light_position = [terrain.guiParams["Light Params"]["Light X"], terrain.guiParams["Light Params"]["Light Y"], terrain.guiParams["Light Params"]["Light Z"]];

let cameraPosition = [0,13000,19200];

let scale = [1, 1, 1];
let fieldOfViewInRadians = degToRad(60);

requestAnimationFrame(drawScene);

function generateGeomtry() {

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
    // Put geometry data into buffer

    let typedData = new Float32Array(arrays.position.data);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        typedData,
        gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
    // Put the normal data into the buffer

    typedData = new Float32Array(arrays.normal.data);
    
    gl.bufferData(
        gl.ARRAY_BUFFER,
        typedData,
        gl.STATIC_DRAW
    );

}

let lastUsedProgramInfo = null;
let lastUsedBufferInfo = null;
let bindBuffers = false;

function drawScene() {

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(terrain.guiParams["Fog Params"]["Fog Color"][0]/255, terrain.guiParams["Fog Params"]["Fog Color"][1]/255, terrain.guiParams["Fog Params"]["Fog Color"][2]/255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE); // cull the back face by default

    gl.enable(gl.DEPTH_TEST);

    if (programInfo != lastUsedProgramInfo){
        //console.log("Program Info changed");
        lastUsedProgramInfo = programInfo;
        gl.useProgram(programInfo.program);

        bindBuffers = true;
    }

    if (arrays.position.data != terrain.FlatVerticies || arrays.normal.data != terrain.FlatNormals) {
        arrays.position.data = terrain.FlatVerticies;
        arrays.normal.data = terrain.FlatNormals;

        bufferInfo = createBufferInfoFromArrays(gl,arrays);
    }

    if (bindBuffers || bufferInfo != lastUsedBufferInfo){
        //console.log("Buffer Info changed");
        lastUsedBufferInfo = bufferInfo;
        bindBuffers = false;
        generateGeomtry();
        setAttributes(bufferInfo.attribs, programInfo.attribSetters);
    }

    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 40000;
    let projectionMatrix = m4.perspective(fieldOfViewInRadians, aspect, zNear, zFar);

    uniforms.u_light = m4.normalize(light_position)

    uniforms.u_attenuation = terrain.guiParams["Fog Params"]["Fog Attenuation"];

    uniforms.u_fog_color = [terrain.guiParams["Fog Params"]["Fog Color"][0]/255,terrain.guiParams["Fog Params"]["Fog Color"][1]/255,terrain.guiParams["Fog Params"]["Fog Color"][2]/255];
    uniforms.u_gradient_center = terrain.guiParams["Fog Params"]["Gradient Center"];

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

    uniforms.u_worldViewProjection = worldViewProjectionMatrix;
    uniforms.u_world = worldMatrix;

    setUniforms(uniforms, programInfo.uniformSetters);

    let primitiveType = gl.TRIANGLES;
    type = gl.UNSIGNED_SHORT;
    offset = 0;
    let count = arrays.position.data.length / 3;
    gl.drawArrays(primitiveType, 0, count);

    requestAnimationFrame(drawScene);

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