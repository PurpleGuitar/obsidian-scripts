/* global dv, input */

/*
 * This script generates a mermaid graph from the list items in the current note.
 * Each section of the note is represented as a separate branch in the graph.
 * The nodes are connected in the order they appear in the list.  If two nodes
 * have the same text, they are treated as the same node, allowing branches to
 * connect to each other.
 */

/**
 * Builds an array of RegExp objects from an input string list.
 * Invalid patterns are skipped; if all provided patterns are invalid,
 * the existing list is preserved.
 *
 * @param {unknown[]} patterns - Input patterns from user input.
 * @param {string} list_name - Friendly list name for warnings.
 * @param {RegExp[]} current_list - Existing list to preserve on total failure.
 * @returns {RegExp[]} Parsed regex list.
 */
function parseRegexList(patterns, list_name, current_list) {
    const parsed = [];
    let invalid_count = 0;

    for (const pattern of patterns) {
        if (typeof pattern !== "string") {
            invalid_count += 1;
            continue;
        }

        try {
            parsed.push(new RegExp(pattern));
        } catch (error) {
            invalid_count += 1;
            // eslint-disable-next-line no-console
            console.warn(`Invalid regex in ${list_name}: ${pattern}. Skipping.`);
        }
    }

    if (patterns.length > 0 && parsed.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`All regex patterns for ${list_name} were invalid. Keeping previous values.`);
        return current_list;
    }

    if (invalid_count > 0) {
        // eslint-disable-next-line no-console
        console.warn(`Skipped ${invalid_count} invalid regex pattern(s) in ${list_name}.`);
    }

    return parsed;
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
        .replaceAll('\"', "'")
        .replaceAll(":", "\\:")
        .replaceAll("[[", "")
        .replaceAll("]]", "")
        .replaceAll("[", "\\[")
        .replaceAll("]", "\\]");
}

/* Debug output */
let debug = false; // Set to true to enable debug output

/* Arrays of regular expressions to filter sections.  Sections must match at
 * least one regex in the section_whitelist and none in the section_blacklist to
 * be included. */
let section_whitelist = [/.*/]; // Default: include all sections
let section_blacklist = []; // Default: exclude no sections

/* Arrays of regular expressions to filter list items.  Items must match at least
 * one regex in the node_whitelist and none in the node_blacklist to be included. */
let node_whitelist = [/.*/]; // Default: include all items
let node_blacklist = []; // Default: exclude no items

/* Node customizations */
let node_wrapping_width = 300; // Default wrapping width for node text in pixels

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

    /* Debug output */
    if ("debug" in input && input.debug) {
        console.log("Input parameters:", input);
        debug = true;
    }

    /* Section whitelist */
    if ("section_whitelist" in input && Array.isArray(input.section_whitelist)) {
        section_whitelist = parseRegexList(input.section_whitelist, "section_whitelist", section_whitelist);
    }

    /* Section blacklist */
    if ("section_blacklist" in input && Array.isArray(input.section_blacklist)) {
        section_blacklist = parseRegexList(input.section_blacklist, "section_blacklist", section_blacklist);
    }

    /* Node whitelist */
    if ("node_whitelist" in input && Array.isArray(input.node_whitelist)) {
        node_whitelist = parseRegexList(input.node_whitelist, "node_whitelist", node_whitelist);
    }

    /* Node blacklist */
    if ("node_blacklist" in input && Array.isArray(input.node_blacklist)) {
        node_blacklist = parseRegexList(input.node_blacklist, "node_blacklist", node_blacklist);
    }

    /* Node wrapping width */
    if ("node_wrapping_width" in input && Number.isInteger(input.node_wrapping_width)) {
        node_wrapping_width = input.node_wrapping_width;
    }

    /* Branch colors */
    if ("branch_colors" in input) {
        if (Array.isArray(input.branch_colors) &&
            input.branch_colors.length > 0 &&
            input.branch_colors.every(color => typeof color === "string" && color.length > 0)) {
            branch_colors = input.branch_colors;
        } else {
            // eslint-disable-next-line no-console
            console.warn("Invalid branch_colors input. Using previous colors.");
        }
    }
}

/* Organize the list items into sections and generate hashes for each item.  The
 * hash is used to create a unique identifier for each node in the graph. */
const nodes_by_section_name = {};
const nodes_by_hash = {};
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
    const node_hash = "n" + djb2Hash(item.text).padStart(8, "0");
    const section = item.section.subpath || page.file.name;
    const node = {
        "hash": node_hash,
        "section": section,
        "text": item.text,
        "shared": node_hash in nodes_by_hash // Indicates if this node is shared with another section
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
    nodes_by_hash[node.hash] = node;
}

/* Generate a mermaid graph from the nodes.  Each section is represented as a
 * separate branch in the graph.  The nodes are connected in the order they
 * appear in the list.  If two nodes have the same text, they are treated as the
 * same node, allowing branches to connect to each other. */

/* Section header defaults */
const SECTION_STROKE_WIDTH = "3px"; // Stroke width for section headers

/* Node defaults */
const NODE_STROKE_WIDTH = "1px"; // Default stroke width
const NODE_STROKE_COLOR = "#000"; // Default stroke color
const NODE_FONT_COLOR = "#000"; // Default stroke color
const NODE_SHARED_FILL_COLOR = "#eeeeee"; // Light gray for shared nodes

/* TODO item defaults */
const TODO_STROKE_COLOR = "#ff0000"; // Red for TODO items
const TODO_STROKE_WIDTH = "2px"; // Stroke width for TODO items
const TODO_FONT_COLOR = "#600"; // Dark red font for TODO items
const TODO_FILL_COLOR = "white"; // White for TODO items
const TODO_DASHARRAY = "11 5"; // Dashed border for TODO items

/* Start the mermaid graph definition.  If debug mode is enabled, use a plain
 * code block instead of a mermaid block to make it easier to see the raw output. */
let output = "\n\n```mermaid\n";
if (debug) {
    output = "\n\n```\n";
}

/* Mermaid graph configuration.  
   This sets the flowchart style to use linear curves 
   and the specified wrapping width. */
output += `
%%{
    init: {
        "flowchart": {
            "curve": "linear",
            "wrappingWidth": ${node_wrapping_width}
        }
    }
}%%
`;

/* Generate the graph.  Each section is a separate branch, and nodes are
 * connected in the order they appear in the list.  Nodes with the same text are
 * treated as the same node, allowing branches to connect to each other. */

let branch_color = 0; output += "graph TD\n";

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
    const section_style = {
        "stroke": "#000",
        "stroke-width": SECTION_STROKE_WIDTH,
        "fill": branch_colors[branch_color]
    };
    output += `    style ${section_hash} ${Object.entries(section_style).map(([k, v]) => `${k}:${v}`).join(",")}\n`;
    for (const node of nodes_by_section_name[section]) {

        /* Write node */
        output += `    ${node.hash}["${node.text}"]\n`;

        /* Write node style */
        const node_style = {
            "stroke": NODE_STROKE_COLOR,
            "stroke-width": NODE_STROKE_WIDTH,
            "fill": branch_colors[branch_color],
            "color": NODE_FONT_COLOR,
            "text-align": "left"
        };
        if (node.shared) {
            node_style["fill"] = NODE_SHARED_FILL_COLOR;
        }
        if (node.text.includes("TODO")) {
            node_style["stroke"] = TODO_STROKE_COLOR;
            node_style["stroke-width"] = TODO_STROKE_WIDTH;
            node_style["fill"] = TODO_FILL_COLOR;
            node_style["color"] = TODO_FONT_COLOR;
            node_style["stroke-dasharray"] = TODO_DASHARRAY;
        }
        output += `    style ${node.hash} ${Object.entries(node_style).map(([k, v]) => `${k}:${v}`).join(",")}\n`;

        /* Write edge */
        output += `    ${previous_node_hash} --> ${node.hash}\n`;
        previous_node_hash = node.hash;
    }

    /* Rotate branch color */
    branch_color = (branch_color + 1) % branch_colors.length;
}
output += "\n\n```\n\n";

/* Output the graph.  The graph is displayed as a mermaid diagram in Obsidian. */

dv.paragraph(output);
