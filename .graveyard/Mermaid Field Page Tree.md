/*
Include this file in your page to create a Mermaid diagram showing a tree of pages where each page points to its parent(s) or child(ren) via a field. Use it like this:

````
%% 
The folder containing the pages to be diagrammed.
TREE_FOLDER:: Places

The field that points to the parent or child page(s).
TREE_FIELD:: Within

(Optional) The field points to the parent(s), not the child(ren).
TREE_FIELD_IS_PARENT:: True

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

- Topics:: [[DataviewJS]]

# Source Code

```javascript
*/

// Create a Mermaid-compatible slug
function getSlug(pageName) {
	name = pageName.toLowerCase();
	name = name.replaceAll(" ", "-");
	name = name.replaceAll("'", "");
	return name;
}

// Get calling page 
context = dv.current();
const TREE_FOLDER = context.TREE_FOLDER
const TREE_FIELD = context.TREE_FIELD
const TREE_FIELD_IS_PARENT = context.TREE_FIELD_IS_PARENT || false
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
	if (page[TREE_FIELD]) {

		// Process related pages
		let relatedPages = dv.array(page[TREE_FIELD]);
		relatedPages.forEach(relatedPage => {

			// Skip if this isn't a link.
			if (!relatedPage.path) {
				relationships += 
					"\n%% WARNING: Field contains non-link. " + 
					"Page: '" + page.file.name +
					"', Field: '" + TREE_FIELD + 
					"', Value: '" + relatedPage + "'\n";
				return;
			}
		
			// Get slug for related page
			let related = dv.page(relatedPage.path);
			let relatedSlug = getSlug(related.file.name);

			// Write relationship
			if (TREE_FIELD_IS_PARENT) {
				// parent-page --> this-page
				relationships += relatedSlug + " --> " + slug + "\n";
			} else {
				// this-page --> child-page
				relationships += slug + " --> " + relatedSlug + "\n";
			}
			
		})	
		
	}

	// Write node definition
	// page(Name of Page)
	nodes += slug + "(" + page.file.name + ")" + "\n";

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
	output += "%% TREE_FIELD: " + TREE_FIELD + "\n";
	output += "%% TREE_FIELD_IS_PARENT: " + 
			      TREE_FIELD_IS_PARENT + "\n";
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

*/
