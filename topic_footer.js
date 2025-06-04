// Get current page
const current = dv.current();

// Get incoming links not already linked from this page
const inlinks = dv.pages("[[]] AND !outgoing([[]])").sort(page => page.file.name);

// Get subtopics
const subtopics = inlinks.filter(childPage =>{
    return childPage.topics && 
           Array.isArray(childPage.topics) && 
           childPage.topics.some(topic => topic.path == current.file.path);
});

// Get backlinks (that is, non-subtopic links)
const backlinks = inlinks.filter(childPage =>{
    return subtopics.includes(childPage) === false;
});

// Display subtopics, if any
if (subtopics.length > 0) {
    dv.header(1, "Subtopics");
    dv.list(subtopics.file.link);
}

// Display other links, if any
if (backlinks.length > 0) {
    dv.header(1, "Backlinks");
    dv.list(backlinks.file.link);
}

// Display this page's topics
dv.el("hr", "");
if (current.topics && Array.isArray(current.topics) && current.topics.length > 0) {
    dv.paragraph("Topics: " + current.topics.join(", "));
} else {
    dv.paragraph("*This page has no topics.*");
}