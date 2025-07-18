/* global dv, input */

/* 
 * This script generates a mermaid graph from the list items in the current note.
 * Each section of the note is represented as a separate branch in the graph.
 * The nodes are connected in the order they appear in the list.  If two nodes
 * have the same text, they are treated as the same node, allowing branches to
 * connect to each other.
 */

/* Arrays of regular expressions to filter sections.  Sections must match at
 * least one regex in the section_whitelist and none in the section_blacklist to
 * be included. */
let section_whitelist = [/.*/]; // Default: include all sections
let section_blacklist = []; // Default: exclude no sections

/* Arrays of regular expressions to filter list items.  Items must match at least
 * one regex in the node_whitelist and none in the node_blacklist to be included. */
let node_whitelist = [/.*/]; // Default: include all items
let node_blacklist = []; // Default: exclude no items

/* Colors for node branches */
let branch_colors = [
    "#C8DFF0", // Muted blue
    "#F9C6B8", // Coral red
    "#BFE8E0", // Deep green
    "#FAEBA2", // Soft yellow
    "#DAB9C3", // Dusty rose
    "#DFF6F5", // Soft teal:%s
    "#FAD9C3", // Warm orange
];

/* Process input parameters, if any */
if (input) {

    /* Section whitelist */
    if ("section_whitelist" in input && Array.isArray(input.section_whitelist)) {
        section_whitelist = input.section_whitelist.map(regex => new RegExp(regex));
    }

    /* Section blacklist */
    if ("section_blacklist" in input && Array.isArray(input.section_blacklist)) {
        section_blacklist = input.section_blacklist.map(regex => new RegExp(regex));
    }

    /* Node whitelist */
    if ("node_whitelist" in input && Array.isArray(input.node_whitelist)) {
        node_whitelist = input.node_whitelist.map(regex => new RegExp(regex));
    }

    /* Node blacklist */
    if ("node_blacklist" in input && Array.isArray(input.node_blacklist)) {
        node_blacklist = input.node_blacklist.map(regex => new RegExp(regex));
    }

    /* Branch colors */
    if ("branch_colors" in input) {
        if (Array.isArray(input.branch_colors) && 
            input.branch_colors.every(color => typeof color === "string")) {
            branch_colors = input.branch_colors;
        } else {
            // eslint-disable-next-line no-console
            console.warn("Invalid branch_colors input. Using default colors.");
        }
    }
}

/**
 * Generates a hash for a given string using the DJB2 algorithm.
 *
 * The DJB2 algorithm is a simple and fast hashing function designed by Daniel J. Bernstein.
 * It starts with an initial hash of 5381 and for each character, multiplies the hash by 33
 * and adds the character"s ASCII code. The result is returned as an unsigned 32-bit hex string.
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

/**
 * Encodes a text string to escape characters that would break a Mermaid graph.
 *
 * @param {string} text - The input text to encode.
 * @returns {string} The encoded text.
 */
function encodeForMermaid(text) {
    return text
        .replaceAll("\"", "\\\"")
        .replaceAll("\"", "\\\"")
        .replaceAll(":", "\\:")
        .replaceAll("[", "\\[")
        .replaceAll("]", "\\]");
}

/* Organize the list items into sections and generate hashes for each item.  The
 * hash is used to create a unique identifier for each node in the graph. */
const nodes_by_section_name = {};
const page = dv.current();
const lists = page.file.lists;
for (const item of lists) {

    // Check if the item matches at least one regex in the node_whitelist
    const is_whitelisted = node_whitelist.some(regex => regex.test(item.text));
    // Check if the item matches any regex in the node_blacklist
    const is_blacklisted = node_blacklist.some(regex => regex.test(item.text));

    // Skip items that are not whitelisted or are blacklisted
    if (!is_whitelisted || is_blacklisted) {
        continue;
    }

    /* Create node for the item */
    const hash = "n" + djb2Hash(item.text).padStart(8, "0");
    const section = item.section.subpath || page.file.name;
    const node = {
        "hash": hash,
        "section": section,
        "text": item.text
    };

    /* Clean up characters that would break the mermaid graph */
    node.section = encodeForMermaid(section);
    node.text = encodeForMermaid(node.text);

    /* Add the node to the lists of nodes */
    if (!(node.section in nodes_by_section_name)) {
        /* Create section if it doesn"t exist */
        nodes_by_section_name[node.section] = [];
    }
    nodes_by_section_name[node.section].push(node);
}

/* Genrate a mermaid graph from the nodes.  Each section is represented as a
 * separate branch in the graph.  The nodes are connected in the order they
 * appear in the list.  If two nodes have the same text, they are treated as the
 * same node, allowing branches to connect to each other. */

const STROKE_WIDTH = "1px"; // Default stroke width
const STROKE_COLOR = "#000"; // Default stroke color
const FONT_COLOR = "#000"; // Default stroke color
const TODO_STROKE_COLOR = "#ff0000"; // Red for TODO items
const TODO_STROKE_WIDTH = "3px"; // Stroke width for TODO items
const TODO_FONT_COLOR = "#600"; // Dark red font for TODO items
//const TODO_FILL_COLOR = "#ffffaa"; // Yellow for TODO items
let output = "\n\n```mermaid\n";
output += `
%%{
    init: {
        "flowchart": {
            "curve": "linear",
            "wrappingWidth": 300
        }
    }
}%%
`;
let branch_color = 0;
output += "graph TD\n";

for (const section in nodes_by_section_name) {

    // Check if the section matches at least one regex in the section_whitelist
    const is_section_whitelisted = section_whitelist.some(regex => regex.test(section));
    // Check if the section matches any regex in the section_blacklist
    const is_section_blacklisted = section_blacklist.some(regex => regex.test(section));

    // Skip sections that are not whitelisted or are blacklisted
    if (!is_section_whitelisted || is_section_blacklisted) {
        continue;
    }

    /* Generate section hash */
    const section_hash = "s" + djb2Hash(section);
    let previous_node_hash = section_hash;

    /* Write section header */
    output += `\n  ${section_hash}["**${section}**"]\n`;
    output += `    style ${section_hash} stroke:#000,stroke-width:3px,fill:${branch_colors[branch_color]}\n`;
    for (const node of nodes_by_section_name[section]) {

        /* Write node */
        output += `    ${node.hash}["${node.text}"]\n`;

        /* Write node style */
        let stroke_width = STROKE_WIDTH;
        let stroke_color = STROKE_COLOR;
        const fill_color = branch_colors[branch_color];
        let font_color = FONT_COLOR;
        if (node.text.includes("TODO")) {
            stroke_color = TODO_STROKE_COLOR;
            stroke_width = TODO_STROKE_WIDTH;
            // fill_color = TODO_FILL_COLOR;
            font_color = TODO_FONT_COLOR;
        }
        output += `    style ${node.hash} stroke:${stroke_color},stroke-width:${stroke_width},fill:${fill_color},color:${font_color}\n`;

        /* Write edge */
        output += `    ${previous_node_hash} --> ${node.hash}\n`;
        previous_node_hash = node.hash;
    }

    /* Rotate branch color */
    branch_color = (branch_color + 1) % branch_colors.length;
}
output += "```\n\n";

/* Output the graph.  The graph is displayed as a mermaid diagram in Obsidian. */

dv.paragraph(output);
