import browserSync from 'browser-sync';
import del from 'del';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

import { src, dest, watch, series, parallel, lastRun, task } from 'gulp';

// load all plugins
import loadPlugins from 'gulp-load-plugins';
const plugins = loadPlugins({ lazy:false });

// paths
const paths = {
    markup: ['*.html', '**/**/*.html'],
    styles: {
        src: [
            'src/styles/**/*.css',
            'src/styles/sass/*.scss'
        ],
        dest: 'assets/css'
    },
    scripts: {
        src: [
            '!src/scripts/**/*.js',
            'src/scripts/vendor/*.js'
        ],
        dest: 'assets/js'
    },
    images: {
        src: 'src/images/*',
        dest: 'assets/images'
    },
    fonts: {
        src: 'src/fonts/*',
        dest: 'assets/fonts'
    },
    destination: 'assets/*',
    maps: '/maps'
};

// browserSync
const bs = browserSync.create();

// clean assets folder
export function clean() {
    return del(paths.destination);
}

// styles
export function styles() {
    const postCssPlugins = [
        autoprefixer(),
        cssnano()
    ];

    return src(paths.styles.src)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.postcss(postCssPlugins))
        .pipe(plugins.sourcemaps.write(paths.maps))
        .pipe(plugins.flatten())
        .pipe(dest(paths.styles.dest))
        .pipe(bs.stream());
}

export function copyNormalizeCssFile() {
    return src('node_modules/normalize.css/normalize.css')
        .pipe(dest(paths.styles.dest));
}

// scripts
export function scripts() {
    return src(paths.scripts.src)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.babel())
            .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write(paths.maps))
        .pipe(dest(paths.scripts.dest));
}

// copy main.js file to assets/js
export function copyTemplateJsFile() {
    return src('src/scripts/js/main.js')
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write(paths.maps))
        .pipe(dest('assets/js'));
}

// lint scripts
export function lint() {
    return src(paths.scripts.src, 'src/scripts/js/main.js')
        .pipe(plugins.eslint({
            useEslintrc: true,
        }))
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
}

// images
export function images() {
    return src(paths.images.src, { since: lastRun(images) })
        .pipe(plugins.imagemin([
            plugins.imagemin.gifsicle({ interlaced: true }),
            plugins.imagemin.mozjpeg({ quality: 100, progressive: true }),
            plugins.imagemin.optipng({ optimizationLevel: 5 }),
            plugins.imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(paths.images.dest));
}

// manage fonts
export function fonts() {
    return src(paths.fonts.src, { since: lastRun(fonts) })
        .pipe(dest(paths.fonts.dest));
}

// watch file changes
export function serve() {
    bs.init({
        proxy: "http://localhost/starterkit-boilerplate", // project url
        open: false
    });

    watch(paths.styles.src, series(styles));
    watch(paths.scripts.src, series(scripts)).on('change', bs.reload);
    watch('./assets/scripts/js/*.js', series(copyTemplateJsFile)).on('change', bs.reload);
    watch(paths.images.src, series(images)).on('change', bs.reload);
    watch(paths.fonts.src, series(fonts));
    watch(paths.markup).on('change', bs.reload);
}

// initiate tasks
const build = series(clean, parallel(serve, styles, copyNormalizeCssFile, scripts, copyTemplateJsFile, images, fonts));
task('build', build);

// default task to run on cli
export default build;
