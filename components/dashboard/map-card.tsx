'use client'

import { useJsApiLoader, GoogleMap, Circle, Marker } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

const CENTER = { lat: 24.978694, lng: 55.004972 } // Palm Jebel Ali — 24°58'43.3"N 55°00'17.9"E

const MARKERS = [
  { lat: 24.9793, lng: 55.0044 },
  { lat: 24.9782, lng: 55.0057 },
  { lat: 24.9790, lng: 55.0062 },
  { lat: 24.9779, lng: 55.0046 },
  { lat: 24.9785, lng: 55.0038 },
  { lat: 24.9796, lng: 55.0053 },
  { lat: 24.9775, lng: 55.0065 },
]

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e0' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
]

export function MapCard() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: 'heatguard-map',
  })

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Site Heat Map</h3>
          <p className="text-xs text-gray-400 mt-0.5">Palm Jebel Ali · Real-time zones</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00D15A]">
          <span className="w-2 h-2 rounded-full bg-[#00D15A] animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="relative flex-1 min-h-[300px]">
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-2">
            <MapPin className="w-8 h-8 text-gray-300" />
            <p className="text-xs text-gray-400">Map unavailable</p>
            <p className="text-[10px] text-gray-300">Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
          </div>
        )}

        {!isLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-6 h-6 border-2 border-[#00D15A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', minHeight: '300px' }}
            center={CENTER}
            zoom={14}
            options={{
              styles: MAP_STYLES,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: 'cooperative',
            }}
          >
            {/* Heat zone overlay */}
            <Circle
              center={CENTER}
              radius={400}
              options={{
                strokeColor: '#FF3B30',
                strokeOpacity: 0.5,
                strokeWeight: 2,
                fillColor: '#FF3B30',
                fillOpacity: 0.12,
              }}
            />

            {/* Worker markers */}
            {MARKERS.map((pos, i) => (
              <Marker
                key={i}
                position={pos}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#00D15A',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        )}
      </div>
    </div>
  )
}
