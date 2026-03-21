class LivePlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.queue = []
    this.queuedSamples = 0
    this.maxQueuedSamples = 24000 * 2

    this.port.onmessage = (event) => {
      if (event.data === 'interrupt') {
        this.queue = []
        this.queuedSamples = 0
        return
      }

      if (event.data instanceof Float32Array) {
        this.queue.push(event.data)
        this.queuedSamples += event.data.length

        while (this.queuedSamples > this.maxQueuedSamples && this.queue.length > 1) {
          const dropped = this.queue.shift()
          if (dropped) this.queuedSamples -= dropped.length
        }
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    if (!output || output.length === 0) return true

    const channel = output[0]
    let outIndex = 0

    while (outIndex < channel.length && this.queue.length > 0) {
      const current = this.queue[0]

      if (!current || current.length === 0) {
        this.queue.shift()
        continue
      }

      const remainingOutput = channel.length - outIndex
      const copyLength = Math.min(remainingOutput, current.length)

      for (let i = 0; i < copyLength; i += 1) {
        channel[outIndex + i] = current[i]
      }
      outIndex += copyLength

      if (copyLength < current.length) {
        this.queue[0] = current.slice(copyLength)
        this.queuedSamples -= copyLength
      } else {
        this.queue.shift()
        this.queuedSamples -= current.length
      }
    }

    while (outIndex < channel.length) {
      channel[outIndex] = 0
      outIndex += 1
    }

    return true
  }
}

registerProcessor('live-pcm-playback-processor', LivePlaybackProcessor)
