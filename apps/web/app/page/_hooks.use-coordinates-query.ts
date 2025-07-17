'use client'

import { useQueryStates, parseAsFloat } from 'nuqs'

export function useCoordinatesQuery() {
  return useQueryStates({
    lat: parseAsFloat.withDefault(0),
    lng: parseAsFloat.withDefault(0),
  })
}
