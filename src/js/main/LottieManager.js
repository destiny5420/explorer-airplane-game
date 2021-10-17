/* eslint-disable no-use-before-define */
import $ from 'jquery'
import lottie from 'lottie-web'
import Configure from '@/utils/Configure'

const animClips = {}

const animHeadLogoText = lottie.loadAnimation({
  container: $('#logo-text')[0],
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: '/static/lottie/type.json',
})

const animHeadLogoCircle = lottie.loadAnimation({
  container: $('#logo-circle')[0],
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/static/lottie/circle.json',
})

animClips[Configure.ANIM_CLIP_LOGO_TEXT] = animHeadLogoText
animClips[Configure.ANIM_CLIP_LOGO_CIRCLE] = animHeadLogoCircle

function LottieManager() {}

LottieManager.prototype.play = function (clipName, onComplete = null) {
  if (animClips[clipName]) {
    // animClips[clipName].onComplete = onComplete
    animClips[clipName].play()
    animClips[clipName].addEventListener('complete', onComplete)
  }
}

export default LottieManager
