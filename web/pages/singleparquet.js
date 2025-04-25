import { useEffect, useRef } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { tableFromIPC } from 'apache-arrow'
import { GeoArrowPolygonLayer } from '@geoarrow/deck.gl-layers'
import { useMap } from '../components/MapContext'
import { useWasm } from '../components/WasmContext'

const BASE_URL =
  'https://carbonplan-share.s3.amazonaws.com/vector_web/geoparquet/LA_region/LA_rgs_1mb.parquet'

const MIN_ZOOM = 13

export default function SingleParquetPage() {
  const { map } = useMap()
  const { isWasmInitialized, wasmModule } = useWasm()
  const parquetRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!map || !isWasmInitialized || !wasmModule) {
      return
    }

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    })
    map.addControl(overlay)
    overlayRef.current = overlay

    const fetchParquetMeta = async () => {
      if (parquetRef.current) {
        return
      }

      try {
        const dataset = await new wasmModule.ParquetFile(BASE_URL)

        console.log('Parquet data fetched successfully', dataset)
        parquetRef.current = dataset
        updateData()
      } catch (err) {
        console.error('Error fetching parquet data:', err)
      }
    }

    fetchParquetMeta()

    const moveEndHandler = () => {
      updateData()
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

        overlayRef.current = null
        parquetRef.current = null
      } catch (error) {
        console.log('Error during cleanup:', error)
      }
    }
  }, [map, isWasmInitialized, wasmModule])

  async function updateData() {
    if (!map || !parquetRef.current || !overlayRef.current || !wasmModule) {
      console.log('Map, overlay, parquet, or WASM module not available yet')
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
      'ARROW:extension:name': 'geoarrow.polygon',
      bboxPaths: {
        xmin: ['bbox', 'xmin'],
        ymin: ['bbox', 'ymin'],
        xmax: ['bbox', 'xmax'],
        ymax: ['bbox', 'ymax'],
      },
    }

    try {
      const table = await parquetRef.current.read(readOptions)
      const arrowIPCStream = table.intoIPCStream()
      const jsTable = tableFromIPC(arrowIPCStream)

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
        beforeId: 'buildings',
      })

      overlayRef.current.setProps({
        layers: [polygonLayer],
      })

      console.log('Layer updated with', jsTable.numRows, 'features')
    } catch (err) {
      console.error('Error in updateData:', err)
      if (overlayRef.current) {
        overlayRef.current.setProps({ layers: [] })
      }
    }
  }

  return null
}
