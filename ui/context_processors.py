from django.conf import settings


def handy(request):
    return {
        "FEEDBACK_EMAIL": settings.SENDING_ADDRESS,
        "ENABLE_ANALYTICS": settings.ENABLE_ANALYTICS,
    }
