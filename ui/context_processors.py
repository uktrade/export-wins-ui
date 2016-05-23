from django.conf import settings


def handy(request):
    return {
        "FEEDBACK_EMAIL": settings.SENDING_ADDRESS,
        "ANALYTICS_ID": settings.ANALYTICS_ID,
    }
