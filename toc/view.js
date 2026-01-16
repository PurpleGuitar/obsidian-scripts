/* global dv, input */

/*
* This DataviewJS script creates a table of contents for a page or set of
* pages, optionally filtering to just the headings that match a regex.  
*/

/* Default filter regex is case insensitive */
let filterRegexOptions = "i";

/* INPUT: Pages to search, using DataView"s FROM syntax. */
let from = "\"" + dv.current().file.path + "\"";
if (input && "from" in input) {
    from = input.from;
}

/* INPUT: Make filter case sensitive.
 * NOTE: This check has to happen before the "regex" step because it uses
 * filterRegexOptions. */
if (input && "caseSensitive" in input) {
    if (input.caseSensitive) {
        filterRegexOptions = filterRegexOptions.replace(/i/, "");
    }
} 

/* INPUT: Regex for filtering which headings to show */
let filterRegex = /.*/;
if (input && "regex" in input) {
    filterRegex = new RegExp(input.regex, filterRegexOptions);
} 

/* INPUT: Search content too, not just headers */
let searchContent = false;
if (input && "searchContent" in input) {
    searchContent = input.searchContent;
} 

/* INPUT: Show matching content */
let showContent = false;
if (input && "showContent" in input) {
    showContent = input.showContent;
} 

/* INPUT: Highlight matching content */
let highlightContent = true;
if (input && "highlightContent" in input) {
    highlightContent = input.highlightContent;
} 

/* INPUT: Maximum heading level to show. */
let maxHeadingLevel = 6;
if (input && "maxLevel" in input) {
    maxHeadingLevel = input.maxLevel;
} 

/* INPUT: Show full file paths. */
let showFilePath = false;
if (input && "showFilePath" in input) {
    showFilePath = input.showFilePath;
} 

/* INPUT: debug for debugging */
let debug = false;
if (input && "debug" in input) {
    debug = input.debug;
} 

/* Measure elapsed time if showing debug info. */
if (debug) {
    // eslint-disable-next-line no-console
    console.time("filtered_toc.js Elapsed time");
}

/* Get pages. */
const pages = dv.pages(from).sort(page => page.file.path);

/* Abort if no pages found. */
if (pages.length === 0) {
    const errorMessage = `ERROR: Could not find pages for ${from}`;
    dv.paragraph(errorMessage);
}

/* If we have only one page, don't show pages in the outline. */
let levelOffset = 0;
const showPages = pages.length > 1;
if (showPages === false) {
    levelOffset = -1;
}

/* For each page... */
let out = "";
const headerRegex = /^(#{1,6})\s+(.+)/;
for (const page of pages) {

    /* Set up page-level state */
    const currentHeaders = {};
    let currentHeadingLevel = 0;
    let printedHeaders = {};
    let isInsideCodeBlock = false;

    /* Create page name */
    if (showFilePath) {
        /* Show file path */
        if (page.file.folder) {
            /* File is in a folder: print folder and separator */
            currentHeaders[0] = `[[${page.file.path}|${page.file.folder}/${page.file.name}]]`;
        } else {
            /* File is in root: print just the name */
            currentHeaders[0] = `[[${page.file.path}|${page.file.name}]]`;
        }
    } else {
        /* Don't show file paths, just the name */
        currentHeaders[0] = `[[${page.file.path}|${page.file.name}]]`;
    }

    /* Load content of page */
    const content = await dv.io.load(page.file.path);

    /* Loop through each line of the file looking for headers. */
    content.split(/\r?\n/).forEach(line => {

        /* Handle code blocks. */
        if (line.startsWith("```")) {
            isInsideCodeBlock = !isInsideCodeBlock;
        }

        /* Check to see if this is a heading */
        let isHeading = false;
        let match = headerRegex.exec(line);
        if (match !== null && isInsideCodeBlock === false) {

            /* Found a header. */
            const level = match[1].length;
            const text = match[2].trim();
            isHeading = true;

            /* Remember current headers.  Note that we need to do this every time
             * we see a header, regardless of whether it"s too deep, doesn"t
             * match, etc., so that we maintain the full context for headers we
             * *do* want to print. */
            for (let i = 1; i <= 6; i++) {
                if (i === level) {
                    currentHeaders[i] = text;
                } else if (i > level) {
                    currentHeaders[i] = "";
                }
            }
            currentHeadingLevel = level;

        }

        /* Check if this line matches the filter. */
        let matchesFilter = false;
        match = filterRegex.exec(line);
        if (match !== null) {
            matchesFilter = true;
        }

        /* Skip if this heading is too deep. */
        if (currentHeadingLevel > maxHeadingLevel) {
            return;
        }

        /* Skip if this line isn"t a heading, unless we"re searching
         * contents too. */
        if (isHeading === false && searchContent === false) {
            return;
        }

        /* Skip if this line doesn"t match the filter. */
        if (matchesFilter === false) {
            return;
        }

        /* Print heading, along with any needed parent headings.  Note that
         * this will not re-print the same heading twice in a row even if
         * called multiple times. */
        for (let i = 0; i <= 6; i++) {
            if (i <= currentHeadingLevel && printedHeaders[i] !== currentHeaders[i]) {
                if (i === 0) {
                    if (showPages) {
                        out += `- ${currentHeaders[0]}\n`;
                    }
                } else {
                    const indent = "  ".repeat(i + levelOffset);
                    out += `${indent}- [[${page.file.path}#${currentHeaders[i]}|${currentHeaders[i]}]]\n`;
                }
            }
        }

        /* Print content if requested */
        if (isHeading === false && showContent) {
            const indent = "  ".repeat(currentHeadingLevel + levelOffset + 1);
            let displayLine = line.trim();
            displayLine = displayLine.replace(/^- /, "");
            displayLine = displayLine.replace(/^\d+\. /, "");
            if (highlightContent) {
                match = filterRegex.exec(displayLine);
                displayLine = displayLine.substring(0, match.index)
                    + "=="
                    + displayLine.substring(match.index, match.index + match[0].length)
                    + "=="
                    + displayLine.substring(match.index + match[0].length);
            }
            out += `${indent}- ${displayLine}\n`;
        }

        /* Remember last headers we printed. */
        printedHeaders = structuredClone(currentHeaders);
        
    });
}

/* Debug output if requested */
if (debug) {
    out = "```\n" 
      + "This is debug output.  Set `debug` to false to see normal output.\n"
      + "Elapsed time is printed to the console.\n\n"
      + `from: ${from}\n`
      + `pages: ${pages.file.path}\n`
      + `filterRegex: ${filterRegex}\n`
      + `input: ${JSON.stringify(input)}\n`
      + "\n"
      + out 
      + "\n```";
    // eslint-disable-next-line no-console
    console.timeEnd("filtered_toc.js Elapsed time");
}

/* Return Markdown text. */
dv.paragraph(out);

// vim: set noswapfile :
