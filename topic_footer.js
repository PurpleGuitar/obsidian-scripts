
// Helper function to print a section of links
function printLinksSection(title, pages) {
    if (pages.length > 0) {
        dv.header(1, title);
        dv.list(pages.map(page => {
            if (page.summary) {
                // Page has a summary, include it in the link
                return page.file.link + ": " + page.summary;
            } else {
                // No summary, just link to the page
                return page.file.link;
            }
        }));
    }
}

// Helper function to print a sublist or single item in the footer
function printFooterItem(label, items, pluralLabel, showMessageIfEmpty = false) {
    var output = "";
    if (items && Array.isArray(items) && items.length > 0) {
        if (items.length > 1) {
            output += `- ${pluralLabel}:\n`;
            items.forEach(item => {
                output += "    - " + item + "\n";
            });
        } else {
            output += `- ${label}: ` + items[0] + "\n";
        }
    } else {
        if (showMessageIfEmpty) {
            output += `- *This page has no ${pluralLabel.toLowerCase()}.*\n`;
        }
    }
    return output;
}

// Helper function to determine sort order of folders
function folderSortKey(folderName) {
  // Topics folder should be first
  if (folderName === "Topics") return 0;
  // Journal folders should be last
  if (folderName.startsWith("Journal")) return 9;
  // Otherwise just sort by name
  return 5;
}

// Get current page
const current = dv.current();

// Get incoming links not already linked from this page
const inlinks = dv.pages("[[]] AND !outgoing([[]])").sort(page => page.file.name);

// Organize incoming links by folder
let inlinksByFolder = {};
inlinks.forEach(inlink => {
    if (inlinksByFolder[inlink.file.folder] === undefined) {
        inlinksByFolder[inlink.file.folder] = [];
    }
    inlinksByFolder[inlink.file.folder].push(inlink);
});

// Get list of folders sorted the way we want
let inlinkFolders = Object.keys(inlinksByFolder).sort((a, b) => {
    let sortA = folderSortKey(a);
    let sortB = folderSortKey(b);
    if (sortA === sortB) {
        // If both folders have the same sort key, sort by name
        return a.localeCompare(b);
    }
    // Otherwise sort by the defined sort key
    return sortA - sortB;
});

// Display incoming links organized by folder
for (const folder of inlinkFolders) {
    printLinksSection(folder, dv.array(inlinksByFolder[folder]));
}

// Display this page's metadata in the footer
dv.el("hr", "");
var output = "";
output += printFooterItem("Topic", current.topics, "Topics", true);
output += printFooterItem("See also", current.seealso, "See also");
output += printFooterItem("Source", current.sources, "Sources");
dv.paragraph(output);
