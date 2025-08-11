```base
filters:
  and:
    - '!file.inFolder("Inbox")'
    - '!file.inFolder("Scripts")'
    - '!file.inFolder("Templates")'
    - file.ext == "md"
    - up.isEmpty()
views:
  - type: table
    name: Table
    order:
      - file.name
      - up
    sort:
      - property: file.name
        direction: ASC

```
