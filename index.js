// Get access to credentials
require('dotenv').config()

const superagent = require('superagent')
const parser = require('xml2json')
const pug = require('pug')
const R = require('ramda')
const fs = require('fs')

// 'Get the books on a members shelf'
// https://goodreads.com/api/index#reviews.list
const yearMonthDay = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const goodreadsKey = process.env.GOODREADS_KEY
const goodreadsUser = process.env.GOODREADS_USER
const goodreadsShelf = process.env.GOODREADS_SHELF
const goodreadsUrlShelf = 'https://www.goodreads.com/review/list'

;(async () => {
  try {
    let currentPage = 1
    const resultsPerPage = 200 // default 20, can go up to 200

    let res, body, response, shelf
    let books = []
    let end, total

    do {
      res = await superagent.get(goodreadsUrlShelf).query({
        key: goodreadsKey,
        id: goodreadsUser,
        shelf: goodreadsShelf,
        v: 2,
        page: currentPage,
        per_page: resultsPerPage
      }).accept('xml')

      body = JSON.parse(parser.toJson(res.body.toString('utf8')))
      response = body.GoodreadsResponse

      shelf = response.reviews
      books = books.concat(shelf.review)

      books.forEach(book => {
        if (book.book.title === 'Rework') {
          console.log('Rework:::', book)
        }
      })

      ;({ end, total } = shelf)
      currentPage += 1

      // `end` and `total` are strings, so cast them we must
    } while (Number(end) < Number(total))

    const getName = R.pluck('name')
    const getAuthorsNames = R.compose(R.values, getName)

    const validIsbnOrNothing = maybeIsbn => {
      return isNaN(Number(maybeIsbn)) ? null : maybeIsbn
    }

    // relevant book structure:
    const bookDigest = (bookObj) => {
      const book = bookObj.book
      const findDate = R.ifElse(
        R.compose(R.is(String), R.prop('read_at')),
        R.prop('read_at'),
        R.prop('date_added')
      )
      const date = findDate(bookObj)
      const yearRead = date ? Number(date.slice(-4)) : null

      return ({
        id: book.id.$t,
        isbn: validIsbnOrNothing(book.isbn),
        title: book.title,
        title_without_series: book.title_without_series,
        image_url: book.image_url,
        link: book.link,
        rating: bookObj.rating,
        authors: getAuthorsNames(book.authors),
        year: yearRead
      })
    }

    // [{ year: 2001, … }, { year: 2000, … }, …]
    const booksDigest = R.map(bookDigest, books)

    // { 2000: [{ year: 2000, … }, …], 2001: [{ year: 2001, … }, …], … }
    const booksByYear = R.groupBy(R.prop('year'))(booksDigest)

    // [[2000: [{ year: 2000, … }, …]], [2001: [{ year: 2001, … }, …]], …]
    const booksInArray = R.toPairs(booksByYear)

    // [[2001: [{ year: 2001, … }, …]], [2000: [{ year: 2000, … }, …]], …]
    const sortedFromNewestToOldest = R.sort(R.descend(R.prop(0)))
    const sortedBooks = sortedFromNewestToOldest(booksInArray)

    console.log('booksDigest :::', booksDigest)

    const html = pug.renderFile('views/index.pug', {
      // variables
      booksPerYear: sortedBooks,
      timestamp: yearMonthDay(new Date()),
      // pug config
      self: true,
      pretty: true
    })

    fs.writeFile('index.html', html, function (err) {
      if (err) return console.log(err)

      console.log('The file was saved!')
    })
  } catch (err) {
    console.log('Error:', err)
  }
})()
