// Get current page
const current = dv.current();

// Get incoming links not already linked from this page
const inlinks = dv.pages("[[]] AND !outgoing([[]])").sort(page => page.file.name);

// Get journal entries (backlinks that start with a year)
const journalEntries = inlinks.filter(childPage =>{
    return childPage.file.name.match(/^\d{4}/);
}).sort(page => page.file.name, "desc");

// Get subtopics (non-journal links that are topics of the current page)
const subtopics = inlinks.filter(childPage =>{
    return childPage.topics && 
           Array.isArray(childPage.topics) && 
           childPage.topics.some(topic => topic.path == current.file.path) &&
           journalEntries.includes(childPage) === false;
});

// Get backlinks (non-subtopic, non-journal links)
const backlinks = inlinks.filter(childPage =>{
    return subtopics.includes(childPage) === false &&
           journalEntries.includes(childPage) === false;
});

// Display subtopics, if any
if (subtopics.length > 0) {
    dv.header(1, "Subtopics");
    dv.list(subtopics.file.link);
}

// Display backlinks, if any
if (backlinks.length > 0) {
    dv.header(1, "Backlinks");
    dv.list(backlinks.file.link);
}

// Display journal entries, if any
if (journalEntries.length > 0) {
    dv.header(1, "Journal Entries");
    dv.list(journalEntries.file.link);
}

// Helper function to print a sublist or single item
function printListOrSingle(label, items, showMessageIfEmpty = false) {
    var output = "";
    if (items && Array.isArray(items) && items.length > 0) {
        if (items.length > 1) {
            output += `- ${label}s:\n`;
            items.forEach(item => {
                output += "    - " + item + "\n";
            });
        } else {
            output += `- ${label}: ` + items[0] + "\n";
        }
    } else {
        if (showMessageIfEmpty) {
            output += `- *This page has no ${label.toLowerCase()}s.*\n`;
        }
    }
    return output;
}

// Display this page's topics
dv.el("hr", "");
var output = "";
output += printListOrSingle("Topic", current.topics, true);
output += printListOrSingle("Source", current.sources);
output += printListOrSingle("See also", current.seealso);

dv.paragraph(output);
