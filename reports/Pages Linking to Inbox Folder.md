```base
filters:
  and:
    - '!file.inFolder("Inbox")'
    - formula.Untitled == true
formulas:
  Untitled: file.links.map(value.asFile().folder).contains("Inbox")
properties:
  formula.Untitled:
    displayName: Links to Inbox?
views:
  - type: table
    name: Table
    order:
      - file.name
      - formula.Untitled
    sort:
      - property: file.name
        direction: DESC
    limit: 10
    columnSize:
      file.name: 518

```
