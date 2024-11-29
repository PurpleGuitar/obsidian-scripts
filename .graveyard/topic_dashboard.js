dv.header(1, "Topic Dashboard");

/* Get info about the current page. */
let currentPage = dv.current();
let folder = currentPage.file.folder

/* Find all other pages in this directory and below it. */
let subPages = dv.pages('"' + folder + '"').filter(page => {
    return page.file.path != currentPage.file.path;
}).sort(page => {
    return page.file.path;
});

/*
 * PARENT TOPIC
 */

let topicParentFilename = currentPage.file.folder.replace(/\/[^/]*$/, "")
topicParentFilename = topicParentFilename.replace(/\/([^/]*)$/, "/$1/$1.md")
let topicParent = dv.page(topicParentFilename);
if (topicParent) {
    dv.paragraph("Parent topic: " + topicParent.file.link);
}

/*
 * SUBTOPICS 
 */

/* Subtopics are pages below this one that have the same name as their
 * parent folder.  We remember which folders have topic pages so that we
 * don't list them twice. */
let subTopicsByFolder = {};
let subTopics = subPages.filter(page => {
    let subtopicParentFolder = page.file.folder.split('/').pop()
    if (page.file.name == subtopicParentFolder) {
        subTopicsByFolder[page.file.folder] = page;
        return true;
    }
    return false;
});
let subTopicLinks = subTopics.map(page => {
    let relativePath = page.file.path.replace(currentPage.file.folder, "");
    relativePath = relativePath.replace(/\/[^/]*$/, "");
    relativePath = relativePath.replace(/^\//, "");
    return dv.fileLink(page.file.path, false, relativePath);
}).sort(link => {
    return link.display;
});
if (subTopicLinks.length > 0) {
    dv.header(2, "Subtopics");
    dv.list(subTopicLinks);
}

/*
 * NOTES
 */

/* Notes are subpages that don't have their own subtopic. This can be other
 * pages in the current directory, or pages in folders that don't have a
 * subtopic page. */
let notes = subPages.filter(page => {
    return !(page.file.folder in subTopicsByFolder);
})
if (notes.length > 0) {
    dv.header(2, "Notes");
    dv.list(notes.file.link);
}


