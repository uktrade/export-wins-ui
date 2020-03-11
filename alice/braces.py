import logging
from urllib.parse import urlparse, urlunparse

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.http import HttpResponseRedirect, QueryDict
from django.shortcuts import resolve_url
from django.utils.encoding import force_text

from alice.helpers import rabbit

logger = logging.getLogger(__name__)


class LoginRequiredMixin(object):
    def dispatch(self, request, *args, **kwargs):

        logger.debug(f"using alice_id {request.alice_id}")

        logger.debug(f"testing whether user is logged in at {settings.IS_LOGGED_IN_AP}")
        response = rabbit.get(settings.IS_LOGGED_IN_AP, request=request)
        logger.debug(f"{settings.IS_LOGGED_IN_AP} retured {response.status_code}")

        is_logged_in = response.json()

        if is_logged_in and request.alice_id:
            logger.debug(f"user is logged in and alice_id is found")
            return super(LoginRequiredMixin, self).dispatch(request, *args, **kwargs)

        # TODO - Grab SSO login url from backend and redirect to there.

        return self.redirect_to_login(
            self.request.get_full_path(), force_text(settings.LOGIN_URL)
        )

        logger.debug(f"not logged in")

    def redirect_to_login(self, next, login_url=None):
        """
        Redirects the user to the login page, passing the given 'next' page
        """
        resolved_url = resolve_url(login_url or settings.LOGIN_URL)

        login_url_parts = list(urlparse(resolved_url))
        querystring = QueryDict(login_url_parts[4], mutable=True)
        querystring[REDIRECT_FIELD_NAME] = next
        login_url_parts[4] = querystring.urlencode(safe="/")

        redirect_url = urlunparse(login_url_parts)
        logger.debug(f"login redirect url is {redirect_url}")

        return HttpResponseRedirect(urlunparse(login_url_parts))


