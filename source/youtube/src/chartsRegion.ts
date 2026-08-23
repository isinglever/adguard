const CHARTS_BROWSE_ID = 'FEmusic_charts'

interface Varint {
  value: number
  next: number
}

export interface ChartsRegionRewrite {
  body: Uint8Array
  matched: boolean
  changed: boolean
  previousRegion?: string
}

function readVarint (data: Uint8Array, offset: number): Varint | undefined {
  let value = 0
  let shift = 0

  for (let index = offset; index < data.length && index < offset + 8; index++) {
    const byte = data[index]
    value += (byte & 0x7f) * Math.pow(2, shift)

    if ((byte & 0x80) === 0) {
      return { value, next: index + 1 }
    }

    shift += 7
  }

  return undefined
}

function isAsciiString (
  data: Uint8Array,
  start: number,
  end: number,
  value: string
): boolean {
  if (end - start !== value.length) return false

  for (let index = 0; index < value.length; index++) {
    if (data[start + index] !== value.charCodeAt(index)) return false
  }

  return true
}

function skipField (
  data: Uint8Array,
  offset: number,
  wireType: number
): number | undefined {
  if (wireType === 0) return readVarint(data, offset)?.next
  if (wireType === 1) return offset + 8 <= data.length ? offset + 8 : undefined
  if (wireType === 5) return offset + 4 <= data.length ? offset + 4 : undefined

  if (wireType === 2) {
    const length = readVarint(data, offset)
    if (!length) return undefined

    const end = length.next + length.value
    return end <= data.length ? end : undefined
  }

  return undefined
}

function findRegionCode (
  data: Uint8Array,
  start: number,
  end: number
): { start: number, value: string } | undefined {
  let offset = start

  while (offset < end) {
    const tag = readVarint(data, offset)
    if (!tag) return undefined

    const fieldNumber = Math.floor(tag.value / 8)
    const wireType = tag.value & 7
    offset = tag.next

    if (fieldNumber === 1 && wireType === 2) {
      const length = readVarint(data, offset)
      if (!length) return undefined

      const valueStart = length.next
      const valueEnd = valueStart + length.value
      if (valueEnd > end) return undefined

      if (length.value === 2) {
        return {
          start: valueStart,
          value: String.fromCharCode(data[valueStart], data[valueStart + 1])
        }
      }

      offset = valueEnd
      continue
    }

    const next = skipField(data.subarray(0, end), offset, wireType)
    if (next === undefined) return undefined
    offset = next
  }

  return undefined
}

function encodeRegionField (region: string): Uint8Array {
  return new Uint8Array([
    0x92, 0x01, // field 18, length-delimited
    0x04, // nested message length
    0x0a, 0x02, // nested field 1, two-byte string
    region.charCodeAt(0), region.charCodeAt(1)
  ])
}

export function rewriteChartsRegion (
  body: Uint8Array,
  targetRegion: string
): ChartsRegionRewrite {
  let offset = 0
  let isChartsRequest = false
  const regionCodes: Array<{ start: number, value: string }> = []

  while (offset < body.length) {
    const tag = readVarint(body, offset)
    if (!tag) return { body, matched: false, changed: false }

    const fieldNumber = Math.floor(tag.value / 8)
    const wireType = tag.value & 7
    offset = tag.next

    if (wireType === 2) {
      const length = readVarint(body, offset)
      if (!length) return { body, matched: false, changed: false }

      const valueStart = length.next
      const valueEnd = valueStart + length.value
      if (valueEnd > body.length) return { body, matched: false, changed: false }

      if (
        fieldNumber === 2 &&
        isAsciiString(body, valueStart, valueEnd, CHARTS_BROWSE_ID)
      ) {
        isChartsRequest = true
      } else if (fieldNumber === 18) {
        const region = findRegionCode(body, valueStart, valueEnd)
        if (region) regionCodes.push(region)
      }

      offset = valueEnd
      continue
    }

    const next = skipField(body, offset, wireType)
    if (next === undefined) return { body, matched: false, changed: false }
    offset = next
  }

  if (!isChartsRequest) return { body, matched: false, changed: false }

  if (regionCodes.length > 0) {
    const changed = regionCodes.some(region => region.value !== targetRegion)
    if (!changed) {
      return {
        body,
        matched: true,
        changed: false,
        previousRegion: targetRegion
      }
    }

    const output = body.slice()
    for (const region of regionCodes) {
      output[region.start] = targetRegion.charCodeAt(0)
      output[region.start + 1] = targetRegion.charCodeAt(1)
    }

    return {
      body: output,
      matched: true,
      changed: true,
      previousRegion: regionCodes[regionCodes.length - 1].value
    }
  }

  const field = encodeRegionField(targetRegion)
  const output = new Uint8Array(body.length + field.length)
  output.set(body)
  output.set(field, body.length)

  return {
    body: output,
    matched: true,
    changed: true
  }
}
