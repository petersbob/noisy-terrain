class ValueNoise {

    constructor() {

        this.octaves = 5;
        this.startingFrequency = 2;
        this.startingAmplitude = 4096;

        this.guiParams = {
            "Octaves": this.octaves,
            "Starting Frequency": this.startingFrequency,
            "Starting Amplitude": this.startingAmplitude,
        };

        this.guiControllers = undefined;
    }

    generateGui(folder, generateTerrainCallback) {
        let arr = [];

        arr.push(folder.add(this.guiParams, "Octaves", 1, 8).step(1).onChange((value) => {
            this.octaves = value;
            generateTerrainCallback();
        }));

        arr.push(folder.add(this.guiParams, "Starting Frequency", 2,16).step(1).onChange((value) => {
            this.startingFrequency = value;
            generateTerrainCallback();
        }));

        arr.push(folder.add(this.guiParams, "Starting Amplitude", 2, 8191).step(10).onChange((value) => {
            this.startingAmplitude = value;
            generateTerrainCallback();
        }));

        this.guiControllers = arr;

    }

    removeGui() {
        for (let i=0;i<this.guiControllers.length;i++) {
            this.guiControllers[i].remove();
        }
    }

    Mix(a,b,percent) {
        return a*(1-percent) + b*percent;
    }

    Noise(u,v) {
 
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

        return this.Mix(a, b, uX) +
            (c - a)* uZ * (1.0 - uX) +
            (d - b) * uX * uZ;
    }

    GenerateY(verticies,width,depth) {

        for (let i=0;i<verticies.length;i++) {
            
            for (let j=0;j<verticies[0].length;j++) {

                const x = verticies[i][j].x;
                const z = verticies[i][j].z;

                let noiseValue = 0;
                let frequency = this.startingFrequency;
                let amplitude = this.startingAmplitude;

                for (let k=0;k<this.octaves;k++) {

                    let octaveNoiseValue = this.Noise(
                        (x/width)*frequency,
                        (z/depth)*frequency
                    );

                    octaveNoiseValue *= 2;
                    octaveNoiseValue -= 1;
                    octaveNoiseValue *= amplitude;

                    noiseValue += octaveNoiseValue;

                    frequency*=2;
                    amplitude/=2;

                }

                verticies[i][j].y = noiseValue;

            }

        }

        return verticies;

    }
}

class PerlinNoise {

    constructor() {

        this.octaves = 5;
        this.startingFrequency = 2;
        this.startingAmplitude = 4096;

        this.guiParams = {
            "Octaves": this.octaves,
            "Starting Frequency": this.startingFrequency,
            "Starting Amplitude": this.startingAmplitude,
        };

        this.guiControllers = undefined;

        this.p = [151,160,137,91,90,15,
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

        this.grad = [
            new Gradient(1,0),
            new Gradient(0,1),
            new Gradient(-1,0),
            new Gradient(0,-1),
        ];

    }

    generateGui(folder, generateTerrainCallback) {
        let arr = [];

        arr.push(folder.add(this.guiParams, "Octaves", 1, 8).step(1).onChange((value) => {
            this.octaves = value;
            generateTerrainCallback();
        }));

        arr.push(folder.add(this.guiParams, "Starting Frequency", 2,16).step(1).onChange((value) => {
            this.startingFrequency = value;
            generateTerrainCallback();
        }));

        arr.push(folder.add(this.guiParams, "Starting Amplitude", 2, 8191).step(10).onChange((value) => {
            this.startingAmplitude = value;
            generateTerrainCallback();
        }));

        this.guiControllers = arr;

    }

    removeGui() {
        for (let i=0;i<this.guiControllers.length;i++) {
            this.guiControllers[i].remove();
        }
    }

    Mix(a,b,percent) {
        return a*(1-percent) + b*percent;
    }

    Noise(u,v) {

        // Find the grid cell
        let iU = Math.floor(u);
        let iV = Math.floor(v);

        iU = iU & 255;
        iV = iV & 255;
        
        // Find the relative xy in the cell
        let fU = u - iU;
        let fV = v - iV;

        let aG = this.grad[(iU+this.p[iV])%4];
        let bG = this.grad[(iU+this.p[iV+1])%4];
        let cG = this.grad[(iU+1+this.p[iV])%4];
        let dG = this.grad[(iU+1+this.p[iV+1])%4];

        let a = aG.x*fU + aG.y*fV;
        let b = bG.x*fU + bG.y*(fV-1);
        let c = cG.x*(fU-1) + cG.y*fV;
        let d = dG.x*(fU-1) + dG.y*(fV-1);

        let uX = fU*fU*(3.0-2.0*fU);
        let uZ = fV*fV*(3.0-2.0*fV);
    
        return this.Mix(
            this.Mix(a, c, uX),
            this.Mix(b,d,uX),
            uZ);

    }
    
    GenerateY(verticies,width,depth) { 

        for (let i=0;i<verticies.length;i++) {
            
            for (let j=0;j<verticies[0].length;j++) {

                let x = verticies[i][j].x;
                let z = verticies[i][j].z;

                let noiseValue = 0;
                let frequency = this.startingFrequency;
                let amplitude = this.startingAmplitude;

                for (let k=0;k<this.octaves;k++) {

                    let octaveNoiseValue = this.Noise(
                        (x/width)*frequency,
                        (z/depth)*frequency
                    );

                    octaveNoiseValue *= Math.sqrt(2);
                    octaveNoiseValue *= amplitude;

                    noiseValue += octaveNoiseValue;

                    frequency*=2;
                    amplitude/=2;
                }

                verticies[i][j].y = noiseValue;

            }

        }

        return verticies;

    }
}

class DiamondSquare {

    constructor() {
        this.Verticies = undefined;
        this.scaleMultiplier = 0.7;
        this.offsetMultiplier = 200;

        this.guiParams = {
            "Scale Multiplier": this.scaleMultiplier,
            "Offset Multiplier": this.offsetMultiplier,
        };

        this.guiControllers = undefined;
    }

    generateGui(folder, generateTerrainCallback) {
        let arr = [];

        arr.push(folder.add(this.guiParams, "Scale Multiplier", 0,1).step(0.05).onChange((value) => {
            this.scaleMultiplier = value;
            generateTerrainCallback();
        }));

        arr.push(folder.add(this.guiParams, "Offset Multiplier", 0,500).step(10).onChange((value) => {
            this.offsetMultiplier = value;
            generateTerrainCallback();
        }));

        this.guiControllers = arr;

    }

    removeGui() {
        for (let i=0;i<this.guiControllers.length;i++) {
            this.guiControllers[i].remove();
        }
    }

    Average(values) {
        var valid = values.filter(function(val) { return val !== -1; });
        var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
        return total / valid.length;
    }

    IsUndefined(a,b) {

        if (typeof this.Verticies[a] == "undefined" || typeof this.Verticies[a][b] == "undefined") {
            return -1;
        }

        return this.Verticies[a][b].y;

    }

    Square(xPos, yPos, size, offset) {

        let ul = this.IsUndefined(xPos-size,yPos-size);
        
        let ur = this.IsUndefined(xPos+size,yPos-size);

        let lr = this.IsUndefined(xPos+size,yPos+size);

        let br = this.IsUndefined(xPos-size,yPos+size);

        var ave = this.Average([
            ul,   // upper left
            ur,   // upper right
            lr,   // lower right
            br    // lower left
        ]);

        this.Verticies[xPos][yPos].y = ave+offset*this.offsetMultiplier;
    }

    Diamond(xPos, yPos, size, offset) {

        let t = this.IsUndefined(xPos,yPos-size);

        let r = this.IsUndefined(xPos+size,yPos);

        let b = this.IsUndefined(xPos,yPos+size);

        let l = this.IsUndefined(xPos-size,yPos);

        var ave = this.Average([
            t,      // top
            r,      // right
            b,      // bottom
            l       // left
        ]);

        this.Verticies[xPos][yPos].y = ave+offset*this.offsetMultiplier;
    }

    Divide(size) {
        
        let x, y, half = Math.floor(size / 2);
        let scale = this.scaleMultiplier * size;

        if (half < 1) {
            return;
        }

        for (y = half; y < this.Verticies.length-1; y += size) {
            for (x = half; x < this.Verticies.length-1; x += size) {
                this.Square(x, y, half, random(y,x) * scale * 2 - scale);
            }
        }

        for (y=0; y <= this.Verticies.length-1; y += half) {
            for (x = (y+half) % size; x <= this.Verticies.length-1; x+= size) {
                this.Diamond(x,y,half, random(y,x) * scale * 2 - scale);
            }
        }

        this.Divide(size/2);

    }

    GenerateY(verticies,width,height) {

        // http://www.playfuljs.com/realistic-terrain-in-130-lines/

        this.Verticies = verticies;

        this.Verticies[0][0].y = 2000;
        this.Verticies[0][this.Verticies.length-1].y = 0;
        this.Verticies[this.Verticies.length-1][0].y = 1000;
        this.Verticies[this.Verticies.length-1][this.Verticies.length-1].y = 1000;

        this.Divide(this.Verticies.length-1);

    }
}