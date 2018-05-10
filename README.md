![license](https://img.shields.io/github/license/eliashaeussler/student-growth.svg)
[![release](https://img.shields.io/github/release/eliashaeussler/student-growth.svg)](https://github.com/eliashaeussler/student-growth/releases/)


# Student growth

A JavaScript-based project demonstrating the student growth in Germany in the past 20 years. It uses data from the
[Federal Statistical Office of Germany](https://www.destatis.de/EN/Homepage.html).

The project is based on the [D3](https://github.com/d3/d3) library and developed with [Gulp](https://github.com/gulpjs/gulp).


## Installation

For installation, clone the repository first.

```bash
git clone https://github.com/eliashaeussler/student-growth.git
cd student-growth
```

After cloning install the Node dependencies:

```bash
yarn install
```

You can also use `npm install` in case you haven't installed `yarn`.


## Build the site

In order to access the website which shows the visualization, you need to build the necessary project files:

```bash
yarn run build
```

You can alternatively use `npm run-script build` or `gulp --production` (you need to have
[`gulp-cli`](https://github.com/gulpjs/gulp-cli) installed for this).

This compiles all necessary files and places them inside a `dist` folder. Files from this folder will be used as source
for a web server which automatically starts running when you run one of the above commands.

If your Browser does not open by it's own, open it manually and navigate to the following page:

<http://localhost:8000>

If port `8000` is already in use, BrowserSync tries to use the next available port. You can see the active port in your
command line after running one of the above commands.


### Development mode

```bash
yarn run start
```

(alternatively: `npm start` or simply `gulp`)

The Development mode allows you to see changes on project files immediately in your browser since BrowserSync is watching
for changes.


## Resources

* [dataBundesLander.json](https://gist.github.com/oscar6echo/4423770#file-databundeslander-json) by [oscar6echo](https://gist.github.com/oscar6echo)
* [21311-0005.csv](https://www-genesis.destatis.de/genesis/online?sequenz=tabelleDownload&selectionname=21311-0005&regionalschluessel=&format=csv) (modified) by the [Federal Statistical Office of Germany](https://www.destatis.de/EN/Homepage.html) 


## License

[MIT License](LICENSE.md)
