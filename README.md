## Starterkit Boilerplate

A front-end boilerplate for rapid development on any web interface using [Tailwind CSS](https://tailwindcss.com/) (utility-based CSS framework), [Pug](https://pugjs.org/) (templating) and [Gulp](https://gulpjs.com/) (task automation).

`npm install` to install dependencies

`npm run dev` for development

`npm run build` for production

`npm run deploy` for production (w/o sourcemaps)

Working files are located in the `app` folder

### Under the hood:

1. PostCSS

[autoprefixer](https://github.com/postcss/autoprefixer) - Ship browser-compatible CSS.
[cssnano](https://github.com/cssnano/cssnano) - Minify CSS on final build.
[postcss-import](https://github.com/postcss/postcss-import) - Handles `@imports` on CSS files.
[postcss-nested](https://github.com/postcss/postcss-nested) - For Sass-like nesting and unwraps for the final build.
[postcss-simple-vars](https://github.com/postcss/postcss-simple-vars) - For Sass-like way of declaring variables.
[@fullhuman/postcss-purgecss](https://github.com/FullHuman/purgecss) - Don't ship unused CSS.

2. Tailwind CSS
3. Gulp
4. Babel

### Things to note:

1. Use the underscore (`_`) to separate variant prefixes. Pug doesn't support special characters in class names instead of using the colon (`:`) in [Tailwind CSS](https://tailwindcss.com/docs/configuration#separator). eg. `md:w-auto` becomes `md_w-auto`
2. Use (`o`) for separating that have (`/`) in the class names for Pug support. eg. `w-1/2` becomes `w_1o2`.

These pug customisations feel a bit weird at first but you get used to it. I would also love to know a better way around this.

Copyright (c) 2021 **Austine Mwangi** Licensed under the MIT License.
