const fs = require("fs");

// Uncomment any 'console.log()' statments for easier to read output.

function addChildToBachelors(str) {
    // console.log("\nReading Data...");

    let graph = toJson(str)
    validateGraphJson(graph);

    // console.log(`\nNew Node: ${graph.newNode}`)
    // console.log("\nChecking for nodes without children...")

    if (graph.nodes.length < 1) {
        //early exit for no nodes
        graph.nodes.push(graph.newNode);
        // console.log("\nNo nodes!")

    } else {
        // Store the nodes and their corresponding all of their paths to children in a dictionary
        let paths = {};
        for (let node of graph.nodes) {
            paths[node] = [];
        }

        for (let edge of graph.edges) {
            // Check for edges without corresponding parents and children
            if (!paths[edge[0]]) throw new Error(`The parent node for edge [${edge}] does not exist!`)
            if (!paths[edge[1]]) throw new Error(`The child node for edge [${edge}] does not exist!`)
            paths[edge[0]].push(edge[1])
        }

        // For each node in paths, if there are no paths to children, add the newNode as a child
        let nodesWithoutChildren = true;

        for (let node in paths) {
            if (paths[node].length < 1) {
                // Node IDs are restricted to strings and numbers, so try to parse them back to an integer.
                // Otherwise leave them as a string.
                let id = parseInt(node);
                graph.edges.push([id || node, graph.newNode])
                nodesWithoutChildren = false;
            }
        }

        if (nodesWithoutChildren === true) console.log("\nNo nodes without children!")
    }

    // get rid of the newNode for the return
    delete graph.newNode;
    // console.log("\nNew Graph:\n", graph)
    return graph;
}

function toJson(str) {
    const contents = fs.readFileSync(str)
    var jsonContents;

    try {
        jsonContents = JSON.parse(contents)
    }
    catch (error) {
        throw error;
    }
    return jsonContents;
}


function validateGraphJson(json) {
    // console.log("\nValidating Graph...")

    if (typeof json !== "object") throw new Error("Invalid Graph Object")
    if (!json.nodes) throw new Error("The Graph is missing 'nodes'")

    if (!Array.isArray(json.nodes)) throw new Error("Invalid json.nodes")
    if (!json.edges) throw new Error("The Graph is missing 'edges'")

    if (!Array.isArray(json.edges)) throw new Error("Invalid json.edges")
    if (!json.newNode) throw new Error("The Graph is missing 'newNode'")

    if (json.nodes.length < 1 && json.edges.length > 1) throw new Error("There are no nodes for the supplied edges!")

    if (typeof json.newNode !== "number" && typeof json.newNode !== "string") throw new Error("Invalid newNode")
}


console.log(addChildToBachelors("zulilyData.txt"))
