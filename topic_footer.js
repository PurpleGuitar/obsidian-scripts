// Get current page
const current = dv.current();

// Get incoming links
const inlinks = dv.pages("[[]]").sort();

// Get list of topic child pages
// i.e. pages that link to the current page via their topics field
const topicChildren = inlinks.filter(page => {
    if (page.topics && Array.isArray(page.topics)) {
        return page.topics.some(topic => {
            return topic.path == current.file.path;
        });
    }
    return false;
});

// Get list of topic children not already linked from this page
const unlinkedTopicChildren = topicChildren.filter(page => {
    return !current.file.outlinks.includes(page.file.link);
});

// If there are any unlinked topic children, display them
if (unlinkedTopicChildren.length > 0) {
    dv.header(1, "Notes for this Topic");
    dv.list(unlinkedTopicChildren.file.link);
}

// Topics 
dv.el("hr", "");
if (current.topics && current.topics.length > 0) {
    if (Array.isArray(current.topics)) {
        dv.paragraph("Topics: " + current.topics.join(", "));
    } else {
    dv.paragraph("==Error: topics field is not an array.==");
    }
} else {
    dv.paragraph("*This page has no topics.*");
}