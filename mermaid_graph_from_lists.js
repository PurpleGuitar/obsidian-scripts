//console.log("==== NEW RUN ====");

// Optionally filter items
// e.g. Starts with year: /^(\d{4}): (.+)/ 
let item_filter_regex = ".*";

if (input) {

    if ("item_filter" in input) {
        item_filter_regex = input.item_filter;
    }

}

// Node colors.
const NODE_COLORS = [
    "#eef", // blue
    "#fed", // orange
    "#ffe", // yellow
    "#fee", // red
    "#efe", // green
    "#eff", // cyan
    "#fef", // purple
]

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
	let section = item.section.subpath;
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
