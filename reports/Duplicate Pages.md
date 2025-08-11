```dataview
LIST rows.Summary
FLATTEN file.link + " (" + file.folder + ")" as Summary
GROUP BY file.name as Name
WHERE length(rows) > 1
```
