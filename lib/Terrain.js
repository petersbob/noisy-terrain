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

class Terrain {

    constructor(size, resolution, scaleFactor) {

        this.size = size;
        this.resolution = resolution;
        this.scaleFactor = scaleFactor;

        this.gridSize = size/resolution;

        this.randomValue = Math.random();

        this.GenerateTerrain();
	
    }

    GenerateTerrain() {
        this.GeneratePoints();
        this.GenerateVerticies();
        this.GenerateNormals();
    }

    GeneratePoints() {
	
        let points = [];

        let width = this.resolution+1;

        for (let i=0;i<width;i++) {
            for(let j=0;j<width;j++) {
                const x = i*this.gridSize;
                const z = j*this.gridSize;
                let noiseValue = this.Noise(x/(width*this.gridSize),z/(width*this.gridSize)) * 2 - 1;

                for (let k=1;k<8;k++) {
                    noiseValue += this.Noise(
                        (x+k*this.gridSize)/(width*this.gridSize),
                        (z+k*this.gridSize)/(width*this.gridSize)
                    ) * 2 - 1;
                }

                const y = noiseValue*400;

                let newVertex = new Vertex(x,y,z);
                points.push(newVertex);
            }
        }

        for(let i=0;i<points.length;i++) {
            points[i].x -= (this.size/2);
            points[i].z -= (this.size/2);
        }

        this.rawPoints = points;
        this.GenerateVerticies();

    }

    GenerateVerticies() {
        let verticies = [];

        let width = this.resolution+1;

        for(let i=0;i<width-1;i++) {
            for(let j=0;j<width-1;j++) {

                    let vertexA = new Vertex(
                this.rawPoints[(j+width*i)].x,
                this.rawPoints[(j+width*i)].y,
                this.rawPoints[(j+width*i)].z
                    );
            
                    let vertexB = new Vertex(
                this.rawPoints[(j+1+width*i)].x,
                this.rawPoints[(j+1+width*i)].y,
                this.rawPoints[(j+1+width*i)].z
                    );
            
                    let vertexC = new Vertex(
                this.rawPoints[(j+width+width*i)].x,
                this.rawPoints[(j+width+width*i)].y,
                this.rawPoints[(j+width+width*i)].z
                    );
            
                    let vertexD = new Vertex(
                this.rawPoints[(j+1+width*i)].x,
                this.rawPoints[(j+1+width*i)].y,
                this.rawPoints[(j+1+width*i)].z
                    );
            
                    let vertexE = new Vertex(
                this.rawPoints[(j+width+1+width*i)].x,
                this.rawPoints[(j+width+1+width*i)].y,
                this.rawPoints[(j+width+1+width*i)].z
                    );
            
                    let vertexF = new Vertex(
                this.rawPoints[(j+width+width*i)].x,
                this.rawPoints[(j+width+width*i)].y,
                this.rawPoints[(j+width+width*i)].z
                    );
            
                    verticies.push(
                vertexA,
                vertexB,
                vertexC,
                vertexD,
                vertexE,
                vertexF
                    );
            }
        }

        this.Verticies = verticies;
        this.FlatVerticies = this.FlattenArray(verticies);

        this.GenerateNormals();
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
        this.FlatNormals = this.FlattenArray(normals);
    }

    FlattenArray(array) {

        let flatArray = [];

        for (let i=0;i<array.length;i++) {
	    flatArray.push(array[i].x,array[i].y,array[i].z);
        }

        return flatArray;
    }

    Noise(u,v) {

        function mix(a,b,percent) {
            return a*(1-percent) + b*percent;
        }
    
    
        u*=this.scaleFactor;
        v*=this.scaleFactor;
    
        let fX = u%1.0;
        let fZ = v%1.0;
    
        let iX = Math.trunc(u);
        let iZ = Math.trunc(v);
    
        let a = random(iX,iZ);
        let b = random(iX+1.0,iZ);
        let c = random(iX,iZ+1.0);
        let d = random(iX+1.0,iZ+1.0);
    
        let uX = fX*fX*(3.0-2.0*fX);
        let uZ = fZ*fZ*(3.0-2.0*fZ);    
    
        return mix(a, b, uX) +
            (c - a)* uZ * (1.0 - uX) +
            (d - b) * uX * uZ;
    }
}