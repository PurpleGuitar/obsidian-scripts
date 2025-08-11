```base
filters:
  and:
    - file.name != "Home"
    - formula.SelfLink == true
formulas:
  SelfLink: up.contains(file)
properties:
  formula.SelfLink:
    displayName: Self-Link?
views:
  - type: table
    name: Table
    order:
      - file.name
      - formula.SelfLink
    sort:
      - property: file.name
        direction: ASC
    limit: 10
    columnSize:
      file.name: 418

```
