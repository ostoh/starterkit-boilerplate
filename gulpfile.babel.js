import { src, dest, watch, series, parallel, task } from 'gulp';
import browserSync from 'browser-sync';
import del from 'del';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import purgecss from '@fullhuman/postcss-purgecss';
import loadPlugins from 'gulp-load-plugins';

// load all gulp-* plugins in package.json
const plugin = loadPlugins();

// initiate browserSync
const bs = browserSync.create();

// set environments
const prodEnv = process.env.NODE_ENV === 'production';

// paths
const paths = {
  views: {
    src: 'app/views/**/*.pug',
    dist: 'public/',
  },
  styles: {
    sass: 'app/styles/sass/*.scss',
    vendor: ['app/styles/vendor/*.css'],
    dist: 'public/styles/',
  },
  scripts: {
    src: 'app/scripts/js/**/*.js',
    vendor: 'app/scripts/vendor/*.js',
    dist: 'public/scripts/',
  },
  images: {
    src: 'app/images/**/*+(jpeg|jpg|png|gif|svg)',
    dist: 'public/images/',
  },
  fonts: {
    src: 'app/fonts/*',
    dist: 'public/fonts/',
  },
  configs: ['app/apple-touch-icon.png', 'app/browserconfig.xml', 'app/manifest.json'],
  dist: 'public',
  maps: '/maps',
};

// clean assets folder
export function clean() {
  return del(paths.dist);
}

// compatible styles
const postCssPlugins = [tailwindcss(), autoprefixer(), cssnano()];

if (prodEnv) {
  postCssPlugins.push(
    purgecss({
      content: [paths.views.src, paths.scripts.src],
      css: [paths.styles.sass],
      whitelist: ['html', 'body'],
      whitelistPatterns: [],
      defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
    })
  );
}

// main styles
export function styles() {
  return src(paths.styles.sass)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.sass().on('error', plugin.sass.logError))
    .pipe(plugin.postcss(postCssPlugins))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.styles.dist))
    .pipe(plugin.size({ title: 'main styles' }))
    .pipe(bs.stream());
}

// vendor styles
export function vendorStyles() {
  return src(paths.styles.vendor)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.concat('libs.css'))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.styles.dist))
    .pipe(plugin.size({ title: 'vendor styles' }))
    .pipe(bs.stream());
}

// vendor scripts
export function vendorScripts() {
  return src(paths.scripts.vendor)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.concat('libs.js'))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist))
    .pipe(plugin.size({ title: 'vendor scripts' }));
}

// main scripts
export function mainScripts() {
  return src(paths.scripts.src)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.babel())
    .pipe(plugin.concat('main.js'))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist))
    .pipe(plugin.size({ title: 'main scripts' }));
}

// lint main scripts
export function lintScripts() {
  return src(paths.scripts.src)
    .pipe(
      plugin.eslint({
        useEslintrc: true,
      })
    )
    .pipe(plugin.eslint.format())
    .pipe(plugin.eslint.failAfterError());
}

// images
export function images() {
  return src(paths.images.src)
    .pipe(
      plugin.cache(
        plugin.imagemin([
          plugin.imagemin.gifsicle({ interlaced: true }),
          plugin.imagemin.mozjpeg({ quality: 100 }),
          plugin.imagemin.optipng({ optimizationLevel: 5 }),
          plugin.imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
          }),
        ])
      )
    )
    .pipe(dest(paths.images.dist))
    .pipe(plugin.size({ title: 'images' }));
}

// fonts
export function fonts() {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dist));
}

// markup
export function mainViews() {
  return src('app/views/**/!(_)*.pug')
    .pipe(
      plugin.pug({
        pretty: true,
      })
    )
    .pipe(dest(paths.views.dist));
}

// app configs
export function appConfigs() {
  return src(paths.configs).pipe(dest(paths.dist));
}

// watch file changes
export function watchFiles() {
  bs.init({
    server: paths.dist,
    open: false,
    notify: false,
  });

  watch(paths.styles.sass, series(styles));
  watch(paths.scripts.vendor, series(vendorScripts)).on('change', bs.reload);
  watch(paths.scripts.src, series(mainScripts, lintScripts)).on('change', bs.reload);
  watch(paths.images.src, series(images)).on('change', bs.reload);
  watch(paths.fonts.src, series(fonts));
  watch(paths.views.src, series(mainViews)).on('change', bs.reload);
  watch(paths.configs, series(appConfigs));
}

// tasks
const build = series(
  clean,
  parallel(styles, vendorStyles, mainScripts, vendorScripts, images, fonts, mainViews, appConfigs)
);
task('build', build);

const develop = series(build, parallel(watchFiles));
task('dev', develop);

const deploy = series(build);
task('deploy', deploy);
