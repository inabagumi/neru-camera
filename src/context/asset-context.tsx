import React, {
  FC,
  SyntheticEvent,
  createContext,
  useCallback,
  useEffect,
  useState
} from 'react'

export type Asset = {
  id: number
  keyColor: string
  src: string
}

type Values = {
  asset: Asset | null
  isLoading: boolean
}

const defaultValues: Values = {
  asset: null,
  isLoading: false
}

export const AssetContext = createContext(defaultValues)

export const AssetProvider: FC = ({ children }) => {
  const [asset, setAsset] = useState(defaultValues.asset)
  const [isLoading, setIsLoading] = useState(defaultValues.isLoading)

  const handleLoadedData = useCallback(
    (event: SyntheticEvent<HTMLVideoElement, Event>): void => {
      console.log(event.currentTarget)
    },
    []
  )

  useEffect(() => {
    fetch('/list.json')
      .then(res => res.json())
      .then((assets: Asset[]) => {
        setAsset(assets[0])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <AssetContext.Provider value={{ asset, isLoading }}>
      {children}

      {asset && (
        <video
          crossOrigin="anonymouse"
          data-id={asset.id}
          data-key-color={asset.keyColor}
          loop
          muted
          onLoadedData={handleLoadedData}
          playsInline
          src={asset.src}
          style={{ display: 'none' }}
        />
      )}
    </AssetContext.Provider>
  )
}
