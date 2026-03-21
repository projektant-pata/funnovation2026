class MicCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bufferSize = 4096
    this.buffer = new Float32Array(this.bufferSize)
    this.bufferIndex = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0) return true

    const channel = input[0]
    if (!channel || channel.length === 0) return true

    for (let i = 0; i < channel.length; i += 1) {
      this.buffer[this.bufferIndex] = channel[i]
      this.bufferIndex += 1

      if (this.bufferIndex >= this.bufferSize) {
        const chunk = this.buffer.slice(0, this.bufferSize)
        this.port.postMessage(chunk, [chunk.buffer])
        this.bufferIndex = 0
      }
    }

    return true
  }
}

registerProcessor('mic-capture-processor', MicCaptureProcessor)
