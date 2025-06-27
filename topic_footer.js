/* global dv */

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
    let output = "";
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

// Helper function to determine sort order of folders.
// "Topics" always first, "Journal" always last, everything else alphabetical.
function folderSortKey(a, b) {
    // "Topics" always first
    if (a === "Topics") { return -1; }
    if (b === "Topics") { return 1; }
    // "Journal" always last
    if (a === "Journal") { return 1; }
    if (b === "Journal") { return -1; }
    // For everything else, sort alphabetically
    return a.localeCompare(b);
}

// Get current page
const current = dv.current();

// Get incoming links not already linked from this page
const inlinks = dv.pages("[[]] AND !outgoing([[]])").sort(page => page.file.name);

// Organize incoming links by folder
const inlinksByFolder = {};
inlinks.forEach(inlink => {
    if (inlinksByFolder[inlink.file.folder] === undefined) {
        inlinksByFolder[inlink.file.folder] = [];
    }
    inlinksByFolder[inlink.file.folder].push(inlink);
});

// Get list of folders sorted the way we want
const inlinkFolders = Object.keys(inlinksByFolder).sort(folderSortKey);

// Display incoming links organized by folder
for (const folder of inlinkFolders) {
    printLinksSection(folder, dv.array(inlinksByFolder[folder]));
}

// Display this page"s metadata in the footer
dv.el("hr", "");
let output = "";
output += printFooterItem("Source", current.sources, "Sources");
output += printFooterItem("See also", current.seealso, "See also");
output += printFooterItem("Topic", current.topics, "Topics", true);
dv.paragraph(output);
