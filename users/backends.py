from django.conf import settings
from django.contrib.auth.models import User

from alice.helpers import rabbit

from .exceptions import LoginException


class RelayedBackend(object):

    def authenticate(self, username=None, password=None):

        response = rabbit.post(settings.LOGIN_AP, data={
            "username": username,
            "password": password
        })

        # Anything other than 200 means the data server rejected the login
        if not response.status_code == 200:
            error_message = response.json().get("non_field_errors")
            if error_message:
                raise LoginException(error_message[0])
            return None

        user, __ = User.objects.get_or_create(
            username=username, defaults={"password": "*"})

        # Attach the data server's session cookie to the user object
        # temporarily so that the LoginView can put it into a cookie for the
        # client.
        user.session_cookie = self._get_cookie(response.cookies)

        return user

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def _get_cookie(self, cookies):
        for cookie in cookies:
            if cookie.name == "sessionid":
                return cookie
        raise Exception("The data server didn't return a session cookie")
