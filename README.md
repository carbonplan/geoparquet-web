<p align="left" >
<a href='https://carbonplan.org'>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://carbonplan-assets.s3.amazonaws.com/monogram/light-small.png">
  <img alt="CarbonPlan monogram." height="48" src="https://carbonplan-assets.s3.amazonaws.com/monogram/dark-small.png">
</picture>
</a>
</p>

# carbonplan / geoparquet-web

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This repository houses experiments for visualizing various cloud native vector
formats, with a focus on exploring options for rendering GeoParquet. The `web`
directory contains a nextjs application visualizing building footprint data
using four methods:

- a single geoparquet
- a quadkey partitioned geoparquet store
- flatgeobuf
- pmtiles

The `processing` folder contains recipes for how the underlying GeoParquet data
was created.

We presented our findings at the 2025 Cloud Native Geo conference. Our slides
can be found [here](https://decks.carbonplan.org/cng/04-30-25).

## usage

To run the web visualization locally

```js
cd web/
npm install
npm run dev
```

and then visit `http://localhost:4000/` in your browser.

## license

All the code in this repository is
[MIT](https://choosealicense.com/licenses/mit/)-licensed, but we request that
you please provide attribution if reusing any of our digital content (graphics,
logo, articles, etc.).

## about us

CarbonPlan is a nonprofit organization that uses data and science for climate
action. We aim to improve the transparency and scientific integrity of climate
solutions with open data and tools. Find out more at
[carbonplan.org](https://carbonplan.org/) or get in touch by
[opening an issue](https://github.com/carbonplan/simple-site/issues/new) or
[sending us an email](mailto:hello@carbonplan.org).
