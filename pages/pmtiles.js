import { useEffect } from 'react'
import { useMap } from '../components/MapContext'

const BASE_URL =
  'https://carbonplan-scratch.s3.us-west-2.amazonaws.com/OCR/LA_region_coiled.pmtiles'

export default function PmtilesPage() {
  const { map } = useMap()
  useEffect(() => {
    if (!map) {
      console.log('Map not available yet')
      return
    }

    map.addSource('buildings', {
      type: 'vector',
      url: `pmtiles://${BASE_URL}`,
    })

    map.addLayer({
      id: 'buildings-fill',
      type: 'fill',
      source: 'buildings',
      'source-layer': 'LA_regionfgb',
      paint: {
        'fill-color': '#627BC1',
        'fill-opacity': 0.4,
      },
    })

    map.addLayer({
      id: 'buildings-line',
      type: 'line',
      source: 'buildings',
      'source-layer': 'LA_regionfgb',
      paint: {
        'line-color': '#627BC1',
        'line-opacity': 0.8,
        'line-width': 1,
      },
    })

    return () => {
      try {
        if (!map) return
        if (map.getLayer('buildings-fill')) {
          map.removeLayer('buildings-fill')
        }
        if (map.getLayer('buildings-line')) {
          map.removeLayer('buildings-line')
        }
        if (map.getSource('buildings')) {
          map.removeSource('buildings')
        }
      } catch (error) {
        console.log('Error during cleanup:', error)
      }
    }
  }, [map])

  return null
}
