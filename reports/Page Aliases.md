```base
filters:
  and:
    - "!aliases.isEmpty()"
views:
  - type: table
    name: Table
    order:
      - file.name
      - aliases
    sort:
      - property: file.name
        direction: ASC
    columnSize:
      file.name: 221

```
