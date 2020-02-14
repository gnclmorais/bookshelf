// Get access to credentials
require('dotenv').config()

// Make HTTP requests
const superagent = require('superagent')

// Parse XML into JSON
const parser = require('xml2json')

// Utils
const goodreadsUser = (userId) => {
  return `https://www.goodreads.com/user/show/${userId}.xml`
}
const goodreadsShelf = () => {
  return 'https://www.goodreads.com/review/list'
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
    } while (Number(end) < Number(total))

    console.log('start', start)
    console.log('end', end)
    console.log('total', total)
    console.log('books.length', books.length)
    console.log('books', books)
  } catch (err) {
    console.log('Error:', err)
  }
})()
