This page describes a DataviewJS script that creates a linked tree of contents for any page or set of pages in the vault, optionally filtering the tree to show only headings that match a given regular expression. When displaying a filtered tree, it will show the parents of every included heading, so as to keep its context.

Some use cases:

- Create a full table of contents for the current page.
- Limit the table of contents to a maximum depth.
- Filter the table of contents to just headings that match a certain regex.
- Filter to headings whose text content matches a regex.
- Show matching text under the heading, with or without highlighting.
- All of the above, but for a different page in the vault.
- All of the above, but for all pages in a given directory.

Edit this page to see how to invoke and use this script.

Here's an example of headings on this page, and their parents, that contain the letter "f":

```dataviewjs
dv.view("Scripts/toc", {
    // Note the two sets of quotes and fully qualified path
    // If not specified, defaults to the current page
    // from: '"Notes/Set up a new Chromebook"',
    regex: "f",              // default: ".*"
    // caseSensitive: true,  // default: false
    // searchContent: true,  // default: false
    // maxLevel: 2,          // default: 6
    // showFilePath: true,   // default: false
    // debug: true,          // default: false
});
```

>[!tip]
>If you get an error above, it might be because `toc.js` didn't sync to this vault. In that case, update your sync setting to sync all files.

See also: [[toc_js_tests]]

Done:

- [x] Use a standard DV FROM statment to allow searching multiple pages?
    - Pages are the top level if multiple pages are in the results.
    - This is potentially costly -- a malformed FROM might search every page in the vault.
- [x] Ignore "headers" in code blocks.
    - For example, Python comments can look a lot like headers.  :)
- [x] Optionally show full file paths.
- [x] Optionally search content on each section too.

# Act 1

## Scene 1.1

### Alpha

### Beta

### Charlie

## Scene 1.2

### Delta

### Echo

### Foxtrot

# Act 2

## Scene 2.1

### Golf

### Hotel

### India

## Scene 2.2

### Juliet

### Kilo

### Mike


