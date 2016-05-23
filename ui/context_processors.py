from django.conf import settings


def handy(request):
    return {
        "FEEDBACK_EMAIL": settings.SENDING_ADDRESS
    }
