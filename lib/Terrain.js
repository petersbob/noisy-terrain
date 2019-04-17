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

    constructor(size, resolution) {

        this.size = size; // width and height of the grid
        this.resolution = resolution; // how many squares wide the grid is
        this.gridSize = size/resolution; // the size of each grid square

        this.randomValue = Math.random();
        this.currentProgramInfo = "Mountain";

        this.algorithms = {
            "Value Noise": new ValueNoise(),
            "Perlin Noise": new PerlinNoise(),
            "Diamond Square": new DiamondSquare()
        };
        this.currentAlgorithm = "Value Noise";

        // create data.gui
        this.guiParams = {
            "Algorithm": this.currentAlgorithm,
            "Resolution Slider": 64,
            "Resolution Selector": "64",
            "Terrain": "Mountain",

            "Light Params": {
                "Light X": 0,
                "Light Y": 1000,
                "Light Z": 1000
            },

            "Fog Params": {
                "Fog Attenuation": 0.00004,
                "Fog Color": [128, 153, 179]
            }
        };

        this.gui = new dat.GUI();
        this.gui.width = 400;
        let algorithmControls;

        let guiTerrainControls = this.gui.addFolder("Terrain Controls");

        guiTerrainControls.add(this.guiParams, "Algorithm", ["Value Noise", "Perlin Noise", "Diamond Square"]).onChange((value) => {
            this.algorithms[this.currentAlgorithm].removeGui(algorithmControls);

            this.currentAlgorithm = value;
            this.algorithms[this.currentAlgorithm].generateGui(algorithmControls, this.GenerateTerrain.bind(this));

            this.resolutionController.remove();
            this.resolution = 64;
            this.gridSize = this.size/this.resolution;

            if (this.currentAlgorithm == "Diamond Square") {
                this.resolutionController = guiTerrainControls.add(this.guiParams, "Resolution Selector", [16,32,64,128]).onChange((value) => {
                    this.resolution = parseInt(value);
                    this.gridSize = this.size/this.resolution;
                    this.GenerateTerrain();
                });
            } else {
                this.resolutionController = guiTerrainControls.add(this.guiParams, "Resolution Slider", 1, 128).step(1).onChange((value) => {
                    this.resolution = value;
                    this.gridSize = this.size/this.resolution;
                    this.GenerateTerrain();
                });
            }

            this.GenerateTerrain();
        });

        guiTerrainControls.add(this.guiParams, "Terrain", ["Mountain", "Desert", "Tundra"]).onChange((value) => {
            this.currentProgramInfo = value;
        });

        this.resolutionController = guiTerrainControls.add(this.guiParams, "Resolution Slider", 1, 128).step(1).onChange((value) => {
            this.resolution = value;
            this.gridSize = this.size/this.resolution;
            this.GenerateTerrain();
        });

        guiTerrainControls.open();

        algorithmControls = this.gui.addFolder("Algorithm Controls");

        this.algorithms[this.currentAlgorithm].generateGui(algorithmControls, this.GenerateTerrain.bind(this));
        algorithmControls.open();

        let guiLightPosition = this.gui.addFolder("Light Controls");
        guiLightPosition.add(this.guiParams["Light Params"], "Light X", -3000, 3000);
        guiLightPosition.add(this.guiParams["Light Params"], "Light Y", -3000, 3000);
        guiLightPosition.add(this.guiParams["Light Params"], "Light Z", -3000, 3000);
        guiLightPosition.open();

        let guiFogControls = this.gui.addFolder("Fog Controls");

        guiFogControls.add(this.guiParams["Fog Params"], "Fog Attenuation", 0.00001,0.0001).step(0.00001);

        guiFogControls.addColor(this.guiParams["Fog Params"], "Fog Color");

        guiFogControls.open();

        this.GenerateTerrain(this);
    }

    GenerateTerrain() {
        console.log("Generating new terrain");
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
        this.algorithms[this.currentAlgorithm].GenerateY(this.Verticies,this.size,this.size);
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