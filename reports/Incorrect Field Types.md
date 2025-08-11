---
sources:
- "https://forum.obsidian.md/t/bases-typeof-function/103840/2"
---

```base
filters:
  or:
    - formula.UpOK == false
    - formula.RelatedOK == false
    - formula.SourcesOK == false
formulas:
  UpOK: up != up.toString()
  RelatedOK: related != related.toString()
  SourcesOK: sources != sources.toString()
views:
  - type: table
    name: Table
    order:
      - file.name
      - formula.UpOK
      - formula.RelatedOK
      - formula.SourcesOK
    limit: 10
```


