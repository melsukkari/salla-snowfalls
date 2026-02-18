const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | This configuration matches the Salla Theme Raed structure.
 | It compiles JS and CSS into the 'public' folder where Salla expects them.
 */

mix
  // 1. Compile JavaScript files
  .js('src/assets/js/app.js', 'public/js')
  .js('src/assets/js/snow.js', 'public/js')
  .js('src/assets/js/overlay.js', 'public/js')
  
  // 2. Compile CSS (Tailwind + PostCSS)
  .postCss('src/assets/styles/app.css', 'public/css', [
    require('postcss-import'),
    require('tailwindcss'),
    require('postcss-rtl'), // Essential for Arabic support
    require('autoprefixer'),
  ])

  // 3. Copy static assets (images/fonts)
  .copyDirectory('src/assets/images', 'public/images')
  .copyDirectory('src/assets/fonts', 'public/fonts')

  // 4. Set the public directory
  .setPublicPath('public');

// Enable versioning (cache busting) only in production
if (mix.inProduction()) {
  mix.version();
}
