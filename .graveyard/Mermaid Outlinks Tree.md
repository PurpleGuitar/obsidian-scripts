/*

Include this file in your page to create a Mermaid diagram where each page points to its outlinks. Use it like this:

````
%% 
The folder containing the pages to be diagrammed.
TREE_FOLDER:: Places

(Optional) Direction of the flowchart, TD by default.
TREE_DIRECTION:: LR

(Optional) Debug mode -- show the source instead of the diagram.
TREE_DEBUG:: True
%%

```dataviewjs
dv.executeJs(await dv.io.load("Scripts/Mermaid Field Page Tree.md"));
```

````

# See Also

- Topics:: [[Vault - Reports]]

# Source Code

```javascript
*/

// Create a Mermaid-compatible slug
function getSlug(pageName) {
	name = pageName.toLowerCase();
	name = name.replaceAll(" ", "");
	name = name.replaceAll("'", "");
	name = name.replaceAll("(", "");
	name = name.replaceAll(")", "");
	name = name.replaceAll("graph", "graff");
	return name;
}

// Get calling page 
context = dv.current();
const TREE_FOLDER = context.TREE_FOLDER
const TREE_DIRECTION = context.TREE_DIRECTION || "TD"
const TREE_DEBUG = context.TREE_DEBUG || false

// Get all nodes
let pages = dv.pages('"' + TREE_FOLDER + '"');

// Prepare sections of Mermaid diagram
let nodes = "\n%% NODES\n";
let relationships = "\n%% RELATIONSHIPS\n";
let classes = "\n%% CLASSES\n";

// For each page:
pages.forEach(page => {

	// Get slug for this page
	let slug = getSlug(page.file.name);

	// If this page has a related page:
	if (page.file.outlinks) {

		// Process related pages
		let relatedPages = page.file.outlinks;
		relatedPages.forEach(relatedPage => {

			// Get related page
			let related = dv.page(relatedPage.path);

			// Skip if doesn't exist (e.g. dead link, image, canvas)
            if (related === undefined) {
                return;
            }

			// Skip if not in the folder
            if (related.file.folder !== TREE_FOLDER) {
                return;
            }

			// Get slug for page
			let relatedSlug = getSlug(related.file.name);
			
			// Skip relationship if requested
			let hideFromTree = dv.array(page.hideFromTree);
			if (hideFromTree.includes(related.file.link)) {
				console.log("Mermaid Outlinks Tree: Skipping " + page.file.name + " -> " + related.file.name);
				return;
			}
			// this-page --> child-page
			relationships += slug + " --> " + relatedSlug + "\n";
			
		})	
		
	}

	// Write node definition
	// page(Name of Page)
	nodes += slug + "[\"" + page.file.name + "\"]" + "\n";

	// Display as link
	// class page internal-link
	classes += "class " + slug + " internal-link\n";
	
});

// Write Mermaid diagram
let output = "";
if (TREE_DEBUG) {
	output = "```\n";
	output += "%% DEBUG MODE\n";
	output += "%% Unset TREE_DEBUG to show the Mermaid diagram\n";
	output += "%% TREE_FOLDER: " + TREE_FOLDER + "\n";
	output += "%% TREE_DEBUG: " + TREE_DEBUG + "\n";
	output += "\n";
} else {
	output += "```mermaid\n";
}
output += "flowchart " + TREE_DIRECTION + "\n";
output += nodes;
output += relationships;
output += classes;
output += "```\n";

// Write to page
dv.paragraph(output);

/*
```

vim: filetype=javascript

*/
