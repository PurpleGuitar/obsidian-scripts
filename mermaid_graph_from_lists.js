/* 
 * This script generates a mermaid graph from the list items in the current note.
 * Each section of the note is represented as a separate branch in the graph.
 * The nodes are connected in the order they appear in the list.  If two nodes
 * have the same text, they are treated as the same node, allowing branches to
 * connect to each other.
 */

/* Regular expression to filter list items.  Only list items whose text
 * matches this regex will be in the graph. */
let item_filter = ".*";

/* Colors for node branches. */
let branch_colors = [
    "#efe", // green
    "#eff", // cyan
    "#eef", // blue
    "#fef", // purple
    "#fee", // red
    "#fed", // orange
    "#ffe", // yellow
];

/* Process input parameters, if any */
if (input) {

    /* Item filter */
    if ("item_filter" in input && typeof input.item_filter === "string") {
        item_filter = input.item_filter;
    }

    /* Branch colors */
    if ("branch_colors" in input) {
        if (Array.isArray(input.branch_colors) && 
            input.branch_colors.every(color => typeof color === "string")) {
            branch_colors = input.branch_colors;
        } else {
            console.warn("Invalid branch_colors input. Using default colors.");
        }
    }
}

/**
 * Generates a hash for a given string using the DJB2 algorithm.
 *
 * The DJB2 algorithm is a simple and fast hashing function designed by Daniel J. Bernstein.
 * It starts with an initial hash of 5381 and for each character, multiplies the hash by 33
 * and adds the character's ASCII code. The result is returned as an unsigned 32-bit hex string.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} A hexadecimal string representing the unsigned 32-bit DJB2 hash of the input.
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
  }
  return (hash >>> 0).toString(16); // Unsigned 32-bit hex string
}

/* Organize the list items into sections and generate hashes for each item.  The
 * hash is used to create a unique identifier for each node in the graph. */
let nodes = [];
let nodes_by_section_name = {};
let page = dv.current();
let lists = page.file.lists;
for (const item of lists) {
	let match = item.text.match(item_filter);
	if (!match) {
		continue;
	}
	let hash = "n" + djb2Hash(item.text).padStart(8, "0");
	let section = item.section.subpath || page.file.name;
	let node = {
		"hash": hash,
		"section": section,
		"text": item.text
	};
	if (node.text.includes('"')) {
    	node.text = node.text.replaceAll('"', "'");
	}
	nodes.push(node);
	if (!(node.section in nodes_by_section_name)) {
    	nodes_by_section_name[node.section] = []
	}
	nodes_by_section_name[node.section].push(node);
}

/* Genrate a mermaid graph from the nodes.  Each section is represented as a
 * separate branch in the graph.  The nodes are connected in the order they
 * appear in the list.  If two nodes have the same text, they are treated as the
 * same node, allowing branches to connect to each other. */
const STROKE_COLOR = "#000"; // Default stroke color
const TODO_FILL_COLOR = "#ffffaa"; // Yellow for TODO items
const TODO_STROKE_COLOR = "#ff0000"; // Red for TODO items
let output = "\n\n```mermaid\n";
let branch_color = 0;
output += "graph TD\n"
for (const section in nodes_by_section_name) {
    let section_hash = "s" + djb2Hash(section);
    let previous_hash = section_hash;
    output += `\n  ${section_hash}["**${section}**"]\n`;
    output += `    style ${section_hash} stroke:#000,stroke-width:3px,fill:${branch_colors[branch_color]}\n`
    for (const node of nodes_by_section_name[section]) {

        /* Write node */
        output += `    ${node.hash}["${node.text}"]\n`;

        /* Write node style */
        let stroke_color = STROKE_COLOR;
        let fill_color = branch_colors[branch_color];
        if (node.text.includes("TODO")) {
            fill_color = TODO_FILL_COLOR;
            stroke_color = TODO_STROKE_COLOR
        }
        output += `    style ${node.hash} stroke:${stroke_color},fill:${fill_color}\n`;

        /* Write edge */
        output += `    ${previous_hash} --> ${node.hash}\n`;
        previous_hash = node.hash;
    }
    branch_color = (branch_color + 1) % branch_colors.length;
}
output += "```\n\n"

/* Output the graph.  The graph is displayed as a mermaid diagram in Obsidian. */
dv.paragraph(output);
