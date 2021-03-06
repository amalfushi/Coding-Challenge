const fs = require('fs');

class Node {
    constructor(y, x, dist, val) {
        this.vert = y;
        this.hori = x;
        this.distance_traveled = dist;
        this.value = val;
    }
}

class Camper {
    constructor(start, max, yMax, xMax, map) {
        this.vert = start[0];
        this.hori = start[1]
        this.max_Distance = max;
        this.max_Vert = yMax;
        this.max_Hori = xMax;
        this.map = map;
    }

    // Treating the Campers movement like breadth-first graph traversal.
    // Add nodes to a queue starting with the camper's tent and branching outward from the cardinal directions.
    findNearest(commodity) {
        let queue = [];
        queue.push(new Node(this.vert, this.hori, 0, this.map.getCell(this.vert, this.hori)));

        while (queue.length > 0) {
            let node = queue.shift();

            // Check the value on the map (it may have been changed by visited by another node).
            let val = this.map.getCell(node.vert, node.hori);

            // If we've seen this cell before, do nothing.
            if (val == "S") continue;

            // Mark this node on the graph(map) as seen.
            if (val == ".") this.map.markCellasSeen(node.vert, node.hori);

            // Return node if it is Food or Water
            if (val === commodity) {
                this.map.resetSeenCells();
                return node;
            }

            // Add adjacent nodes to the queue if we can still travel. Since camper's can only move over open ground, I don't count tents as open ground
            if (node.distance_traveled < this.max_Distance) {
                // check tile below
                if (node.vert + 1 < this.max_Vert) {
                    val = this.map.getCell(node.vert + 1, node.hori);
                    if (val != "S" && val != "T" && val != "X") {
                        queue.push(new Node(node.vert + 1, node.hori, node.distance_traveled + 1, val));
                    }
                }
                //check tile to the right
                if (node.hori + 1 < this.max_Hori && this.map.getCell(node.vert, node.hori + 1) != "S") {
                    val = this.map.getCell(node.vert, node.hori + 1);
                    if (val != "S" && val != "T" && val != "X") {
                        queue.push(new Node(node.vert, node.hori + 1, node.distance_traveled + 1, val));
                    }
                }
                //check tile above
                if (node.vert - 1 >= 0 && this.map.getCell(node.vert - 1, node.hori) != "S") {
                    val = this.map.getCell(node.vert - 1, node.hori);
                    if (val != "S" && val != "T" && val != "X") {
                        queue.push(new Node(node.vert - 1, node.hori, node.distance_traveled + 1, val));
                    }
                }
                // check tile to the left
                if (node.hori - 1 >= 0 && this.map.getCell(node.vert, node.hori - 1) != "S") {
                    val = this.map.getCell(node.vert, node.hori - 1);
                    if (val != "S" && val != "T" && val != "X") {
                        queue.push(new Node(node.vert, node.hori - 1, node.distance_traveled + 1, val));
                    }
                }

            }
        }
        this.map.resetSeenCells();
        return null;
    }
}

class Campground {
    constructor(str) {
        this.map = [];
        this.rows;
        this.columns;
        this.travel_distance;
        this.buildNewMap(str);
        this.tents = this.getTents();
    }

    buildNewMap(str) {
        // Will explode if the file isn't set up just right.
        const temp = this.readInputFile(str)

        for (let i = 1; i < temp.length; i++) {
            this.map.push(temp[i].split(""));
        }

        // break apart the first line for the parameters. Helpful for validating the map...
        const params = temp[0].split(",")
        this.rows = params[0].trim();
        this.columns = params[1].trim();
        this.travel_distance = params[2].trim();
    }

    readInputFile(str) {
        const contents = fs.readFileSync(str, "utf8").trim()
        return contents.split("\n");
    }

    getTents() {
        let tents = [];
        // Iterate over the map looking for tents. Add's their coordinates to a matrix;
        for (let vert = 0; vert < this.map.length; vert++) {
            for (let hori = 0; hori < this.map[0].length; hori++) {
                if (this.map[vert][hori] === "T") {
                    tents.push([vert, hori]);
                }
            }
        }
        return tents;
    }

    getCell(vert, hori) {
        return this.map[vert][hori];
    }

    // helps track camper movement
    markCellasSeen(vert, hori) {
        this.map[vert][hori] = "S";
    }

    resetSeenCells() {
        for (let vert = 0; vert < this.map.length; vert++) {
            for (let hori = 0; hori < this.map[0].length; hori++) {
                if (this.map[vert][hori] === "S") {
                    this.map[vert][hori] = "."
                }
            }
        }
    }

    countValidCampers() {
        // Make a copy of the array of tents so we can remove elements from it without messing up the toString()
        let campers = this.tents.copyWithin()
        let maxCampers = 0;

        while (campers.length > 0) {
            let camper = new Camper(campers.pop(), this.travel_distance, this.rows, this.columns, this);

            // Look for the nearest food and water.  There's probably some edge cases where the nearest might not be the best
            let food = camper.findNearest("F");
            let water = camper.findNearest("W");

            // If there is valid food, remove them from the map so there are no Campers doubling up on resources.
            if (food != null && water != null) {
                this.map[food.vert][food.hori] = ".";
                this.map[water.vert][water.hori] = ".";
                maxCampers++;
            }
        }
        return maxCampers;
    }

    toString() {
        let out = [];

        out.push(`Rows: ${this.rows}, Columns: ${this.columns}, Distance: ${this.travel_distance}`)
        out.push("")

        // build pretty map string
        for (let row in this.map) {
            out.push(this.map[row].join(" "))
        }
        out.push("")

        // Build annoying tent string '# Tents: [y, x] [y, x]
        out.push(`${this.tents.length} Tents: ${this.tents.reduce((a, b) => a += `[${b.toString()}] `, "")}`)
        out.push(`\nMax Campers: ${this.countValidCampers()}`)
        // Join the output array into a string seperated by line breaks
        return out.join("\n")
    }
}

console.log("Zulily Challenge 2\n")

let map1;
for(let i = 1; i < 11; i++) {
    map1 = new Campground(`example${i}.txt`);
    console.log(map1.countValidCampers())
    
    // Uncomment these lines for prettier sdtout
    // console.log(`------ Campground ${i} (example${i}.txt) ------`)
    // console.log(map1.toString(), "\n------------------------------------------\n");
}
