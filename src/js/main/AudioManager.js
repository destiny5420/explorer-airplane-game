/* eslint-disable camelcase */
import Configure from '@/utils/Configure'

import gameBGM01 from '@/audio/GameBGM01.mp3'

import audioFX_getEnergy from '@/audio/GameAudioFX_GetEnergy.wav'
import audioFX_hit from '@/audio/GameAudioFX_Hit.wav'
import audioFX_playButton from '@/audio/GameAudioFX_PlayButton.wav'

function createAudioElement(audioName, audioSrc, loop = false) {
  const self = this

  self[audioName] = document.createElement('audio')
  self[audioName].src = audioSrc
  self[audioName].loop = loop
}

function init() {
  const self = this
  createAudioElement.call(self, Configure.AUDIO_BGM_01, gameBGM01, true)

  createAudioElement.call(self, Configure.AUDIO_FX_PLAY_BUTTON, audioFX_playButton)
  createAudioElement.call(self, Configure.AUDIO_FX_GET_ENERGY, audioFX_getEnergy)
  createAudioElement.call(self, Configure.AUDIO_FX_HIT, audioFX_hit)
}

const isPlaying = function (audioName) {
  const audioPlaying = !this[audioName].paused

  // if (audioPlaying) {
  //   console.log(`Audio[${audioName}] is playing!`)
  // }

  return audioPlaying
}

function AudioManager() {
  const self = this

  init.call(self)

  self.isPlaying = isPlaying
}

AudioManager.prototype.play = function (audioName) {
  if (this[audioName]) {
    if (!this.isPlaying(audioName)) {
      this[audioName].play()
    } else {
      this[audioName].currentTime = 0
    }
  } else {
    console.error(`Can't find specified audioName(${audioName})`)
  }
}

AudioManager.prototype.mute = function (audioName) {
  if (this[audioName]) {
    this[audioName].volume = 0
  } else {
    console.error(`Can't find specified audioName(${audioName})`)
  }
}

AudioManager.prototype.unmute = function (audioName) {
  if (this[audioName]) {
    this[audioName].volume = 1
  } else {
    console.error(`Can't find specified audioName(${audioName})`)
  }
}

export default AudioManager
