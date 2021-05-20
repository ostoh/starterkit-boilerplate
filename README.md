## Starterkit Boilerplate

A front-end boilerplate for rapid development on any web interface using [PostCSS](https://postcss.org/), [Pug](https://pugjs.org/) (templating), [Babel](https://babeljs.io/) and [Gulp](https://gulpjs.com/) (task automation).

`npm i` to install dependencies

`npm run dev` for development

`npm run build` for production

`npm run deploy` for production (w/o sourcemaps)

Working files are located in the `app` folder

### Under the hood:

1. PostCSS

- [autoprefixer](https://github.com/postcss/autoprefixer) - Ship browser-compatible CSS.
- [cssnano](https://github.com/cssnano/cssnano) - Minify CSS on final build.
- [postcss-import](https://github.com/postcss/postcss-import) - Handles `@imports` on CSS files.
- [postcss-nested](https://github.com/postcss/postcss-nested) - For Sass-like nesting and unwraps for the final build.
- [postcss-simple-vars](https://github.com/postcss/postcss-simple-vars) - For Sass-like way of declaring variables.

2. Gulp
3. Babel
4. Pug

Copyright (c) 2021 **Austine Mwangi** Licensed under the MIT License.
