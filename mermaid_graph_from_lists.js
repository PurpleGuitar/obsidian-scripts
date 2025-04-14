//console.log("==== NEW RUN ====");

/* Regular expression to filter list items.  Only list items whose text
 * matches this regex will be in the graph. */
let item_filter_regex = ".*";

/* Process input parameters, if any */
if (input) {

    if ("item_filter" in input) {
        item_filter_regex = input.item_filter;
    }

}

/* Colors for node branches. */
const NODE_COLORS = [
    "#efe", // green
    "#eff", // cyan
    "#eef", // blue
    "#fef", // purple
    "#fee", // red
    "#fed", // orange
    "#ffe", // yellow
]

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

let nodes = [];
let nodes_by_section_name = {};

let page = dv.current();
let lists = page.file.lists;
for (const item of lists) {
	let match = item.text.match(item_filter_regex);
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
	if (node.text.contains('"')) {
    	node.text = node.text.replaceAll('"', "'");
	}
	nodes.push(node);
	if (!(node.section in nodes_by_section_name)) {
    	nodes_by_section_name[node.section] = []
	}
	nodes_by_section_name[node.section].push(node);
}

let output = "\n\n```mermaid\n";
let node_color = 0;
output += "graph TD\n"
for (const section in nodes_by_section_name) {
    let section_hash = "s" + djb2Hash(section);
    let previous_hash = section_hash;
    output += `\n  ${section_hash}["${section}"]\n`;
    output += `    style ${section_hash} fill:${NODE_COLORS[node_color]},stroke-width:3px\n`
    for (const node of nodes_by_section_name[section]) {
        output += `    ${node.hash}["${node.text}"]\n`;
        output += `    ${previous_hash} --> ${node.hash}\n`;
        output += `    style ${node.hash} fill: ${NODE_COLORS[node_color]}\n`
        previous_hash = node.hash;
    }
    node_color += 1;
    if (node_color >= NODE_COLORS.length) {
        node_color = 0;
    }
}
output += "```\n\n"
dv.paragraph(output);
