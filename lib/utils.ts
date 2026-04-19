import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate Heat Index (°C) using the simplified Rothfusz equation.
 * Requires temperature in °C and relative humidity in %.
 */
export function calculateHeatIndex(tempC: number, humidity: number): number | null {
  if (humidity < 0 || humidity > 100) return null
  const T = tempC * 9 / 5 + 32  // convert to °F
  const RH = humidity

  if (T < 80) return tempC

  let HI =
    -42.379 +
    2.04901523 * T +
    10.14333127 * RH -
    0.22475541 * T * RH -
    0.00683783 * T * T -
    0.05481717 * RH * RH +
    0.00122874 * T * T * RH +
    0.00085282 * T * RH * RH -
    0.00000199 * T * T * RH * RH

  if (RH < 13 && T >= 80 && T <= 112) {
    HI -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
  }
  if (RH > 85 && T >= 80 && T <= 87) {
    HI += ((RH - 85) / 10) * ((87 - T) / 5)
  }

  return Math.round(((HI - 32) * 5 / 9) * 10) / 10
}

/**
 * Determine alert severity from heat index (°C).
 */
export function heatIndexSeverity(heatIndex: number): 'low' | 'medium' | 'high' | 'critical' {
  if (heatIndex >= 54) return 'critical'
  if (heatIndex >= 41) return 'high'
  if (heatIndex >= 32) return 'medium'
  return 'low'
}

/**
 * Standard API JSON response helpers.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
