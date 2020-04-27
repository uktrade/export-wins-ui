from django.conf import settings


def handy(request):
    return {
        "user": request.user,
        "FEEDBACK_EMAIL": settings.FEEDBACK_ADDRESS,
        "ANALYTICS_ID": settings.ANALYTICS_ID,
        "ALLOWED_YEARS": settings.ALLOWED_YEARS,
        "SHOW_ENV_BANNER" : settings.SHOW_ENV_BANNER,
        "ENV_NAME" : settings.ENV_NAME,
        "GIT_BRANCH" : settings.GIT_BRANCH,
        "GIT_COMMIT": settings.GIT_COMMIT
    }
