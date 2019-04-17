function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) {
        return shader;
    }
    gl.deleteShader(shader);
}

function createProgram(gl, shaders) {
    let program = gl.createProgram();
    shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
    });
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) {
        return program;
    }
    gl.deleteProgram(program);    
}

function createProgramFromSources(gl, shaderSources) {
    let defaultShaderType = [
        "VERTEX_SHADER",
        "FRAGMENT_SHADER",
    ];
    let shaders = [];
    for (let i=0;i<shaderSources.length; i++) {
        shaders.push(createShader(gl, gl[defaultShaderType[i]],shaderSources[i]));
    }
    return createProgram(gl, shaders);
}

function createProgramInfo(gl, shaderSources) {
    shaderSources = shaderSources.map(function(source) {
        let script = document.getElementById(source);
        return script ? script.text : source;
    });
    let program = createProgramFromSources(gl, shaderSources);
    if (!program) {
        return null;
    }
    let uniformSetters = createUniformSetters(gl, program);
    let attribSetters = createAttributeSetters(gl, program);
    return {
        program: program,
        uniformSetters: uniformSetters,
        attribSetters: attribSetters,
    };
}

function getGLTypeForTypedArray(gl, typedArray) {
    if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
    if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
    throw "unsupported typed array type";
}

function createMapping(arrays) {
    let map = {};
    Object.keys(arrays).forEach(function(key) {
        map["a_" + key] = key;
    });
    return map;
}

function createBufferFromTypedArray(gl, array) {
    let type = gl.ARRAY_BUFFER;
    let buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, gl.STATIC_DRAW);
    return buffer;
}

function createAttribsFromArrays(gl, arrays) {
    let mapping = createMapping(arrays);
    let attribs = {};
    Object.keys(mapping).forEach(function(attribName) {
        let bufferName = mapping[attribName];
        let origArray = arrays[bufferName];
        let array = new Float32Array(origArray.data);

        attribs[attribName] = {
            buffer: createBufferFromTypedArray(gl, array),
            numComponents: origArray.numComponents || array.numComponents,
            type: getGLTypeForTypedArray(gl, array),
            normalize: false,
        };
    });
    return attribs;
}

function createBufferInfoFromArrays(gl, arrays) {
    let bufferInfo = {
        attribs: createAttribsFromArrays(gl, arrays)
    };
    let key = Object.keys(arrays)[0];
    bufferInfo.numElements = arrays[key].data.length;
    return bufferInfo;
}

function getBindPointFromSamplerType(gl, type) {
    if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
    if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
    return undefined;
}

function createUniformSetters(gl, program) {
    let textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */

    function createUniformSetter(program, uniformInfo) {
        let location = gl.getUniformLocation(program, uniformInfo.name);
        let type = uniformInfo.type;
        // check if this uniform is an array
        let isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
        if (type === gl.FLOAT && isArray) {
            return function(v) {
                gl.uniform1fv(location, v);
            };
        }
        if (type === gl.FLOAT) {
            return function(v) {
                gl.uniform1f(location, v);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function(v) {
                gl.uniform2fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function(v) {
                gl.uniform3fv(location, v);
            };
        }
        if (type === gl.INT_VEC4) {
            return function(v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.BOOL) {
            return function(v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function(v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function(v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function(v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function(v) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function(v) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function(v) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            let units = [];
            for (let ii=0;ii<info.size;ii++) {
                units.push(textureUnit++);
            }
            return function(bindPoint, units) {
                return function(textures) {
                    gl.uniform1iv(location, units);
                    textures.forEach(function(texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function(bindPoint,uint) {
                return function(texture) {
                    gl.uniform1i(location, uint);
                    gl.activeTexture(gl.TEXTURE0 + uint);
                    gl.bindTexture(bindPoint, texture);
                };
            }(getBindPointForSamplerType(gl, type), textureUnit++);
        }
        throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
    }
    let uniformSetters = { };
    let numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let ii=0; ii < numUniforms; ii++) {
        let uniformInfo = gl.getActiveUniform(program, ii);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === "[0]") {
            name = name.substr(0, name.length - 3);
        }
        let setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}

function setUniforms(values, setters) {
    setters = setters.uniformSetters || setters;
    Object.keys(values).forEach(function(name) {
        let setter = setters[name];
        if (setter) {
            setter(values[name]);
        }
    });
}

function createAttributeSetters(gl, program) {
    let attribSetters = {};

    function createAttribSetter(index) {
        return function(b) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(
                index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        };
    }

    let numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let ii = 0; ii < numAttribs; ii++) {
        let attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        let index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }
    return attribSetters;
}

function setAttributes(values, setters) {
    setters = setters.attribSetters || setters;
    Object.keys(values).forEach(function(name) {
        let setter = setters[name];
        if (setter) {
            setter(values[name]);
        }
    });
}

function resize(canvas) {

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    let displayWidth  = canvas.clientWidth;
    let displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {
   
        // Make the canvas the same size
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
}
// Fills the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;

    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
}