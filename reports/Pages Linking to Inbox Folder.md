```base
filters:
  and:
    - '!file.folder.contains("Inbox")'
    - '!formula["Inbox Links"].isEmpty()'
formulas:
  Inbox Links: file.links.filter(value.asFile().folder.contains("Inbox"))
views:
  - type: table
    name: Table
    order:
      - file.name
      - formula.Inbox Links
    sort:
      - property: file.name
        direction: DESC
    limit: 10
    columnSize:
      file.name: 453

```
