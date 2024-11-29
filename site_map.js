
/*
 * This DataviewJS script creates a site map starting from the given page.
 */

/* INPUT: Pages to consider */
let fromQuery = '""';
if (input && "fromQuery" in input) {
    fromQuery = input.fromQuery;
}

/* INPUT: Start Page path */
let startPagePath = "Notes/Home.md";
if (input && "startPagePath" in input) {
    startPagePath = input.startPagePath;
}

/* INPUT: Show topics */
let showTopics = true;
if (input && "showTopics" in input) {
    showTopics = input.showTopics;
}

/* INPUT: Show leaves */
let showLeaves = true;
if (input && "showLeaves" in input) {
    showLeaves = input.showLeaves;
}

/* INPUT: Display as headings */
let showHeadings = false;
if (input && "showHeadings" in input) {
    showHeadings = input.showHeadings;
}

/* INPUT: Display as summaries */
let showSummaries = false;
if (input && "showSummaries" in input) {
    showSummaries = input.showSummaries;
}

/* INPUT: Show warnings */
let showWarnings = false;
if (input && "showWarnings" in input) {
    showWarnings = input.showWarnings;
}

/* INPUT: Max depth */
let maxDepth = 999;
if (input && "maxDepth" in input) {
    maxDepth = input.maxDepth;
}

// IGNORE_DIRS = [
//     "Inbox/"
// ];

/* Get all pages */
// let pages = dv.pages(fromQuery).where(page => {
//         for (const ignoreDir of IGNORE_DIRS) {
//             if (page.file.path.startsWith(ignoreDir)) {
//                 return false;
//             }
//             return true;
//         }
//     }).sort(page => page.file.path);
let pages = dv.pages(fromQuery).sort(page => page.file.path);

/* Allocate warnings */
let warnings = [];

/* Index pages by path. */
let pagesByPath = {};
pages.forEach(page => {
    pagesByPath[page.file.path] = page;
});

/* Analyze pages. */
let subtopicsByPath = {};
pages.forEach(page => {

    /* Index pages by path. */
    pagesByPath[page.file.path] = page;

    /* Examine links. */
    for (const outlink of page.file.outlinks) {

        /* Ignore non-pages */
        if (outlink.path.endsWith(".png") ||
            outlink.path.endsWith(".jpg") ||
            outlink.path.endsWith(".svg") ||
            outlink.path.endsWith(".pdf") ||
            outlink.path.endsWith(".webp")) {
            continue;
        }

        /* Warn on dead links */
        if (!(outlink.path in pagesByPath)) {
            warnings.push(`Broken link: ${page.file.link} -> ${outlink.path}`);
            continue;
        }
        
        /* Check for reciprocal backlink from target page */
        let foundMatchingInlink = false;
        const outlinkPage = pagesByPath[outlink.path];
        for (const targetOutlink of outlinkPage.file.outlinks) {
            if (targetOutlink.path == page.file.path) {
                foundMatchingInlink = true;
                break;
            }
        }
        if (!foundMatchingInlink) {
            warnings.push(`Non-reciprocal link: ${page.file.link} -> ${outlinkPage.file.link}`);
        }
    }

    /* Examine topics */
    if (page.topics) {

        let topics = dv.array(page.topics);
        for (let topicLink of topics) {

            /* Make sure topic page exists. */
            if (!(topicLink.path in pagesByPath)) {
                warnings.push(`Error: couldn't find topic: ${topicLink.path}, pointed at by ${page.file.link}.`);
                return;
            }

            /* Link topic page to its subtopics. */
            let topicPage = pagesByPath[topicLink.path];
            if (!(topicPage.file.path in subtopicsByPath)) {
                subtopicsByPath[topicPage.file.path] = [];
            }
            subtopicsByPath[topicPage.file.path].push(page);

        }

    } else {

        /* Remember pages that don't have any topics. */
        if (page.file.path != startPagePath) {
            warnings.push(`No topic field: ${page.file.link}`);
        }

    }
});


/* Get start page */
let startPage = pagesByPath[startPagePath];
if (!startPage) {
    return `Error: couldn't find ${startPagePath}.`;
}

/* Set up output */
let lines = [];

/* Recursive function for traversing topic tree */
let reachableFromHome = []
function writeTopics(page, depth) {

    let hasSubtopics = page.file.path in subtopicsByPath;
    let writePage = (
        // Show both topics and leaves
        (showTopics && showLeaves) || 
        // Show topics but not leaves, but subtopics present
        (showTopics && !showLeaves && hasSubtopics)
    );

    let summary = "";
    if (showSummaries && page.summary) {
        summary = ": " + page.summary;
    }

    /* Write this page */
    if (writePage) {
        let displayDepth = depth <= 0 ? 1 : depth;
        if (showHeadings) {
            if (depth == 0) {
                lines.push(page.file.link);
            } else if (depth == 1 && hasSubtopics) {
                lines.push("# " + page.file.link + "\n");
            } else if (depth == 2 && hasSubtopics) {
                lines.push("## " + page.file.link + "\n");
            } else if (depth == 3 && hasSubtopics) {
                lines.push("### " + page.file.link + "\n");
            } else {
                /* Adjust display depth */
                displayDepth = displayDepth - 3;
                if (displayDepth < 0) {
                    displayDepth = 0;
                }
                /* Write tree */
                let indent = "  ".repeat(displayDepth);
                let prefix = depth == 0 ? "" : "- ";
                let bold = showLeaves && hasSubtopics ? "**" : "";
                lines.push(indent + prefix + bold + page.file.link + bold + summary);
            }
        } else {
            let indent = "  ".repeat(displayDepth - 1);
            let prefix = depth == 0 ? "" : "- ";
            let bold = showLeaves && hasSubtopics ? "**" : "";
            lines.push(indent + prefix + bold + page.file.link + bold + summary);
        }
    }

    /* Mark this page as reachable. */
    reachableFromHome.push(page.file.path);

    /* If no subtopics, we're done. */
    if (!hasSubtopics) {
        return;
    }

    /* If we're at the max depth, we're done. */
    if (depth >= maxDepth) {
        return;
    }

    /* Write subtopics in order of links on page. */
    let subtopics = subtopicsByPath[page.file.path];
    for (const outlink of page.file.outlinks) {
        if (!outlink.path.endsWith(".md")) {
            continue;
        }
        if (!(outlink.path in pagesByPath)) {
            warnings.push(`Broken link: ${page.file.link} -> ${outlink.path}`);
            continue;
        }
        outlinkPage = pagesByPath[outlink.path]
        if (subtopics.includes(outlinkPage)) {
            writeTopics(outlinkPage, depth+1);
        }
    }

}

/* Write topic tree. */
// if (showTopics) {
//     lines.push(`\n# Pages by Topic (${pages.length})\n`);
// }
writeTopics(startPage, 0);

/* Calculate unreachable pages */
for (let page of pages) {
    if (!reachableFromHome.includes(page.file.path)) {
        warnings.push(`Unreachable: ${page.file.link}`);
    }
}

/* Warnings */
if (showWarnings && warnings.length > 0) {
    // lines.push(`\n# Warnings (${warnings.length})\n`);
    for (let warning of warnings) {
        lines.push("- " + warning);
    }
}

/* All done */
return lines.join("\n");

// vim: set noswapfile :
