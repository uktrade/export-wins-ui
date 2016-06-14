import jwt

from django.conf import settings


class User(object):
    """
    Not a real user, but enough so that a typical Django user property test
    will pass.
    """

    def __init__(self, is_authenticated=True, **kwargs):

        self._is_authenticated = is_authenticated

        self.id = None
        self.is_active = True
        self.is_staff = False
        self.is_superuser = False

        for k, v in kwargs.items():
            setattr(self, k, v)

    def is_authenticated(self):
        return self._is_authenticated

    @property
    def pk(self):
        return self.id


class AliceMiddleware(object):

    def process_request(self, request):

        alice = request.COOKIES.get("alice")

        request.alice_id = None
        request.user = User(is_authenticated=False)

        try:
            token = jwt.decode(alice, settings.UI_SECRET)
            request.alice_id = token["session"]
            request.user = User(**token["user"])
        except:
            pass  # Any failure here means we deny login status
