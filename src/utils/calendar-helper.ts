import moment from 'moment'

export default function useCalendarHelper() {

  function generateDaysByMonth(month: number, year: number): string[] {
    const date = new Date(year, month, 1)
    const result = []
    while (date.getMonth() === month) {
      if (date.getDay() !== 0) {
        result.push(moment(date).format('YYYY-MM-DD'))
      }
      date.setDate(date.getDate() + 1)
    }

    return result
  }

  function generateDaysByMonthAndWeekDays(month: number, year: number, weekDays: number[]): string[] {
    const date = new Date(year, month, 1)
    const result = []
    while (date.getMonth() === month) {
      if (weekDays.indexOf(date.getDay()) !== -1) {
        result.push(moment(date).format('YYYY-MM-DD'))
      }
      date.setDate(date.getDate() + 1)
    }

    return result;
  }

  function dateFilter (date: string): string {
    return moment(date).format('DD.MM.YYYY')
  }

  function timeFilter (date: string|moment.Moment): string {
    if (typeof date === 'string') {
      date = moment(date)
    }

    return date.format('HH:mm')
  }

  function utcToLocal (date: string): moment.Moment {
    const result = moment.utc(date).tz('Europe/Berlin')

    return moment(result.format('YYYY-MM-DD HH:mm:ss'))
  }

  function localToUtc (date: string|moment.Moment): moment.Moment {
    let result = date
    if (typeof result === 'string') {
      result = moment(result)
    }

    if (result.isDST()) {
      result = result.subtract('2', 'hour')
    } else {
      result = result.subtract('1', 'hour')
    }

    return moment(result.format('YYYY-MM-DD HH:mm:ss'))
  }

  return {
    generateDaysByMonth,
    generateDaysByMonthAndWeekDays,
    dateFilter,
    timeFilter,
    utcToLocal,
    localToUtc
  }
}
