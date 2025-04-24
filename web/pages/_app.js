import React from 'react'
import Script from 'next/script'
import { ThemeProvider } from 'theme-ui'
import '@carbonplan/components/fonts.css'
import '@carbonplan/components/globals.css'
import theme from '@carbonplan/theme'
import Layout from '../components/Layout'
import { MapProvider } from '../components/MapContext'
import { WasmProvider } from '../components/WasmContext'

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
        <Script
          data-domain='carbonplan.org'
          data-api='https://carbonplan.org/proxy/api/event'
          src='https://carbonplan.org/js/script.file-downloads.outbound-links.js'
        />
      )}
      <WasmProvider>
        <MapProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MapProvider>
      </WasmProvider>
    </ThemeProvider>
  )
}

export default App
