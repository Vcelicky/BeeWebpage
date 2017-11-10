# Vcelicky webpage

This application uses the latest Slim 3 with the PHP-View template renderer. It also uses the Monolog logger.
It uses Bootstrap 4.0.0 for frontend and for update or create new css and Javascript use this worflow:

* For update default style from Bootstrap in /node_modules/bootstrap/scss vreate _custom.scss file and update variables from _variables.scss
* For custom css files create your files in public/scss
* Run gulp from root directory

## Install the Application

Run this command from the directory in which you want to install your new Slim Framework application.

    composer install
    npm install
    gulp install

* Point your virtual host document root to your new application's `public/` directory.
* Ensure `logs/` is web writeable.