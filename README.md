# bookshelf
What I’ve read so far.

![nothing](https://media.giphy.com/media/baPIkfAo0Iv5K/giphy.gif)  
Just kidding.


## About

This project runs once a week, fetches my [Goodreads profile][2] and generates [a page][1] with its content. Inspired by [Frank Chimero][0], but since I’m not as good of a designer as he is, I put my effort into automating it.


## Goals

I’ve looked into a few tools to put this together, but I soon realised that not much was needed. No fancy technologies or front-end frameworks. There was no need to make this anymore complicated than a static page. The only new things I’ve looked at were:
- [Ramda](https://ramdajs.com), since I was interested in learning something beyond [Lodash](https://lodash.com);
- [GitHub Actions](https://github.com/features/actions), so this project can tap into this new feature to generate the required [static page][1].


## Run this project

```bash
npm install
npm start
```
**Before** running the application, make sure you have these variables set (you can use a `.env` file for it, since I’m using [`dotenv`](https://github.com/motdotla/dotenv)):
- `GOODREADS_KEY`  
  As usual for APIs, you’ll need a [Goodreads key](https://www.goodreads.com/api/keys)
- `GOODREADS_SHELF`  
  A string of the shelf you walk to look at (mine’s `'read'`)
- `GOODREADS_USER`  
  Whenever you’re on your Goodreads profile, your ID will be the numeric part at `https://www.goodreads.com/user/show/12345678-something`

Check `package.json` for all the available commands, under the `"scripts"` key.


## Future plans
- [ ] Scope Google Fonts to specific chars ([source](https://twitter.com/addyosmani/status/1229344737724784640))
- [ ] Change the GitHub Action from running on push to running every Monday
- [ ] Put this GitHub Page under https://bookshelf.gnclmorais.com


## Resources
- [sdras/awesome-actions][3]
- [Storing Weather Data Daily using GitHub Actions][4]
- [GitHub: Using environment variables][5]
- [GitHub: Events that trigger workflows][6]
- [crontab guru][7]


[0]: https://frankchimero.com/reading/
[1]: https://gnclmorais.github.io/bookshelf
[2]: https://goodreads.com/gnclmorais
[3]: https://github.com/sdras/awesome-actions
[4]: https://codeburst.io/storing-weather-data-daily-using-github-actions-c2b0ed513ca6
[5]: https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables
[6]: https://help.github.com/en/actions/reference/events-that-trigger-workflows
[7]: https://crontab.guru
