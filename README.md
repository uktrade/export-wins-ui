# export-wins-ui

The UI component for the export-wins application

# Setup

## Python

* Install Python3 if you don't have it already
* Create a virtual env for the project:
```bash
python3 -m venv /path/to/virtal-envs/export-wins-ui
```

* Then activate the virtual env:
```bash
source /path/to/virtal-envs/export-wins-ui/bin/activate
```

To make life easier setup an shell extension to read a .env or .envrc file and setup env vars for you, like [direnv](https://direnv.net/), then ensure you have the correct env variables set.

Look at the [.env template file](.env.template) to set some variables that are required to start

* Install the dependencies:

To run the app you need to install the python requirements:

```bash
pip install -r requirements.txt
```

## Environment
You need to have two ENV vars set: UI_SECRET and DATA_SERVER.

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

To help when developing the assets, there is also a watch task to run the build automatically when the files change:

```bash
npm run watch
```

## Bootstrap

As we aren't using a lot of the features provided by Bootstrap, there is a copy of the bootstrap.scss file called main.scss and this has several of the components removed - so if you want to use something and it doesn't seem to work, this will probably be why.

This also includes the JavaScript: all the available files are included in the Gruntfile.js but most have been commented out.

# Run

Before starting the app you need to have the [data server](https://github.com/uktrade/export-wins-data) running, and then run:

```bash
python manage.py runserver 127.0.0.1:8001
```

This specifies the port number becuase you would get a conflict from the data server (which should already be running on the default port of 8000).



# IE 7

We have several users that seem to be stuck with IE 7, so we therefore need to support it.

To try and enable support of IE 7 to Bootstrap, an [ie7.css has been included](https://github.com/coliff/bootstrap-ie7.), with a [box-sizing polyfill](https://github.com/Schepp/box-sizing-polyfill)


# Docker

The docker image should be built automatically in docker hub. To start the image you need to pass the required env variables:

## OSX

```bash
docker run -e "COOKIE_SECRET=${COOKIE_SECRET}" -e "UI_SECRET=${UI_SECRET}" -e "DATA_SERVER=http://10.200.10.1:8000" -e "SECRET_KEY=${SECRET_KEY}" -e "DEBUG=True" -d -p 8002:8001 ukti/export-wins-ui:latest
```

## Linux

Linux can connect to the host and so as long as you have a data server running on port 8000, this will work:

```bash
docker run -e "COOKIE_SECRET=${COOKIE_SECRET}" -e "UI_SECRET=${UI_SECRET}" -e "SECRET_KEY=${SECRET_KEY}" -e "DEBUG=True" --net=host -d -p 8002:8001 ukti/export-wins-ui:latest
```