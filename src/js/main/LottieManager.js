/* eslint-disable no-use-before-define */
import $ from 'jquery'
import lottie from 'lottie-web'
import Configure from '@/utils/Configure'

const animClips = {}

const animHeadLogo = lottie.loadAnimation({
  container: $('#head-logo')[0],
  renderer: 'svg',
  loop: false,
  autoplay: false,
  path: '/static/lottie/type.json',
})

animClips[Configure.ANIM_CLIP_LOGO] = animHeadLogo

function LottieManager() {}

LottieManager.prototype.play = function (clipName) {
  console.log(`LottieManager play / clipName: `, clipName)
  console.log(animClips[clipName])
  if (animClips[clipName]) {
    animClips[clipName].play()
  }
}

export default LottieManager
