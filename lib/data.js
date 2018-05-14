class Vertex {

    constructor(x,y,z) {
	this.x = x;
	this.a = x;

	this.y = y;
	this.b = y;

	this.z = z;
	this.c = z;
    }
}

class Data {

    constructor(width, step) {

	this.width = width;
	this.step = step;

	this.GeneratePoints();
	this.GenerateVerticies();
	this.GenerateNormals();
	
    }

    GeneratePoints() {
	
	let points = [];

	for (let i=0;i<this.width;i++) {
	    for(let j=0;j<this.width;j++) {
		const x = i*this.step;
		const z = j*this.step;
		const y = noise(x,z) * 300;

		let newVertex = new Vertex(x,y,z);
		points.push(newVertex);
	    }
	}

	this.rawPoints = points;

    }

    GenerateVerticies() {
	let verticies = [];

	for(let i=0;i<this.width-1;i++) {
	    for(let j=0;j<this.width-1;j++) {

		let vertexA = new Vertex(
		    this.rawPoints[(j+this.width*i)].x,
		    this.rawPoints[(j+this.width*i)].y,
		    this.rawPoints[(j+this.width*i)].z
		);
		
		let vertexB = new Vertex(
		    this.rawPoints[(j+1+this.width*i)].x,
		    this.rawPoints[(j+1+this.width*i)].y,
		    this.rawPoints[(j+1+this.width*i)].z
		);
		
		let vertexC = new Vertex(
		    this.rawPoints[(j+this.width+this.width*i)].x,
		    this.rawPoints[(j+this.width+this.width*i)].y,
		    this.rawPoints[(j+this.width+this.width*i)].z
		);
		
		let vertexD = new Vertex(
		    this.rawPoints[(j+1+this.width*i)].x,
		    this.rawPoints[(j+1+this.width*i)].y,
		    this.rawPoints[(j+1+this.width*i)].z
		);
		
		let vertexE = new Vertex(
		    this.rawPoints[(j+this.width+1+this.width*i)].x,
		    this.rawPoints[(j+this.width+1+this.width*i)].y,
		    this.rawPoints[(j+this.width+1+this.width*i)].z
		);
		
		let vertexF = new Vertex(
		    this.rawPoints[(j+this.width+this.width*i)].x,
		    this.rawPoints[(j+this.width+this.width*i)].y,
		    this.rawPoints[(j+this.width+this.width*i)].z
		);
		
		verticies.push(
		    vertexA,
		    vertexB,
		    vertexC,
		    vertexD,
		    vertexE,
		    vertexF
		)
	    }
	}

	this.Verticies = verticies;
	this.FlatVerticies = this.FlattenArray(this.Verticies);

    }

    GenerateNormals() {

	function arraySub(vectorA,vectorB) {
	    // array a - array b
	    let newVector = new Vertex();
	    
	    newVector.x = vectorA.x-vectorB.x;
	    newVector.y = vectorA.y-vectorB.y;
	    newVector.z = vectorA.z-vectorB.z;
	    
	    return newVector;
	}

	function cross(vectorA, vectorB) {
	    let newVector = new Vertex();
	    
	    newVector.x = vectorA.y*vectorB.z - vectorA.z*vectorB.y;
	    newVector.y = vectorA.z*vectorB.x - vectorA.x*vectorB.z;
	    newVector.z = vectorA.z*vectorB.y - vectorA.y*vectorB.x;
	    
	    return newVector;
	}

	let normals = [];

	for(let i=0;i<this.Verticies.length;i+=3) {

	    let pointA = this.Verticies[i];
	    let pointB = this.Verticies[i+1];
	    let pointC = this.Verticies[i+2];

	    const normal = cross(arraySub(pointC,pointA),arraySub(pointB,pointA));
	    
	    normals.push(normal);
	    normals.push(normal);
	    normals.push(normal);
	}

	this.Normals = normals;
	this.FlatNormals = this.FlattenArray(this.Normals);
    }

    FlattenArray(array) {

	let flatArray = [];

	for (let i=0;i<array.legnth;i++) {
	    flatArray.push(array[i].x,array[i].y,array[i].z);
	}

	return flatArray;
    }    
}
