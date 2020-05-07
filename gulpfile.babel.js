import browserSync from 'browser-sync';
import del from 'del';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { src, dest, watch, series, parallel, lastRun, task } from 'gulp';

// load all plugins
import loadPlugins from 'gulp-load-plugins';
const $ = loadPlugins({ lazy: false });

// paths
const paths = {
    markup: {
        src: [
            'src/**/*.html',
        ],
        dest: 'app'
    },
    styles: {
        src: [
            'src/assets/styles/*.css',
            'src/assets/styles/sass/*.scss'
        ],
        dest: 'app/assets/styles'
    },
    scripts: {
        src: [
            'src/assets/scripts/js/*.js',
            '!src/assets/scripts/vendor/*.js'
        ],
        dest: 'app/assets/scripts'
    },
    images: {
        src: 'src/assets/images/*',
        dest: 'app/assets/images'
    },
    fonts: {
        src: 'src/assets/fonts/*',
        dest: 'app/assets/fonts'
    },
    destination: 'app/*',
    maps: '/maps'
};

// browserSync
const bs = browserSync.create();

// clean assets folder
export function clean() {
    return del(paths.destination);
}

// styles
const postCssPlugins = [
    autoprefixer([
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
        ]),
    cssnano()
];

export function styles() {

    return src(paths.styles.src)
        .pipe($.sourcemaps.init())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.postcss(postCssPlugins))
        .pipe($.sourcemaps.write(paths.maps))
        .pipe(dest(paths.styles.dest))
        .pipe($.size({ title: 'styles' }))
        .pipe(bs.stream());
}

export function handleVendorCssFile() {
    return src([ 
            'node_modules/normalize.css/normalize.css', 
            'src/assets/styles/vendor/*.css' 
        ])
        .pipe($.postcss(postCssPlugins))
        .pipe(dest(paths.styles.dest));
}

// scripts
export function scripts() {
    return src('src/assets/scripts/vendor/*.js')
        .pipe($.sourcemaps.init())
        .pipe($.concat('libs.js'))
        .pipe($.sourcemaps.write(paths.maps))
        .pipe(dest(paths.scripts.dest))
        .pipe($.size({ title: 'scripts' }));
}

// handle main.js file
export function handleMainJsFile() {
    return src(paths.scripts.src)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.uglify())
        .pipe($.sourcemaps.write(paths.maps))
        .pipe(dest(paths.scripts.dest))
        .pipe($.size({ title: 'main js' }));
}

// lint scripts
export function lint() {
    return src(paths.scripts.src)
        .pipe($.eslint({
            useEslintrc: true,
        }))
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
}

// images
export function images() {
    return src(paths.images.src, { since: lastRun(images) })
        .pipe($.cache($.imagemin([
            $.imagemin.gifsicle({ interlaced: true }),
            $.imagemin.mozjpeg({ quality: 100, progressive: true }),
            $.imagemin.optipng({ optimizationLevel: 5 }),
            $.imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ])))
        .pipe(dest(paths.images.dest))
        .pipe($.size({ title: 'images' }));
}

// manage fonts
export function fonts() {
    return src(paths.fonts.src, { since: lastRun(fonts) })
        .pipe(dest(paths.fonts.dest));
}

// markup files
export function copyMarkup() {
    return src(paths.markup.src)
        .pipe(dest(paths.markup.dest));
}

// watch file changes
export function serve() {
    bs.init({
        server: ["app", "src"],
        open: false,
        notify: false
    });

    watch(paths.styles.src, series(styles));
    watch('src/assets/scripts/vendor/*.js', series(scripts)).on('change', bs.reload);
    watch(paths.scripts.src, series(lint, handleMainJsFile)).on('change', bs.reload);
    watch(paths.images.src, series(images)).on('change', bs.reload);
    watch(paths.fonts.src, series(fonts));
    watch(paths.markup.src, series(copyMarkup)).on('change', bs.reload);
}

// initiate tasks
const build = series(clean, parallel(handleVendorCssFile, styles, scripts, handleMainJsFile, images, fonts, serve, lint, copyMarkup));
task('build', build);

// default task to run on cli
export default build;
