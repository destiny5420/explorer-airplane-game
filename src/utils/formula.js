/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import $ from 'jquery'

const Format = {
  addComma: function (val) {
    return Number(val)
      .toString()
      .replace(
        /^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/,
        (all, pre, groupOf3Digital) => pre + groupOf3Digital.replace(/\d{3}/g, ',$&'),
      )
  },
  stringBy00: function (value) {
    if (value < 0) {
      return `00`
    }

    return parseInt(value / 10, 10) === 0 ? `0${value}` : value
  },
  stringBy000: function (value) {
    if (value < 0) {
      return `000`
    }

    if (value / 100 >= 1) {
      return value
    }

    if (value / 10 >= 1) {
      return `0${value}`
    }

    return `00${value}`
  },
}

const Maths = {
  getDegree: function (value) {
    return (Math.PI / 180) * value
  },
  /**
   *
   * @param {timestamp} timeA 較遠的時間
   * @param {timestamp} timeB 較近的時間
   * @returns
   */
  getTimeLag: function (timeA, timeB, checkingNegative) {
    const result = new Date(timeA - timeB)
    let data = {
      days: parseInt(Math.floor(result.getTime() / 3600000) / 24, 10),
      hours: Math.floor(result.getTime() / 3600000) % 24,
      minutes: result.getUTCMinutes(),
      seconds: result.getUTCSeconds(),
    }

    if (checkingNegative) {
      if (Object.values(data).some((element) => element < 0)) {
        data = { days: 0, hours: 0, minute: 0, seconds: 0 }
      }
    }

    return data
  },
  remap: function (value, low1, high1, low2, high2) {
    return low2 + ((value - low1) * (high2 - low2)) / (high1 - low1)
  },
  clamp: function (value, min, max) {
    return Math.min(Math.max(value, min), max)
  },
  getRandomInt: function (min, max) {
    const tmin = Math.ceil(min)
    const tmax = Math.floor(max)
    return Math.floor(Math.random() * (tmax - tmin) + tmin)
  },
}

const Loader = {
  css: function (href, rel) {
    const linkElement = window.document.createElement('link')
    const tagHead = window.document.getElementsByTagName('head')[0]

    if (rel) {
      linkElement.rel = rel
    }

    linkElement.href = href

    linkElement.media = 'only x'
    tagHead.parentNode.insertBefore(linkElement, tagHead)
    setTimeout(function () {
      linkElement.media = 'all'
    }, 0)
  },
  youtube: function (youtubeID, btnID, onPlayCallback, onStopCallback) {
    // === 1. create youtube script tag to use api ===
    var tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'

    var firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // === 2. Get DOM element and set youtube ID ===
    var YOUTUBE_ID = youtubeID || 'UtF6Jej8yb4'

    var playVideoBtn = document.getElementsByClassName(btnID || 'ui__btn-youtube')
    var lightBox = document.getElementById('light-box')
    var player

    // === 3. Event ===
    function playVideo() {
      if (onPlayCallback) {
        onPlayCallback()
      }

      player.playVideo()
    }

    function stopVideo() {
      if (onStopCallback) {
        onStopCallback()
      }

      player.stopVideo()
    }

    function onPlayVideoBtnClick() {
      lightBox.classList.add('active')

      if (player) {
        playVideo()
        return
      }

      player = new YT.Player('video-obj', {
        videoId: YOUTUBE_ID,
        events: {
          onReady: playVideo,
        },
      })
    }

    function onVideoClick() {
      player.stopVideo()
      lightBox.classList.remove('active')
    }

    for (let index = 0; index < playVideoBtn.length; index += 1) {
      playVideoBtn[index].addEventListener('click', function () {
        onPlayVideoBtnClick()
      })
    }

    lightBox.addEventListener('click', function () {
      onVideoClick()
    })
  },
  imagePreloader: function (data) {
    const imagesData = data
    imagesData.forEach((e) => {
      const element = document.getElementById(e.id)

      if (element) {
        if (e.type === 'image') {
          document.getElementById(e.id).src = Common.isMobile() ? e.scr_m : e.src_pc
        } else if (e.type === 'background') {
          document.getElementById(e.id).style.backgroundImage = `url(${
            Common.isMobile() ? e.src_m : e.src_pc
          })`
        }
      }
    })
  },
}

const Event = {
  jqCustomEvent: function (type, data) {
    return $.extend($.Event(type || '', data || {}))
  },
  parseCookie: function () {
    var cookieObj = {}
    var cookieAry = document.cookie.split(';')
    var cookie

    for (var i = 0, l = cookieAry.length; i < l; ++i) {
      cookie = $.trim(cookieAry[i])
      cookie = cookie.split('=')
      cookieObj[cookie[0]] = cookie[1]
    }

    return cookieObj
  },
  setCookie: function (key, value) {
    document.cookie = `${key}=${encodeURIComponent(value)}`
  },
  getCookieByName: function (name) {
    var value = this.parseCookie()[name]
    if (value) {
      value = decodeURIComponent(value)
    }
    return value
  },
}

const Common = {
  isMobile: function () {
    return window.innerWidth < 768
  },
}

export { Common, Format, Maths, Loader, Event }
