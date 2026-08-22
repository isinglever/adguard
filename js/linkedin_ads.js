// Remove promoted posts from LinkedIn's protobuf-based SDUI home feed.
(function () {
  "use strict";

  const MAX_DEPTH = 24;
  const SPONSORED_FLAG = asciiBytes('isSponsored":true');
  const SPONSORED_URN = asciiBytes("sponsoredContentV2");
  const SPONSORED_EVENT = asciiBytes("SponsoredUpdateServed");

  function asciiBytes(value) {
    const bytes = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i);
    return bytes;
  }

  function toBytes(body) {
    if (body instanceof ArrayBuffer) return new Uint8Array(body);
    if (ArrayBuffer.isView(body)) {
      return new Uint8Array(body.buffer, body.byteOffset, body.byteLength);
    }
    return null;
  }

  function containsBytes(bytes, needle) {
    const limit = bytes.length - needle.length;
    if (limit < 0) return false;

    outer:
    for (let i = 0; i <= limit; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (bytes[i + j] !== needle[j]) continue outer;
      }
      return true;
    }
    return false;
  }

  function containsSponsoredPost(bytes) {
    return (
      containsBytes(bytes, SPONSORED_FLAG) &&
      containsBytes(bytes, SPONSORED_URN) &&
      containsBytes(bytes, SPONSORED_EVENT)
    );
  }

  function readVarint(bytes, offset, end) {
    let value = 0;
    let factor = 1;

    for (let i = 0; i < 10 && offset < end; i++) {
      const byte = bytes[offset++];
      if (i < 8) value += (byte & 0x7f) * factor;
      if ((byte & 0x80) === 0) return { value, offset };
      factor *= 128;
    }
    return null;
  }

  function parseMessage(bytes) {
    const fields = [];
    let offset = 0;

    while (offset < bytes.length) {
      const start = offset;
      const tag = readVarint(bytes, offset, bytes.length);
      if (!tag) return null;

      offset = tag.offset;
      const fieldNumber = Math.floor(tag.value / 8);
      const wireType = tag.value % 8;
      if (fieldNumber < 1 || fieldNumber > 536870911) return null;

      let payloadStart = offset;
      let payloadEnd = offset;

      if (wireType === 0) {
        const value = readVarint(bytes, offset, bytes.length);
        if (!value) return null;
        offset = value.offset;
        payloadEnd = offset;
      } else if (wireType === 1) {
        offset += 8;
        payloadEnd = offset;
      } else if (wireType === 2) {
        const length = readVarint(bytes, offset, bytes.length);
        if (!length || !Number.isSafeInteger(length.value)) return null;
        offset = length.offset;
        payloadStart = offset;
        offset += length.value;
        payloadEnd = offset;
      } else if (wireType === 5) {
        offset += 4;
        payloadEnd = offset;
      } else {
        return null;
      }

      if (offset > bytes.length) return null;
      fields.push({
        start,
        end: offset,
        tagEnd: tag.offset,
        fieldNumber,
        wireType,
        payloadStart,
        payloadEnd,
      });
    }

    return fields;
  }

  function isFeedPostEnvelope(fields) {
    const fieldNumbers = new Set();
    for (const field of fields) fieldNumbers.add(field.fieldNumber);

    // These direct fields identify LinkedIn's Update envelope in both the
    // screenApi and pageApi responses captured from the SDUI home feed.
    return (
      fieldNumbers.has(12) &&
      fieldNumbers.has(26) &&
      fieldNumbers.has(35) &&
      fieldNumbers.has(46)
    );
  }

  function encodeVarint(value) {
    const encoded = [];
    do {
      let byte = value % 128;
      value = Math.floor(value / 128);
      if (value > 0) byte |= 0x80;
      encoded.push(byte);
    } while (value > 0);
    return new Uint8Array(encoded);
  }

  function joinBytes(chunks, length) {
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }

  function rewriteMessage(bytes, depth) {
    if (depth > MAX_DEPTH) return { bytes, changed: false, removed: 0 };

    const fields = parseMessage(bytes);
    if (!fields) return { bytes, changed: false, removed: 0 };

    const chunks = [];
    let length = 0;
    let changed = false;
    let removed = 0;

    for (const field of fields) {
      const originalField = bytes.subarray(field.start, field.end);

      if (field.wireType !== 2) {
        chunks.push(originalField);
        length += originalField.length;
        continue;
      }

      const payload = bytes.subarray(field.payloadStart, field.payloadEnd);
      if (!containsBytes(payload, SPONSORED_FLAG)) {
        chunks.push(originalField);
        length += originalField.length;
        continue;
      }

      const childFields = parseMessage(payload);
      if (
        field.fieldNumber === 1 &&
        childFields &&
        isFeedPostEnvelope(childFields) &&
        containsSponsoredPost(payload)
      ) {
        changed = true;
        removed++;
        continue;
      }

      if (!childFields) {
        chunks.push(originalField);
        length += originalField.length;
        continue;
      }

      const rewritten = rewriteMessage(payload, depth + 1);
      removed += rewritten.removed;

      if (!rewritten.changed) {
        chunks.push(originalField);
        length += originalField.length;
        continue;
      }

      const tag = bytes.subarray(field.start, field.tagEnd);
      const encodedLength = encodeVarint(rewritten.bytes.length);
      chunks.push(tag, encodedLength, rewritten.bytes);
      length += tag.length + encodedLength.length + rewritten.bytes.length;
      changed = true;
    }

    return {
      bytes: changed ? joinBytes(chunks, length) : bytes,
      changed,
      removed,
    };
  }

  try {
    const body = toBytes($response.body);
    if (!body || !containsBytes(body, SPONSORED_FLAG)) return $done({});

    const result = rewriteMessage(body, 0);
    if (!result.changed || result.removed === 0) return $done({});

    console.log(`[LinkedIn Ads] Removed ${result.removed} promoted post(s)`);
    const output = result.bytes.buffer.slice(
      result.bytes.byteOffset,
      result.bytes.byteOffset + result.bytes.byteLength
    );
    $done({ body: output });
  } catch (error) {
    console.log(`[LinkedIn Ads] ${error && error.stack ? error.stack : error}`);
    $done({});
  }
})();
