from django.conf import settings


def handy(request):
    return {
        "FEEDBACK_EMAIL": settings.FEEDBACK_ADDRESS,
        "ANALYTICS_ID": settings.ANALYTICS_ID,
    }
