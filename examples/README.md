# D4 Tools - Example Files

This folder contains example files for the D4 damage and defense calculators.

### How to load examples

The calculator apps support the following URL parameters to load remote files and examples:
- `loadFile`: Absolute or relative URL to exported calculators (JSON files), e.g.: `examples/test.json` (NOTE: please use URL encoding)
- `showFile`: (optional) Show content of file without importing data (otherwise ask user). Values: `true/false` or `1/0`
- `loadCalc`: (optional) A list of calculator names, to be loaded from the given file, e.g.: `["Damage Test"]` (NOTE: please use URL encoding)

### Example URLs

- [Load test file and open damage example](https://bytemind-de.github.io/apps/d4/damage.html?loadFile=examples%2Ftest_dmg.json&showFile=true&loadCalc=%5B%22Damage%20Test%22%5D)
- [Load test file and open defense example](https://bytemind-de.github.io/apps/d4/defense.html?loadFile=examples%2Ftest_def.json&showFile=true&loadCalc=%5B%22Defense%20Test%22%5D)

