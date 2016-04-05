import os
PROJECT_DIR = os.path.dirname(os.path.dirname(__file__))
REACT_RENDER_URL = 9009


def pytest_configure(database_name='runtestapplication.db',
                     webpack_bundle_dir_name='dist/',
                     webpack_bundle_stats_file='webpack-stats-example.json'):

    from django.conf import settings

    settings.configure(
        DEBUG=True,
        DEBUG_PROPAGATE_EXCEPTIONS=True,
        DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3',
                               'NAME': database_name}},
        SITE_ID=1,
        SECRET_KEY='not very secret in tests',
        USE_I18N=True,
        USE_L10N=True,
        STATIC_URL='/static/',
        ROOT_URLCONF='tests.urls',
        TEMPLATE_LOADERS=(
            'django.template.loaders.filesystem.Loader',
            'django.template.loaders.app_directories.Loader',
        ),
        MIDDLEWARE_CLASSES=(
            'django.middleware.common.CommonMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
            # rest_messaging_middleware
            'rest_messaging.middleware.MessagingMiddleware',
        ),
        INSTALLED_APPS=(
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.sites',
            'django.contrib.messages',
            'django.contrib.staticfiles',

            'rest_framework',
            'rest_framework.authtoken',
            'tests',
            'webpack_loader',

            # the module
            'rest_messaging',
            'rest_messaging_centrifugo',
            'rest_messaging_js',

            # for testing purpose
            # allows us to receive messages periodically
            "django_cron",

            # react for serverside rendering
            'react',
        ),
        PASSWORD_HASHERS=(
            'django.contrib.auth.hashers.SHA1PasswordHasher',
            'django.contrib.auth.hashers.PBKDF2PasswordHasher',
            'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
            'django.contrib.auth.hashers.BCryptPasswordHasher',
            'django.contrib.auth.hashers.MD5PasswordHasher',
            'django.contrib.auth.hashers.CryptPasswordHasher',
        ),
        STATICFILES_DIRS=(
            os.path.join(PROJECT_DIR, 'django-rest-messaging-js'),
            os.path.join(PROJECT_DIR, 'example'),
        ),
        STATICFILES_FINDERS=(
            'django.contrib.staticfiles.finders.FileSystemFinder',
            'django.contrib.staticfiles.finders.AppDirectoriesFinder'
        ),
        WEBPACK_LOADER={
            'BUNDLE_DIR_NAME': webpack_bundle_dir_name,
            'STATS_FILE': os.path.join(PROJECT_DIR, webpack_bundle_stats_file),
        },
        # Centrifugo
        CENTRIFUGO_PORT=8802,
        CENTRIFUGO_MESSAGE_NAMESPACE="messages",
        CENTRIFUGO_THREAD_NAMESPACE="threads",
        CENTRIFUGE_ADDRESS='http://localhost:{0}/'.format(8802),
        CENTRIFUGE_SECRET='secret',
        CENTRIFUGE_TIMEOUT=5,
        # DRF
        REST_FRAMEWORK={},
        # cron messages, for testing purpose only
        CRON_CLASSES=[
            "tests.cron_messages.CronMessages",
        ],
        REACT_RENDER_URL=REACT_RENDER_URL,
        REACT={
            'RENDER': True,
            'RENDER_URL': 'http://localhost:{0}/render'.format(REACT_RENDER_URL),  # attention, any change should be reported in app.js
        },
    )

    try:
        import oauth_provider  # NOQA
        import oauth2  # NOQA
    except ImportError:
        pass
    else:
        settings.INSTALLED_APPS += (
            'oauth_provider',
        )

    try:
        import provider  # NOQA
    except ImportError:
        pass
    else:
        settings.INSTALLED_APPS += (
            'provider',
            'provider.oauth2',
        )

    # guardian is optional
    try:
        import guardian  # NOQA
    except ImportError:
        pass
    else:
        settings.ANONYMOUS_USER_ID = -1
        settings.AUTHENTICATION_BACKENDS = (
            'django.contrib.auth.backends.ModelBackend',
            'guardian.backends.ObjectPermissionBackend',
        )
        settings.INSTALLED_APPS += (
            'guardian',
        )

    try:
        import django
        django.setup()
    except AttributeError:
        pass
