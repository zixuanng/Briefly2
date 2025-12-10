/**
 * Decodes a base64 string into an AudioBuffer using a temporary AudioContext.
 */
export const decodeBase64ToAudioBuffer = async (
  base64Data: string,
  sampleRate: number = 24000
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create an offline context for decoding to avoid hardware limits on active contexts
  // The Gemini TTS output is raw PCM, usually 16-bit little-endian.
  // We need to convert this raw PCM into an AudioBuffer.
  // Note: The standard Web Audio API `decodeAudioData` expects a file format (mp3/wav), not raw PCM.
  // We must manually parse the raw Int16 PCM.

  const int16Data = new Int16Array(bytes.buffer);
  const numChannels = 1; // Gemini TTS is usually mono
  
  // Create an offline context just to create the buffer container
  const offlineCtx = new OfflineAudioContext(numChannels, int16Data.length, sampleRate);
  const buffer = offlineCtx.createBuffer(numChannels, int16Data.length, sampleRate);
  
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < int16Data.length; i++) {
    // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
    channelData[i] = int16Data[i] / 32768.0;
  }
  
  return buffer;
};

/**
 * Converts an AudioBuffer to a WAV Blob (ready for <audio> src or download).
 */
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this example)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i));

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};
