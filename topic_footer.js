
// Helper function to print a section of links
function printLinksSection(title, pages) {
    if (pages.length > 0) {
        dv.header(1, title);
        dv.list(pages.map(page => {
            if (page.summary) {
                return page.file.link + ": " + page.summary;
            }
            return page.file.link;
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

// Get current page
const current = dv.current();

// Get incoming links not already linked from this page
const inlinks = dv.pages("[[]] AND !outgoing([[]])").sort(page => page.file.name);

// Organize incoming links into buckets
let topics = [];
let notes = []
let backlinks = [];
let journalEntries = [];
inlinks.forEach(inlink => {
    if (inlink.file.path.startsWith("Journal/")) {
        journalEntries.push(inlink);
    } else if (inlink.topics &&
               Array.isArray(inlink.topics) && 
               inlink.topics.some(topic => topic.path == current.file.path)) {
        // This inlink lists the current page as a topic; 
        // it's either a subtopic or a note
        if (inlink.file.path.startsWith("Topics/")) {
            // It's in the Topics folder, so it's a subtopic
            topics.push(inlink);
        } else {
            // Not a subtopic, so it's a note
            notes.push(inlink);
        }
    } else {
        // Not a journal entry, subnote, or topic, so it's a backlink
        backlinks.push(inlink); 
    }
});

// Write link sections
printLinksSection("Topics", topics);
printLinksSection("Notes", notes);
printLinksSection("Backlinks", backlinks);
printLinksSection("Journal Entries", journalEntries);

// Display this page's metadata in the footer
dv.el("hr", "");
var output = "";
output += printFooterItem("Topic", current.topics, "Topics", true);
output += printFooterItem("See also", current.seealso, "See also");
output += printFooterItem("Source", current.sources, "Sources");
dv.paragraph(output);
