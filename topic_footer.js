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

// Display this page's topics
dv.el("hr", "");
var output = "";
if (current.topics && Array.isArray(current.topics) && current.topics.length > 0) {
    output += "- Topics: " + current.topics.join(", ") + "\n";
} else {
    output += "- *This page has no topics.*\n";
}

// Display this page's sources
if (current.sources && Array.isArray(current.sources) && current.sources.length > 0) {
    output += "- Sources: " + current.sources.join(", ") + "\n";
}

dv.paragraph(output);