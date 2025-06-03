See also: [[toc_js_readme]]

This page demonstrates the capabilities of `toc.js`, and serves as a set of unit tests.

# Basic Outlines

## Full Outline of This Page

Called with no `input` parameter. This should exactly match what Obsidian displays in the Outline plugin.

```dataviewjs
dv.view("Scripts/toc");
```

## Full Outline of a Different Page

See: [[toc_js_readme]]

```dataviewjs
dv.view("Scripts/toc", {
    // Note the double set of quotes and fully qualified path:
    // '"Folder/Page Name"'
    from: '"Scripts/toc_js_readme"'
});
```

## Outlines from All Pages in a Directory

Headers from pages in the Scripts directory. When multiple pages are present, they appear at the root level, and H1s are under them.

#### Without paths

```dataviewjs
dv.view("Scripts/toc", {
    from: '"Scripts"',
});
```

#### With paths

```dataviewjs
dv.view("Scripts/toc", {
    from: '"Scripts"',
    showFilePath: true
});
```

# Filtering

## Filter using Regular Expression

Filter for 'A', not case sensitive:

```dataviewjs
dv.view("Scripts/toc", {
    regex: "A"
});
```

## Case-sensitive Filter

Filter for 'A', case sensitive:

```dataviewjs
dv.view("Scripts/toc", {
    regex: "A",
    caseSensitive: true,
});
```

## Filter on Contents

Show headings in which contents match too. For example, searching content for "watermelon" will show this section, even though the heading does not contain the term.

```dataviewjs
dv.view("Scripts/toc", {
    regex: "watermelon",
    searchContent: true,
});
```

## Display matching content

Show matching contents under headings. For example, searching content for "rutabaga" will show this section and the matching text under it.  


```dataviewjs
dv.view("Scripts/toc", {
    regex: "ruta" + "baga", //fancy footwork to avoid matching this query
    searchContent: true,
    showContent: true
});
```

Tip: If you find your search matching the query itself, you can work around that by concatenating the `regex` string.  See the code block above for an example.

## Skip Code Blocks

```python
# This is inside a code block -- you shouldn't see this header in the outline!
```

The tree below should be blank:

```dataviewjs
dv.view("Scripts/toc", {
    regex: "This is inside a code block"
});
```

# Other Options

## Max Heading Level

Max heading level 1:

```dataviewjs
dv.view("Scripts/toc", {
    maxLevel: 1
});
```

## Debug output

See debug output:

```dataviewjs
dv.view("Scripts/toc", {
    debug: true
});
```


# See Also

- Topics:: [[DataviewJS]]