import $ from 'jquery'
import Timer from 'easytimer'
import { Maths, Event } from './formula'

function Countdown(targetTimestamp, currentTimestamp, callbackTriggerName, callback) {
  if (callback) {
    $(document).on(callbackTriggerName, callback)
  }

  const timeLag = Maths.getTimeLag(targetTimestamp, currentTimestamp, true)

  const self = this

  self.time = new Timer()
  self.time.start({
    countdown: true,
    startValues: {
      days: timeLag.days,
      hours: timeLag.hours,
      minutes: timeLag.minutes,
      seconds: timeLag.seconds,
    },
  })

  // const days = Format.stringBy000(this.time.getTimeValues().days)
  // $('#countdown-day').html(`${days}`)

  self.time.addEventListener('secondsUpdated', function () {
    const event = Event.jqCustomEvent(callbackTriggerName, {
      day: self.time.getTimeValues().days,
      hours: self.time.getTimeValues().hours,
      minutes: self.time.getTimeValues().minutes,
      seconds: self.time.getTimeValues().seconds,
    })

    $(document).trigger(event)
  })
}

export default Countdown
