import { src, dest, watch, series, parallel, task } from "gulp";
import browserSync from "browser-sync";
import del from "del";
import dartSass from "sass";
import loadPlugins from "gulp-load-plugins";

// load all gulp-* plugins in package.json
const plugin = loadPlugins();

// initiate browserSync
const bs = browserSync.create();

// set environments
const prodEnv = process.env.NODE_ENV === "production";

// sass compiler
const sass = plugin.sass(dartSass);

// paths
const paths = {
  views: {
    src: "app/views/**/*.pug",
    dist: "public/",
  },
  styles: {
    css: "app/styles/css/**/*.css",
    sass: "app/styles/sass/**/*.scss",
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
  configs: {
    browserManifest: "app/site.webmanifest",
    browserConfig: "app/browserconfig.xml",
  },
  dist: "public/",
  maps: "/maps",
};

// clean assets folder
export function clean() {
  return del(paths.dist);
}

// copy browserManifest
export function copyBrowserManifest() {
  return src(paths.configs.browserManifest)
    .pipe(plugin.changed(paths.configs.browserManifest))
    .pipe(dest(paths.dist));
}

// copy browserConfig
export function copyBrowserConfig() {
  return src(paths.configs.browserConfig)
    .pipe(plugin.changed(paths.configs.browserConfig))
    .pipe(dest(paths.dist));
}

// main styles
export function buildStyles() {
  return src(paths.styles.sass)
    .pipe(plugin.changed(paths.styles.sass))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.styles.dist))
    .pipe(bs.stream());
}

// main scripts
export function mainScripts() {
  return src(paths.scripts.src)
    .pipe(plugin.changed(paths.scripts.src))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.babel())
    .pipe(plugin.concat("main.js"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist));
}
// vendor scripts
export function vendorScripts() {
  return src(paths.scripts.vendor)
    .pipe(plugin.changed(paths.scripts.vendor))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.init()))
    .pipe(plugin.concat("libs.js"))
    .pipe(plugin.if(!prodEnv, plugin.sourcemaps.write(paths.maps)))
    .pipe(dest(paths.scripts.dist));
}

// jQuery
export function handleJquery() {
  return src(paths.scripts.jQuery)
    .pipe(plugin.changed(paths.scripts.jQuery))
    .pipe(dest(paths.scripts.dist));
}

// images
export function images() {
  return src(paths.images.src)
    .pipe(plugin.changed(paths.images.src))
    .pipe(
      plugin.imagemin([
        plugin.imagemin.gifsicle({
          interlaced: true,
        }),
        plugin.imagemin.mozjpeg({
          quality: 75,
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
  return src(paths.fonts.src)
    .pipe(plugin.changed(paths.fonts.src))
    .pipe(dest(paths.fonts.dist));
}

// markup
export function mainViews() {
  return src("app/views/**/!(_)*.pug")
    .pipe(plugin.changed(paths.views.src))
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
    server: { baseDir: paths.dist },
    open: false,
    notify: false,
  });

  watch(paths.styles.css, series(buildStyles));
  watch(paths.scripts.vendor, series(vendorScripts)).on("change", bs.reload);
  watch(paths.scripts.src, series(mainScripts)).on("change", bs.reload);
  watch(paths.images.src, series(images)).on("change", bs.reload);
  watch(paths.fonts.src, series(fonts));
  watch(paths.configs.browserManifest, series(copyBrowserManifest));
  watch(paths.configs.browserConfig, series(copyBrowserConfig));
  watch(paths.views.src, series(mainViews)).on("change", bs.reload);
}

// tasks
const build = series(
  clean,
  parallel(
    buildStyles,
    mainScripts,
    vendorScripts,
    handleJquery,
    images,
    fonts,
    mainViews,
    copyBrowserManifest,
    copyBrowserConfig
  )
);
task("build", build);

const develop = series(build, parallel(watchFiles));
task("dev", develop);

const deploy = series(build);
task("deploy", deploy);
