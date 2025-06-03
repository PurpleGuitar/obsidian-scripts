// dv.execute(`
//     LIST summary
//     FROM [[]] and !outgoing([[]])
// `);

const pages = dv.pages("[[]] and !outgoing([[]])");
const elements = pages.map(page => {
    if (page.summary) {
        return page.file.link + ": " + page.summary;
    } else {
        return page.file.link;
    }
});
dv.list(elements);
