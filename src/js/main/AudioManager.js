import Configure from '@/utils/Configure'

import playButtonFX from '@/audio/GameAudioFX.wav'

function createAudioElement(audioName, audioSrc) {
  const self = this

  self[audioName] = document.createElement('audio')
  self[audioName].src = audioSrc
}

function init() {
  const self = this
  createAudioElement.call(self, Configure.AUDIO_FX_PLAY_BUTTON, playButtonFX)
}

function AudioManager() {
  const self = this

  init.call(self)
}

AudioManager.prototype.play = function (audioName) {
  if (this[audioName]) {
    this[audioName].play()
  } else {
    console.error(`Can't find specified audioName(${audioName})`)
  }
}

export default AudioManager
