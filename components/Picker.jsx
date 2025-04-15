import React, { useState, useEffect } from 'react'
import { Box, Flex } from 'theme-ui'
import { Column, Row, Select } from '@carbonplan/components'
import { useRouter } from 'next/router'
import { useMap } from './MapContext'

const explanations = {
  singleparquet: {
    path: 'singleparquet',
    title: 'Single GeoParquet',
    description: 'This is a single GeoParquet file.',
    minZoom: 13,
  },
  quadkey: {
    path: 'quadkey',
    title: 'Quadkey Partitioned GeoParquet',
    description: 'This is a quadkey partitioned GeoParquet file.',
    minZoom: 13,
  },
  pmtiles: {
    path: 'pmtiles',
    title: 'PMTiles',
    description: 'Vector tiled version of the same GeoParquet dataset.',
    minZoom: 0,
  },
  flatgeobuf: {
    path: 'flatgeobuf',
    title: 'FlatGeobuf',
    description: 'FlatGeobuf version of the same GeoParquet dataset.',
    minZoom: 13,
  },
}

const Picker = () => {
  const router = useRouter()
  const [selected, setSelected] = useState('singleparquet')
  const mapContext = useMap()
  const [currentZoom, setCurrentZoom] = useState(9)

  useEffect(() => {
    if (!mapContext?.map || !mapContext?.isMapLoaded) return

    const map = mapContext.map

    const updateZoom = () => {
      try {
        const zoom = map.getZoom()
        const formattedZoom = Math.round(zoom * 10) / 10
        setCurrentZoom(formattedZoom)
      } catch (err) {
        console.error('Error getting zoom:', err)
      }
    }

    updateZoom()

    map.on('moveend', updateZoom)

    return () => {
      if (map) {
        map.off('moveend', updateZoom)
      }
    }
  }, [mapContext])

  useEffect(() => {
    if (!router.isReady) return

    const path = router.pathname.substring(1)
    const matchingKey = Object.keys(explanations).find(
      (key) => explanations[key].path === path
    )
    if (matchingKey) {
      setSelected(matchingKey)
    }
  }, [router.isReady, router.pathname])

  const handleChange = (e) => {
    const value = e.target.value
    setSelected(value)
    router.push(`/${explanations[value].path}`, undefined, { shallow: true })
  }

  const needsZoom = currentZoom < explanations[selected]?.minZoom

  return (
    <Box>
      <Row columns={6}>
        <Column
          start={1}
          width={1}
          sx={{
            fontFamily: 'mono',
            letterSpacing: 'smallcaps',
            color: 'secondary',
          }}
        >
          DEMO
        </Column>
        <Column start={2} width={5}>
          <Select
            size='sm'
            sxSelect={{ width: '100%' }}
            sx={{ width: '100%' }}
            value={selected}
            onChange={handleChange}
          >
            {Object.keys(explanations).map((key) => (
              <option key={key} value={key}>
                {explanations[key].title}
              </option>
            ))}
          </Select>
          <Box sx={{ mt: 2 }}>{explanations[selected]?.description}</Box>

          {explanations[selected]?.minZoom > 0 && (
            <>
              <Box sx={{ color: 'secondary', mt: 2, fontSize: 0 }}>
                Format has no overviews, zoom in to load data
              </Box>
              <Flex
                sx={{
                  mt: 1,
                  fontFamily: 'mono',
                  fontSize: 0,
                  justifyContent: 'space-between',
                }}
              >
                <Box>Current zoom: {currentZoom}</Box>
                {needsZoom && (
                  <Box
                    sx={{
                      color: 'red',
                    }}
                  >
                    Zoom {explanations[selected]?.minZoom}+ required
                  </Box>
                )}
              </Flex>
            </>
          )}
        </Column>
      </Row>
    </Box>
  )
}

export default Picker
