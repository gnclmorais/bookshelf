// Get access to credentials
require('dotenv').config()

const superagent = require('superagent')
const parser = require('xml2json')
const pug = require('pug')
const R = require('ramda')
var fs = require('fs')

// Utils
const goodreadsUser = (userId) => {
  return `https://www.goodreads.com/user/show/${userId}.xml`
}
const goodreadsShelf = () => {
  return 'https://www.goodreads.com/review/list'
}
const yearMonthDay = (date) => {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const [key, user] = [process.env.GOODREADS_KEY, process.env.GOODREADS_USER]
let url = goodreadsUser(user)

const _notAnonymous = (async () => {
  try {
    let res = await superagent.get(url).query({ key }).accept('xml')
    let body = JSON.parse(parser.toJson(res.body.toString('utf8')))

    let shelves
    try {
      shelves = body.GoodreadsResponse.user.user_shelves.user_shelf
    } catch (err) {
      console.log('Error finding bookshelves:', err)
    }

    const readShelf = shelves.filter(shelf => shelf.name === process.env.GOODREADS_SHELF)[0]
    const readShelfId = readShelf.id.$t // this might not be needed, name is enough

    let books = []
    let start, end, total
    const perPage = 20
    let page = 1
    let response, shelf

    do {
      url = goodreadsShelf()
      res = await superagent.get(url).query({
        key,
        v: 2,
        id: user,
        shelf: 'read',
        page,
        per_page: perPage
      }).accept('xml')

      body = JSON.parse(parser.toJson(res.body.toString('utf8')))
      response = body.GoodreadsResponse

      shelf = response.reviews;
      ({ start, end, total } = shelf)
      page += 1

      // 'review' is where book objects are
      books = books.concat(shelf.review)

      console.log('end, total', end, total)

      // start, end and total come as strings, so cast we must
    // } while (Number(end) < Number(total))
    } while (1 > 2) // TODO remove

    // console.log('start', start)
    // console.log('end', end)
    // console.log('total', total)
    // console.log('books.length', books.length)
    // console.log('books', books)

    // shape of an author
    // console.log('author:::', books[0].book.authors)
    const getName = R.pluck('name')
    const getAuthorsNames = R.compose(R.values, getName)
    // const authorsNames = getAuthorsNames(books[0].book.authors)



    // console.log('::: book', books[0].book)
    // console.log('::: book id', books[0].book.id)
    // console.log('::: book authors', books[0].book.authors)



    const validIsbnOrNothing = maybeIsbn => {
      return isNaN(Number(maybeIsbn)) ? null : maybeIsbn
    }

    // relevant book structure:
    const bookDigest = (bookObj) => {
      const book = bookObj.book

      console.log('book.isbn', book.isbn)

      return ({
        id: book.id.$t,
        isbn: validIsbnOrNothing(book.isbn),
        title: book.title,
        title_without_series: book.title_without_series,
        image_url: book.image_url,
        link: book.link,
        rating: bookObj.rating,
        authors: getAuthorsNames(book.authors)
      })
    }

    const booksDigest = R.map(bookDigest, books)
    // console.log('booksDigest', booksDigest)

    const html = pug.renderFile('views/index.pug', {
      // variables
      books: booksDigest,
      timestamp: yearMonthDay(new Date()),
      // pug config
      self: true,
      pretty: true
    })
    console.log(html)

    fs.writeFile('public/index.html', html, function (err) {
      if (err) return console.log(err)

      console.log('The file was saved!')
    })
  } catch (err) {
    console.log('Error:', err)
  }
})()
