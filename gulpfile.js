const {src, dest, parallel, series, watch} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const autoPrefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const image = require('gulp-image');
const del = require('del');
const ghPages = require('gulp-gh-pages');

const styles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoPrefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./app/css/'))
    .pipe(browserSync.stream());
}

const htmlInclude = () => {
  return src(['./src/index.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
}

const svgSprites = () => {
  return src('./src/img/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(dest('./app/img'))
}

const images = () => {
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/*.svg'], {encoding: false})
    .pipe(image())
    .pipe(dest('./app/img'))
}

const resources = () => {
  return src('./src/resources/**', {encoding: false})
    .pipe(dest('./app'))
}

const clean = () => {
  return del(['app/*'])
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });

  watch('./src/scss/**/*.scss', styles);
  watch('./src/index.html', htmlInclude);
  watch('./src/img/svg/**/*.svg', svgSprites);
  watch('./src/img/**.jpg', images);
  watch('./src/img/**.png', images);
  watch('./src/img/**.jpeg', images);
  watch('./src/img/**.svg', images);
  watch('./src/resources/**', resources);
}

exports.styles = styles;
exports.watchFiles = watchFiles;

exports.default = series(clean, parallel(htmlInclude, resources, svgSprites, images), styles, watchFiles);

const stylesBuild = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoPrefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('./app/css/'))
}

exports.build = series(clean, parallel(htmlInclude, resources, svgSprites, images), stylesBuild);

const deploy = () => {
  return src('./app/**/*', {encoding: false})
    .pipe(ghPages())
}

exports.deploy = deploy;
