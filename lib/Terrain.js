class Vertex {

    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Terrain {

    constructor(size, resolution, scaleFactor) {

        this.size = size; // width and height of the grid
        this.resolution = resolution; // how many squares wide the grid is
        this.scaleFactor = scaleFactor; // 

        this.gridSize = size/resolution; // the size of each grid square

        this.randomValue = Math.random();

        this.GenerateTerrain();
	
    }

    GenerateTerrain() {
        this.GenerateVerticies();
        this.GenerateY();
        this.FlattenVerticies();
        this.GenerateIndicies();
        this.GenerateNormals();
    }

    GenerateY() {
        console.log("Generating Y values...");

        this.ValueNoise();

    }

    ValueNoise() {

        let width = this.resolution+1;

        for (let i=0;i<this.Verticies.length;i++) {
            
            for (let j=0;j<this.Verticies[0].length;j++) {

                const x = this.Verticies[i][j].x;
                const z = this.Verticies[i][j].z;

                let noiseValue = this.Noise(
                    (x/(width*this.gridSize)),
                    (z/(width*this.gridSize))
                );

                for (let k=1;k<8;k++) {
                    noiseValue += this.Noise(
                        (x+k*this.gridSize)/(width*this.gridSize),
                        (z+k*this.gridSize)/(width*this.gridSize)
                    );
                }

                noiseValue /= 8; // change range of values to 0 - 1
                noiseValue *= 2; // change range of values from 0 - 2
                noiseValue -= 1; // change range of values from -1 - 1

                this.Verticies[i][j].y = noiseValue*4000;

            }

        }

    }

    GenerateVerticies() {
        let verticies = [];

        let width = this.resolution+1;

        for (let i=0;i<width;i++) {
            let row = [];
            for (let j=0;j<width;j++) {
                
                const vertex = new Vertex(i*this.gridSize,0,j*this.gridSize);

                row.push(
                    vertex
                );
            }
            verticies.push(row);
        }

        this.Verticies = verticies;

    }

    FlattenVerticies() {

        this.FlatVerticies = this.FlattenArray(this.Verticies);

    }

    GenerateIndicies() {

        let indicies = [];

        let width = this.Verticies.length;

        for (let i=0;i<width-1;i++) {

            if (i > 0) {
                indicies.push(
                    i*width
                );
            }

            for (let j=0;j<width;j++) {

                indicies.push(
                    i*width+j,
                    (i+1)*width+j
                );

            }

            if (i < width-2) {
                indicies.push(
                    (i+2)*width - 1
                );
            }

        }

        this.Indicies = indicies;

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

        let normals = []
        for (let i=0;i<this.Verticies.length;i++) {
            normals.push([]);
        }

        // for(let i=0;i<this.Verticies.length;i+=3) {

        //     let pointA = this.Verticies[i];
        //     let pointB = this.Verticies[i+1];
        //     let pointC = this.Verticies[i+2];

        //     const normal = cross(arraySub(pointC,pointA),arraySub(pointB,pointA));
            
        //     normals.push(normal);
        //     normals.push(normal);
        //     normals.push(normal);
        // }

        const width = this.Verticies[0].length;

        for (let i=0; i<this.Indicies.length-2;i++) {

            let indexA = this.Indicies[i];
            let indexB = this.Indicies[i+1];
            let indexC = this.Indicies[i+2];

            if (indexA == indexB || indexB == indexC) {
                continue;
            }

            let pointA = this.Verticies[Math.floor(indexA/width)][(indexA % width)];
            let pointB = this.Verticies[Math.floor(indexB/width)][(indexB % width)];
            let pointC = this.Verticies[Math.floor(indexC/width)][(indexC % width)];

            let normal;

            if (i%2 == 0) {

                normal = cross(arraySub(pointC,pointA),arraySub(pointB,pointA));
            } else {

                normal = cross(arraySub(pointB,pointA),arraySub(pointC,pointA));
            }

            if (normals[Math.floor(indexA/width)][(indexA % width)] == null) {

                normals[Math.floor(indexA/width)][(indexA % width)] = normal;

            }

            if (normals[Math.floor(indexB/width)][(indexB % width)] == null) {

                normals[Math.floor(indexB/width)][(indexB % width)] = normal;

            }

            if (normals[Math.floor(indexC/width)][(indexC % width)] == null) {

                normals[Math.floor(indexC/width)][(indexC % width)] = normal;

            }

        }

        this.Normals = normals;
        this.FlatNormals = this.FlattenArray(this.Normals);
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


    FlattenArray(array) {

        let flatArray = [];

        for (let i=0;i<array.length;i++) {
            for (let j=0;j<array[0].length;j++) {
                flatArray.push(array[i][j].x, array[i][j].y, array[i][j].z);
            }
        }

        return flatArray;
    }


    
}