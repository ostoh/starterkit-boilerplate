// load globals
import { src, dest, watch, series, parallel, lastRun, task } from "gulp";
import browserSync from "browser-sync";
import del from "del";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import loadPlugins from "gulp-load-plugins";

// load all plugins
const $ = loadPlugins({ lazy: false });

// initiate browserSync
const bs = browserSync.create();

// paths
const paths = {
  views: {
    src: "app/views/**/*.html",
    dist: "public/",
  },
  styles: {
    sass: "app/styles/sass/*.scss",
    vendor: [
      "app/styles/vendor/*.css",
      "node_modules/normalize.css/normalize.css",
    ],
    dist: "public/styles/",
  },
  scripts: {
    src: "app/scripts/js/**/*.js",
    vendor: "app/scripts/vendor/*.js",
    dist: "public/scripts/",
  },
  images: {
    src: "app/images/**/*",
    dist: "public/images/",
  },
  fonts: {
    src: "app/fonts/*",
    dist: "public/fonts/",
  },
  dist: "public/",
  maps: "/maps",
};

// clean assets folder
export function clean() {
  return del(paths.dist);
}

// compatible styles
const postCssPlugins = [
  autoprefixer([
    "ie >= 10",
    "ie_mob >= 10",
    "ff >= 30",
    "chrome >= 34",
    "safari >= 7",
    "opera >= 23",
    "ios >= 7",
    "android >= 4.4",
    "bb >= 10",
  ]),
  cssnano(),
];

// main styles
export function styles() {
  return src(paths.styles.sass)
    .pipe($.sourcemaps.init())
    .pipe($.sass().on("error", $.sass.logError))
    .pipe($.postcss(postCssPlugins))
    .pipe($.sourcemaps.write(paths.maps))
    .pipe(dest(paths.styles.dist))
    .pipe($.size({ title: "main styles" }))
    .pipe(bs.stream());
}

// vendor styles
export function vendorStyles() {
  return src(paths.styles.vendor)
    .pipe($.sourcemaps.init())
    .pipe($.postcss(postCssPlugins))
    .pipe($.concat("libs.css"))
    .pipe($.sourcemaps.write(paths.maps))
    .pipe(dest(paths.styles.dist));
}

// vendor scripts
export function vendorScripts() {
  return src(paths.scripts.vendor)
    .pipe($.sourcemaps.init())
    .pipe($.concat("libs.js"))
    .pipe($.sourcemaps.write(paths.maps))
    .pipe(dest(paths.scripts.dist))
    .pipe($.size({ title: "vendor scripts" }));
}

// main scripts
export function mainScripts() {
  return src(paths.scripts.src)
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.concat("main.js"))
    .pipe($.sourcemaps.write(paths.maps))
    .pipe(dest(paths.scripts.dist))
    .pipe($.size({ title: "main scripts" }));
}

// lint main scripts
export function lintScripts() {
  return src(paths.scripts.src)
    .pipe(
      $.eslint({
        useEslintrc: true,
      })
    )
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
}

// images
export function images() {
  return src(paths.images.src, { since: lastRun(images) })
    .pipe(
      $.cache(
        $.imagemin([
          $.imagemin.gifsicle({ interlaced: true }),
          $.imagemin.mozjpeg({ quality: 100 }),
          $.imagemin.optipng({ optimizationLevel: 5 }),
          $.imagemin.svgo({
            plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
          }),
        ])
      )
    )
    .pipe(dest(paths.images.dist))
    .pipe($.size({ title: "images" }));
}

// fonts
export function fonts() {
  return src(paths.fonts.src, { since: lastRun(fonts) }).pipe(
    dest(paths.fonts.dist)
  );
}

// markup
export function mainViews() {
  return src(paths.views.src).pipe(dest(paths.views.dist));
}

// build output
const build = series(
  clean,
  parallel(
    styles,
    vendorStyles,
    mainScripts,
    vendorScripts,
    images,
    fonts,
    mainViews
  )
);
task("build", build);

// watch file changes

export function watchFiles() {
  bs.init({
    server: ["app", "public"],
    open: false,
    notify: false,
  });

  watch(paths.styles.sass, series(styles));
  watch(paths.scripts.vendor, series(vendorScripts)).on("change", bs.reload);
  watch(paths.scripts.src, series(mainScripts, lintScripts)).on(
    "change",
    bs.reload
  );
  watch(paths.images.src, series(images)).on("change", bs.reload);
  watch(paths.fonts.src, series(fonts));
  watch(paths.views.src, series(mainViews)).on("change", bs.reload);
  watch("./gulpfile.babel.js", series(build));
}

// develop tasks
const develop = series(
  clean,
  parallel(
    styles,
    vendorStyles,
    mainScripts,
    vendorScripts,
    images,
    fonts,
    lintScripts,
    mainViews,
    watchFiles
  )
);
task("dev", develop);
