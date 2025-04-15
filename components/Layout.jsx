import React, { useState } from 'react'
import { Box, Container } from 'theme-ui'
import { Sidebar, SidebarDivider } from '@carbonplan/layouts'
import { Dimmer, Header } from '@carbonplan/components'
import Picker from './Picker'

export default function Layout({ children }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      <Container>
        <Box sx={{ position: 'relative', zIndex: 2000 }}>
          <Header
            menuItems={[
              <Dimmer key='dimmer' sx={{ mt: '-2px', color: 'primary' }} />,
            ]}
          />
        </Box>
      </Container>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        <Box>
          <Sidebar
            expanded={expanded}
            setExpanded={setExpanded}
            side='left'
            width={4}
            footer={null}
          >
            <Box sx={{ fontSize: 4, fontFamily: 'heading', mb: 4 }}>
              GeoParquet on the web
            </Box>
            <Box sx={{ mb: 4 }}>
              This demonstrates different methods for accessing and visualizing
              GeoParquet files and other competing cloud-native vector formats.
            </Box>
            <SidebarDivider sx={{ my: 4 }} />
            <Picker />
          </Sidebar>
        </Box>
        {children}
      </Box>
    </>
  )
}
