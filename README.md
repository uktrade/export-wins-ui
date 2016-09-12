# export-wins-ui

The UI component for the export-wins application

# Setup

You need to have two ENV vars set UI_SECRET and DATA_SERVER.

* UI_SECRET is the secret created by the data server
* DATA_SERVER is the URL to the data server i.e. http://127.0.0.1:8000

## Debug
If you want useful errors when there is an error also create:

```bash
DEBUG='true';
```

# Build

There is a grunt build process which:

* builds the bootstrap CSS from SASS
* concat/uglify the bootstrap JS
* builds the app CSS from SASS
* concat/uglify the app JS

First we need the dependencies:

```bash
npm install
```

To run the build:

```bash
npm run build
```

There is also a watch task to run the build automatically:

```bash
npm run watch
```

## Bootstrap

As we aren't using a lot of the features provided by Bootstrap, there is a copy of the bootstrap.scss file called main.scss and this has several of the components removed - so if you want to use something and it doesn't seem to work, this will probably be why.

This also includes the JavaScript: all the available files are included in the Gruntfile.js but most have been commented out.

# Run

You will need a python virtual env for this project, as ask a python dev if unsure how to do this.

To run the app you need to install the python requirements:

```bash
pip install -r requirements.txt
```

and then run:

```bash
python manage.py runserver
```

This will likely get a conflict of port number from the data server (which should already be running), so you can specify a port:

```bash
python manage.py runserver 127.0.0.1:8001
```


# IE7

We have several users that seem to be stuck with IE7, so we therefore need to support it.

To try and enable support of IE 7 to Bootstrap, an [ie7.css has been included](https://github.com/coliff/bootstrap-ie7.), with a [box-sizing polyfill](https://github.com/Schepp/box-sizing-polyfill)
