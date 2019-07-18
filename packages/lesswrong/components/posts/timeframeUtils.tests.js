import {getDatePosts, getDateRange} from './timeframeUtils'

describe.only('getDateRange', () => {
  it('handles days', () => {
    const result = getDateRange('2019-01-01', '2019-01-03', 'day')
    result.should.deep.equal(['2019-01-03', '2019-01-02', '2019-01-01'])
  })

  it('handles weeks, basic case', () => {
    const result = getDateRange('2019-01-01', '2019-01-15', 'week')
    result.should.deep.equal(['2019-01-15', '2019-01-08', '2019-01-01'])
  })

  it('handles months', () => {
    const result = getDateRange('2019-01-01', '2019-03-01', 'month')
    result.should.deep.equal(['2019-03-01', '2019-02-01', '2019-01-01'])
  })

  it('handles years', () => {
    const result = getDateRange('2018-01-01', '2019-01-01', 'year')
    result.should.deep.equal(['2019-01-01', '2018-01-01'])
  })

  // --- Sad cases --- //

  // Correct behavior for partial timeBlocks isn't super obvious. I'd hope it
  // wouldn't come up, but I think the right way to handle it is to go further
  // back than expected
  it('handles partial timeBlocks', () => {
    const result = getDateRange('2019-01-02', '2019-01-15', 'week')
    result.should.deep.equal(['2019-01-15', '2019-01-08', '2019-01-01'])
  })

  it('handles reversed start and end dates', () => {
    (
      () => getDateRange('2019-01-03', '2019-01-01', 'day')
    ).should.throw(Error, /got a startDate .* after the endDate/)
  })

  it('handles malformed dates', () => {
    (
      () => getDateRange('01/01/2019', '2019-01-03', 'day')
    ).should.throw(Error, /Invalid \w+Date/)
  })

  it('handles malformed timeBlock', () => {
    (
      () => getDateRange('2019-01-01', '2019-01-03', 'asdf')
    ).should.throw(Error, /Invalid timeBlock/)
  })

  it('handles null timeBlock', () => {
    (
      () => getDateRange('2019-01-01', '2019-01-03', null)
    ).should.throw(Error, /Invalid timeBlock/)
  })
})

