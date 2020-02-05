import logging

import jwt
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from .models import User

logger = logging.getLogger(__name__)


class AliceMiddleware(MiddlewareMixin):

    def process_request(self, request):

        alice = request.COOKIES.get("alice")

        request.alice_id = None
        request.user = User(is_authenticated=False)

        if alice:
            try:
                token = jwt.decode(alice, settings.COOKIE_SECRET)
                # alice id is given to data server as session id for authentication
                # via Rabbit
                request.alice_id = token["session"]
                request.user = User(**token["user"])
            except:
                logger.exception('Error decoding Alice!')
