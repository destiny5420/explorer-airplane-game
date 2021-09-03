import anime from 'animejs'
import $ from 'jquery'
import { Event, Format } from './formula'

function bindingEvent() {
  $(document).on('valueChange', function (evt) {
    $('.js-fundraising-bar').css('width', evt.rate)
    $('.js-fundraising-count').text(Format.addComma(evt.count))
    $('.js-fundraising-money').text(Format.addComma(evt.money))
  })
}

function rateFunction(array) {
  const dataArray = array

  return function (value) {
    for (let i = 0; i < dataArray.length; i += 1) {
      if (i === dataArray.length - 1 && value / dataArray[i].value > 1) {
        return 100
      }

      if (value <= dataArray[i].value) {
        const lastValue = i === 0 ? 0 : dataArray[i - 1].value
        const lastRate = i === 0 ? 0 : dataArray[i - 1].rate

        return (
          ((value - lastValue) / (dataArray[i].value - lastValue)) *
            (dataArray[i].rate - lastRate) +
          lastRate
        )
      }
    }

    return -1
  }
}
function Fundraising(projectName, projectID, token, rateArray) {
  bindingEvent()

  const self = this
  this.getData = false
  this.api = `https://${projectName}.backme.tw/api/projects/${projectID}.json?token=${token}`

  $.get(this.api, function (response) {
    const { rewards } = response
    const getRate = rateFunction(rateArray)

    self.money = parseInt(response.money_pledged, 10)
    self.count = parseInt(response.pledged_count, 10)
    self.totalProductCount = rewards.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue.unit * currentValue.pledged_count
    }, 0)
    self.progress = getRate(self.money)
    self.getData = true
  })
}

Fundraising.prototype.isGetData = function () {
  return this.getData
}

Fundraising.prototype.play = function () {
  const target = {
    products: 0,
    money: 0,
    rate: 0,
    count: 0,
  }

  anime({
    targets: target,
    products: this.totalProductCount,
    money: this.money,
    count: this.count,
    rate: `${this.progress}%`,
    round: 1,
    easing: 'linear',
    update: function () {
      const event = Event.jqCustomEvent('valueChange', {
        rate: target.rate,
        money: target.money,
        count: target.count,
      })
      $(document).trigger(event)
    },
  })
}

export default Fundraising
