class Vertex {

    constructor(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Gradient {

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
        this.GenerateNormals();
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

    GenerateY() {
        console.log("Generating Y values...");

        //this.ValueNoise();
        this.DiamondSquare();
        //this.PerlinNoise();

    }

    FlattenVerticies() {

        let verticiesArray = [];

        for (let i=0;i<this.Verticies.length-1;i++) {
            for (let j=0;j<this.Verticies[0].length-1;j++) {
                
                verticiesArray.push(
                    this.Verticies[i][j].x,
                    this.Verticies[i][j].y,
                    this.Verticies[i][j].z
                );

                verticiesArray.push(
                    this.Verticies[i][j+1].x,
                    this.Verticies[i][j+1].y,
                    this.Verticies[i][j+1].z
                );

                verticiesArray.push(
                    this.Verticies[i+1][j].x,
                    this.Verticies[i+1][j].y,
                    this.Verticies[i+1][j].z
                );
               
                verticiesArray.push(
                    this.Verticies[i][j+1].x,
                    this.Verticies[i][j+1].y,
                    this.Verticies[i][j+1].z
                );

                verticiesArray.push(
                    this.Verticies[i+1][j+1].x,
                    this.Verticies[i+1][j+1].y,
                    this.Verticies[i+1][j+1].z
                );

                verticiesArray.push(
                    this.Verticies[i+1][j].x,
                    this.Verticies[i+1][j].y,
                    this.Verticies[i+1][j].z
                );

            }

        }

        this.FlatVerticies = verticiesArray;

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

        for (let i=0;i<this.Verticies.length-1;i++) {
            for (let j=0;j<this.Verticies[0].length-1;j++) {
                
                let pointA = this.Verticies[i][j];

                let pointB = this.Verticies[i+1][j];

                let pointC = this.Verticies[i][j+1];

                let normal = cross(arraySub(pointB,pointA),arraySub(pointC,pointA));

                normals.push(
                    normal.x,normal.y,normal.z,
                    normal.x,normal.y,normal.z,
                    normal.x,normal.y,normal.z
                );

                pointA = this.Verticies[i][j+1];

                pointB = this.Verticies[i+1][j];

                pointC = this.Verticies[i+1][j+1];

                normal = cross(arraySub(pointB,pointA),arraySub(pointC,pointA));

                normals.push(
                    normal.x,normal.y,normal.z,
                    normal.x,normal.y,normal.z,
                    normal.x,normal.y,normal.z
                );

            }

        }

        this.FlatNormals = normals;
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

    DiamondSquare() {

        // http://www.playfuljs.com/realistic-terrain-in-130-lines/

        var self = this;

        function average(values) {
            var valid = values.filter(function(val) { return val !== -1; });
            var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
            return total / valid.length;
        }

        function isUndefined(a,b) {

            if (typeof self.Verticies[a] == "undefined" || typeof self.Verticies[a][b] == "undefined") {
                return -1;
            }

            return self.Verticies[a][b].y;

        }
    
        function square(xPos, yPos, size, offset) {

            let ul = isUndefined(xPos-size,yPos-size);
            
            let ur = isUndefined(xPos+size,yPos-size);

            let lr = isUndefined(xPos+size,yPos+size);

            let br = isUndefined(xPos-size,yPos+size);

            var ave = average([
                ul,   // upper left
                ur,   // upper right
                lr,   // lower right
                br    // lower left
            ]);

            console.log(ave+offset);
            self.Verticies[xPos][yPos].y = ave+offset*200;
        }
    
        function diamond(xPos, yPos, size, offset) {

            let t = isUndefined(xPos,yPos-size);

            let r = isUndefined(xPos+size,yPos);

            let b = isUndefined(xPos,yPos+size);

            let l = isUndefined(xPos-size,yPos);

            var ave = average([
                t,      // top
                r,      // right
                b,      // bottom
                l       // left
            ]);

            
            self.Verticies[xPos][yPos].y = ave+offset*200;
        }

        function divide(size) {
            
            let x, y, half = Math.floor(size / 2);
            let scale = 0.7 * size;
    
            if (half < 1) {
                return;
            }
    
            for (y = half; y < self.Verticies.length-1; y += size) {
                for (x = half; x < self.Verticies.length-1; x += size) {
                    square(x, y, half, Math.random() * scale * 2 - scale);
                }
            }
    
            for (y=0; y <= self.Verticies.length-1; y += half) {
                for (x = (y+half) % size; x <= self.Verticies.length-1; x+= size) {
                    diamond(x,y,half, Math.random() * scale * 2 - scale);
                }
            }

            divide(size/2);
    
        }


        console.log(this.Verticies.length);

        this.Verticies[0][0].y = 2000;
        this.Verticies[0][this.Verticies.length-1].y = 1000;
        this.Verticies[this.Verticies.length-1][0].y = 0;
        this.Verticies[this.Verticies.length-1][this.Verticies.length-1].y = 1000;

        divide(this.Verticies.length-1);

    }

    PerlinNoise() {

        const p = [151,160,137,91,90,15,
            131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
            190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
            88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
            77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
            102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
            135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
            5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
            223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
            129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
            251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
            49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
            138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

        const grad = [
            new Gradient(1,1),
            new Gradient(-1,1),
            new Gradient(1,-1),
            new Gradient(-1,-1),
        ];

        function mix(a,b,percent) {
            return a*(1-percent) + b*percent;
        }

        function noise(u,v) {

            let fU = Math.floor(u);
            let fV = Math.floor(v);

            let iU = u - fU;
            let iV = v - fV;

            let aG = grad[(p[fU]+p[fV])%4];
            let bG = grad[(p[fU+1.0]+p[fV])%4];
            let cG = grad[(p[fU]+p[fV+1.0])%4];
            let dG = grad[(p[fU+1.0]+p[fV+1.0])%4];

            let a = aG.x * iU + aG.y * iV;
            let b = bG.x * iU + bG.y * iV;
            let c = cG.x * iU + cG.y * iV;
            let d = dG.x * iU + dG.y * iV;

            let uX = fU*fU*(3.0-2.0*fU);
            let uZ = fV*fV*(3.0-2.0*fV);
        
            return mix(
                mix(a, c, uX),
                mix(b,d,uX),
                uZ);


        }

        let width = this.resolution+1;

        for (let i=0;i<this.Verticies.length;i++) {
            
            for (let j=0;j<this.Verticies[0].length;j++) {

                let x = this.Verticies[i][j].x;
                let z = this.Verticies[i][j].z;

                x*= this.scaleFactor;
                z*= this.scaleFactor;

                let noiseValue = noise(
                    (x/(width*this.gridSize)),
                    (z/(width*this.gridSize))
                );

                console.log(noiseValue);

                noiseValue *= 2;
                noiseValue -= 1;

                this.Verticies[i][j].y = noiseValue / 100000;

            }
        }

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