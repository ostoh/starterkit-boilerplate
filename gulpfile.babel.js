import { src, dest, watch, series, parallel, task } from "gulp";
import browserSync from "browser-sync";
import del from "del";
import cssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import cssvars from "postcss-simple-vars";
import nested from "postcss-nested";
import loadPlugins from "gulp-load-plugins";

// load all gulp-* plugins in package.json
const plugin = loadPlugins();

// initiate browserSync
const bs = browserSync.create();

// set environments
const prodEnv = process.env.NODE_ENV === "production";

// paths
const paths = {
  views: {
    src: "app/views/**/*.pug",
    dist: "public/",
  },
  styles: {
    css: "app/styles/css/**/*.css",
    vendor: "app/styles/vendor/*.css",
    dist: "public/styles/",
  },
  scripts: {
    src: "app/scripts/js/**/*.js",
    vendor: "app/scripts/vendor/*.js",
    jQuery: "app/scripts/jquery.min.js",
    dist: "public/scripts/",
  },
  images: {
    src: "app/images/**/*+(jpeg|jpg|png|gif|svg)",
    dist: "public/images/",
  },
  fonts: {
    src: "app/fonts/*",
    dist: "public/fonts/",
  },
  configs: [],
  dist: "public",
  maps: "/maps",
};

// clean assets folder
export function clean() {
  return del(paths.dist);
}

// compatible styles
const postCssPlugins = [cssImport(), cssvars(), nested(), autoprefixer()];

if (prodEnv) {
  postCssPlugins.push(
    cssnano({
      preset: "default",
    })
  );
}

// main styles
export function styles() {
  return src(paths.styles.css)
    .pipe(plugin.concat("main.css"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.postcss(postCssPlugins))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.styles.dist))
    .pipe(bs.stream());
}

// vendor styles
export function vendorStyles() {
  return src(paths.styles.vendor)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.concat("libs.css"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.styles.dist))
    .pipe(bs.stream());
}

// vendor scripts
export function vendorScripts() {
  return src(paths.scripts.vendor)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.concat("libs.js"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist));
}

// jQuery
export function handleJquery() {
  return src(paths.scripts.jQuery).pipe(dest(paths.scripts.dist));
}

// main scripts
export function mainScripts() {
  return src(paths.scripts.src)
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.babel())
    .pipe(plugin.concat("main.js"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist));
}

// images
export function images() {
  return src(paths.images.src)
    .pipe(
      plugin.imagemin([
        plugin.imagemin.gifsicle({
          interlaced: true,
        }),
        plugin.imagemin.mozjpeg({
          quality: 100,
          progressive: true,
        }),
        plugin.imagemin.optipng({
          optimizationLevel: 5,
        }),
        plugin.imagemin.svgo({
          plugins: [
            {
              removeViewBox: true,
            },
            {
              cleanupIDs: false,
            },
          ],
        }),
      ])
    )
    .pipe(dest(paths.images.dist));
}

// fonts
export function fonts() {
  return src(paths.fonts.src).pipe(dest(paths.fonts.dist));
}

// markup
export function mainViews() {
  return src("app/views/**/!(_)*.pug")
    .pipe(
      plugin.pug({
        pretty: true,
      })
    )
    .pipe(dest(paths.views.dist));
}

// watch file changes
export function watchFiles() {
  bs.init({
    server: paths.dist,
    open: false,
    notify: false,
  });

  watch(paths.styles.css, series(styles));
  watch(paths.styles.vendor, series(vendorStyles));
  watch(paths.scripts.vendor, series(vendorScripts)).on("change", bs.reload);
  watch(paths.scripts.src, series(mainScripts)).on("change", bs.reload);
  watch(paths.images.src, series(images)).on("change", bs.reload);
  watch(paths.fonts.src, series(fonts));
  watch(paths.views.src, series(mainViews)).on("change", bs.reload);
}

// tasks
const build = series(
  clean,
  parallel(
    styles,
    vendorStyles,
    mainScripts,
    vendorScripts,
    handleJquery,
    images,
    fonts,
    mainViews
  )
);
task("build", build);

const develop = series(build, parallel(watchFiles));
task("dev", develop);

const deploy = series(build);
task("deploy", deploy);
