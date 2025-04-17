import { useEffect, useRef, useState } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ParquetDataset, set_panic_hook } from '@geoarrow/geoparquet-wasm'
import { tableFromIPC } from 'apache-arrow'
import { GeoArrowPolygonLayer } from '@geoarrow/deck.gl-layers'
import { useMap } from '../components/MapContext'

const BASE_URL =
  'https://carbonplan-share.s3.us-west-2.amazonaws.com/vector_web/geoparquet/CONUS/CONUS_rgs_1mb_quadkey_12.parquet'

// https://carbonplan-share.s3.us-west-2.amazonaws.com/vector_web/geoparquet/CONUS/CONUS_rgs_1mb_quadkey_12.parquet/quadkey_12%3D021223111102/data_0.parquet

const MIN_ZOOM = 10
const QUADKEY_ZOOM = 12

function calculateQuadkeys(map, targetZoom = QUADKEY_ZOOM) {
  if (map.getZoom() < MIN_ZOOM) {
    console.log('Zoom level below minimum, returning empty quadkeys')
    return []
  }
  const bounds = map.getBounds()

  function latLonToTile(lat, lon, zoom) {
    const lat_rad = (lat * Math.PI) / 180
    const n = Math.pow(2, zoom)
    const xtile = Math.floor(((lon + 180.0) / 360.0) * n)
    const ytile = Math.floor(
      ((1.0 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) /
        2.0) *
        n
    )
    return { x: xtile, y: ytile }
  }

  function tileToQuadkey(x, y, zoom) {
    let quadkey = ''
    for (let z = zoom; z > 0; z--) {
      let digit = 0
      const mask = 1 << (z - 1)
      if ((x & mask) !== 0) digit += 1
      if ((y & mask) !== 0) digit += 2
      quadkey += digit.toString()
    }
    return quadkey
  }

  const nw = latLonToTile(bounds.getNorth(), bounds.getWest(), targetZoom)
  const se = latLonToTile(bounds.getSouth(), bounds.getEast(), targetZoom)

  const quadkeys = []
  for (let x = nw.x; x <= se.x; x++) {
    for (let y = nw.y; y <= se.y; y++) {
      quadkeys.push(tileToQuadkey(x, y, targetZoom))
    }
  }

  console.log('Calculated quadkeys:', quadkeys)
  return quadkeys
}

export default function QuadkeyPage() {
  const { map } = useMap()
  console.log('QuadkeyDemo rendered with map:', map)
  const parquetRef = useRef(null)
  const overlayRef = useRef(null)
  const [quadkeys, setQuadkeys] = useState([])

  useEffect(() => {
    if (!map) {
      console.log('Map not available yet')
      return
    }

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    })
    map.addControl(overlay)
    overlayRef.current = overlay
    console.log('Added deck.gl overlay to map')

    const initialQuadkeys = calculateQuadkeys(map)
    console.log('Initial quadkeys:', initialQuadkeys)
    setQuadkeys(initialQuadkeys)

    const moveEndHandler = () => {
      const newQuadkeys = calculateQuadkeys(map)
      console.log('New quadkeys after move:', newQuadkeys)
      setQuadkeys(newQuadkeys)
    }

    map.on('moveend', moveEndHandler)

    return () => {
      try {
        if (!map) return
        map.off('moveend', moveEndHandler)

        if (overlayRef.current) {
          overlayRef.current.setProps({ layers: [] })
          map.removeControl(overlayRef.current)
        }

        // Clean up all references
        overlayRef.current = null
        parquetRef.current = null
      } catch (error) {
        console.log('Error during cleanup:', error)
      }
    }
  }, [map])

  useEffect(() => {
    console.log('Quadkeys changed:', quadkeys)
    const setParquet = async () => {
      if (!quadkeys || quadkeys.length === 0) {
        console.log('No quadkeys found, skipping fetch')
        return
      }

      // Skip if we already have a dataset with the same quadkeys
      if (parquetRef.current) {
        const currentQuadkeys = parquetRef.current.quadkeys
        if (JSON.stringify(currentQuadkeys) === JSON.stringify(quadkeys)) {
          console.log('Quadkeys unchanged, reusing existing dataset')
          // Still need to update the data with new bbox
          if (map) {
            updateData()
          }
          return
        }
      }

      console.log('Fetching parquet data from:', BASE_URL)
      console.log('Quadkeys to fetch:', quadkeys)

      try {
        const dataset = await new ParquetDataset(
          BASE_URL,
          quadkeys.map(
            (quadkey) => `quadkey_${QUADKEY_ZOOM}=${quadkey}/data_0.parquet`
          )
        )
        dataset.quadkeys = quadkeys
        console.log('Parquet data fetched successfully', dataset)
        parquetRef.current = dataset

        if (map) {
          updateData()
        }
      } catch (err) {
        console.error('Error fetching parquet data:', err)
      }
    }

    setParquet()
  }, [quadkeys, map])

  async function updateData() {
    console.log('updateData called')
    if (!map || !parquetRef.current || !overlayRef.current) {
      console.log('Map, overlay, or parquet not available yet')
      return
    }

    if (map.getZoom() < MIN_ZOOM) {
      console.log('Zoom level below minimum, clearing layers')
      overlayRef.current.setProps({ layers: [] })
      return
    }

    const bounds = map.getBounds()
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]

    console.log('Updating data for bbox:', bbox)

    const readOptions = {
      bbox,
      bboxPaths: {
        xmin: ['bbox', 'xmin'],
        ymin: ['bbox', 'ymin'],
        xmax: ['bbox', 'xmax'],
        ymax: ['bbox', 'ymax'],
      },
    }

    set_panic_hook()

    try {
      const table = await parquetRef.current.read(readOptions)

      const arrowIPCStream = table.intoIPCStream()
      const jsTable = tableFromIPC(arrowIPCStream)
      console.log('Table converted to IPC, rows:', jsTable.numRows)

      const polygonLayer = new GeoArrowPolygonLayer({
        id: 'polygon-layer',
        data: jsTable,
        getPolygon: jsTable.getChild('geometry') || undefined,
        filled: true,
        stroked: true,
        getFillColor: [0.4, 98, 123, 193],
        getLineColor: [98, 123, 193],
        lineWidthMinPixels: 1,
        pickable: true,
      })

      overlayRef.current.setProps({
        layers: [polygonLayer],
      })

      console.log('Layer updated with', jsTable.numRows, 'features')
    } catch (err) {
      console.error('Error in updateData:', err)
      // Clear layers on error to prevent UI crashes
      if (overlayRef.current) {
        overlayRef.current.setProps({ layers: [] })
      }
    }
  }

  return null
}
