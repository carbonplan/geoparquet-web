import React, { createContext, useContext, useState, useEffect } from 'react'

const WasmContext = createContext({
  isWasmInitialized: false,
  wasmModule: null,
})

export const useWasm = () => {
  const context = useContext(WasmContext)
  if (!context) {
    throw new Error('useWasm must be used within a WasmProvider')
  }
  return context
}

export function WasmProvider({ children }) {
  const [isWasmInitialized, setWasmInitialized] = useState(false)
  const [wasmModule, setWasmModule] = useState(null)

  useEffect(() => {
    async function initializeWasm() {
      try {
        const module = await import('@geoarrow/geoparquet-wasm')

        module.set_panic_hook()

        setWasmModule(module)
        setWasmInitialized(true)
        console.log('WebAssembly initialized successfully')
      } catch (error) {
        console.error('Failed to initialize WebAssembly:', error)
      }
    }

    initializeWasm()
  }, [])

  const value = {
    isWasmInitialized,
    wasmModule,
  }

  return <WasmContext.Provider value={value}>{children}</WasmContext.Provider>
}
