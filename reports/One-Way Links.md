```base
filters:
  and:
    - file.ext == "md"
    - '!file.inFolder("Scripts")'
    - "!formula.Missing.isEmpty()"
formulas:
  Missing: file.backlinks.filter(!file.links.contains(value))
properties:
  file.name:
    displayName: Page
  formula.Missing:
    displayName: Missing link to
views:
  - type: table
    name: Table
    order:
      - file.name
      - formula.Missing
    sort:
      - property: file.name
        direction: ASC
    limit: 10
    columnSize:
      file.name: 189

```
