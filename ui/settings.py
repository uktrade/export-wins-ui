"""
Django settings for ui project.

Generated by 'django-admin startproject' using Django 1.9.6.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv(), verbose=True)

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(PROJECT_ROOT)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(os.getenv("DEBUG", False))

# As the app is running behind a host-based router supplied by Heroku or other
# PaaS, we can open ALLOWED_HOSTS
ALLOWED_HOSTS = ['*']


INSTALLED_APPS = [
    # django
    'django.contrib.contenttypes',
    'django.contrib.humanize',
    'django.contrib.staticfiles',

    # third party
    "django_extensions",
    "raven.contrib.django.raven_compat",

    # project apps
    "ui",
    "users",
    "wins",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'ui.middleware.SSLRedirectMiddleware',
    'ui.middleware.CacheControlMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    "alice.middleware.AliceMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ui.urls'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'root': {
        'level': 'DEBUG',
        'handlers': ['console'],
    },
    'formatters': {
        'verbose': {
            'format': '%(asctime)s [%(levelname)s] [%(name)s] %(message)s'
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
    },
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                "ui.context_processors.handy",
            ],
        },
    },
]

WSGI_APPLICATION = 'ui.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases
# We're still using a database on the UI because outright removing it causes
# problems since so many packages require contenttypes which requires a db. The
# important part though is that the database is effectively static data,
# created at deploy time.  There's no session or user info in there, so there's
# nothing to worry about on that front.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/
LANGUAGE_CODE = 'en-gb'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'staticfiles')
STATIC_URL = '/static/'


# URLs for access points on the data server
DATA_SERVER = os.getenv("DATA_SERVER")
WINS_AP = "{}/wins/".format(DATA_SERVER)
WIN_DETAILS_AP = "{}/details/".format(DATA_SERVER)
LIMITED_WINS_AP = "{}/limited-wins/".format(DATA_SERVER)
CONFIRMATIONS_AP = "{}/confirmations/".format(DATA_SERVER)
BREAKDOWNS_AP = "{}/breakdowns/".format(DATA_SERVER)
ADVISORS_AP = "{}/advisors/".format(DATA_SERVER)
NOTIFICATIONS_AP = "{}/notifications/".format(DATA_SERVER)
LOGIN_AP = "{}/auth/login/".format(DATA_SERVER)
LOGOUT_AP = "{}/auth/logout/".format(DATA_SERVER)
IS_LOGGED_IN_AP = "{}/auth/is-logged-in/".format(DATA_SERVER)

OAUTH_URL = "{}/oauth2/auth_url/".format(DATA_SERVER)
OAUTH_CALLBACK_URL = "{}/oauth2/callback/".format(DATA_SERVER)

CSV_AP = "{}/csv/".format(DATA_SERVER)
EW_CSV_AP = "{}/csv/auto/".format(DATA_SERVER)
ADD_USER_AP = "{}/admin/add-user/".format(DATA_SERVER)
NEW_PASSWORD_AP = "{}/admin/new-password/".format(DATA_SERVER)
SEND_CUSTOMER_EMAIL_AP = "{}/admin/send-customer-email/".format(DATA_SERVER)
SEND_ADMIN_CUSTOMER_EMAIL_AP = "{}/admin/send-admin-customer-email/".format(DATA_SERVER)
CHANGE_CUSTOMER_EMAIL_AP = "{}/admin/change-customer-email/".format(DATA_SERVER)
SOFT_DELETE_AP = "{}/admin/soft-delete/".format(DATA_SERVER)
CSV_UPLOAD_NOTIFY_AP = "{}/csv/export-wins/".format(DATA_SERVER)
CSV_UPLOAD_DEFAULT_ENCODING = os.getenv("CSV_UPLOAD_DEFAULT_ENCODING", "iso-8859-1")

# For UI server should match UI_SECRET in data server, for admin server should
# match ADMIN_SECRET in data server.
UI_SECRET = os.getenv("UI_SECRET")


# for JWT
COOKIE_SECRET = os.getenv("COOKIE_SECRET")


# Mail stuffs
FEEDBACK_ADDRESS = os.getenv("FEEDBACK_ADDRESS")
SENDING_ADDRESS = os.getenv("SENDING_ADDRESS")
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = os.getenv("EMAIL_PORT")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = bool(os.getenv("EMAIL_USE_TLS"))
EMAIL_USE_SSL = bool(os.getenv("EMAIL_USE_SSL"))
EMAIL_TIMEOUT = int(os.getenv("EMAIL_TIMEOUT")) if os.getenv("EMAIL_TIMEOUT") else None
EMAIL_SSL_KEYFILE = os.getenv("EMAIL_SSL_KEYFILE")
EMAIL_SSL_CERTFILE = os.getenv("EMAIL_SSL_CERTFILE")
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND")  # The default is just fine

# Space separated list of years that are allowed
ALLOWED_YEARS_STR = os.environ.get('ALLOWED_YEARS', "2016 2017 2018")
ALLOWED_YEARS = [int(x) for x in ALLOWED_YEARS_STR.split()]

# Google Analytics
ANALYTICS_ID = os.getenv("ANALYTICS_ID")


# how long you can edit a win
EDIT_TIMEOUT_DAYS = int(os.getenv('EDIT_TIMEOUT_DAYS', 120))
REVIEW_WINDOW_DAYS = int(os.getenv('REVIEW_WINDOW_DAYS', 365 + 31))


# Sentry
RAVEN_CONFIG = {
    "dsn": os.getenv("SENTRY_DSN"),
}


# Security stuff
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
if DEBUG:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False


STAGING = os.getenv("STAGING")

CSV_UPLOAD_AWS_ACCESS_KEY_ID = os.getenv('CSV_UPLOAD_AWS_ACCESS_KEY_ID')
CSV_UPLOAD_AWS_SECRET_ACCESS_KEY = os.getenv('CSV_UPLOAD_AWS_SECRET_ACCESS_KEY')
CSV_UPLOAD_AWS_BUCKET = os.getenv('CSV_UPLOAD_AWS_BUCKET')
CSV_AWS_REGION = os.getenv('CSV_AWS_REGION', 'eu-west-2')


SHOW_ENV_BANNER = os.getenv('SHOW_ENV_BANNER', False)
ENV_NAME = os.getenv('ENV_NAME')

GIT_BRANCH = os.getenv('GIT_BRANCH', '')
GIT_COMMIT = os.getenv('GIT_COMMIT', '')

