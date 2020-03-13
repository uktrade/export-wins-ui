import logging
from urllib.parse import urlparse, urlunparse

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.http import HttpResponseRedirect, QueryDict
from django.shortcuts import resolve_url
from django.urls import reverse
from django.utils.encoding import force_text, filepath_to_uri


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
        login_redirect_url = self.get_oauth_url(request, request.get_full_path())

        logger.debug(f"redirecting to {login_redirect_url}")

        # login_redirect_url = self.redirect_to_login(request.get_full_path(), force_text(settings.LOGIN_URL))
        logger.debug(f"redirecting to {login_redirect_url}")
        logger.debug(f"not logged in")

        return HttpResponseRedirect(login_redirect_url)

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

        return urlunparse(login_url_parts)

    def set_querystring_param(self, url, querystring_key, querystring_value):
        parts = list(urlparse(url))
        query_dict = QueryDict(parts[4], mutable=True) # 4... is a magic number
        query_dict[querystring_key] = querystring_value

        parts[4] = query_dict.urlencode(safe="/")

        changed_url = urlunparse(parts)
        logger.debug(changed_url)

        return changed_url

    def get_oauth_url(self, request, next):
        redirect_url = request.build_absolute_uri(reverse("oauth_callback_view"))
        logger.debug(f"redirect uri {redirect_url}")

        logger.debug(f" next url is {next}")
        url = settings.OAUTH_URL

        if next:
            url += "?next=" + filepath_to_uri(next)

        logger.debug(url)

        # ask the data layer for sso target url
        response = rabbit.get(url, request=request)
        response_json = response.json()
        target_url = response_json["target_url"]

        fixed_url = self.set_querystring_param(target_url, "redirect_uri", redirect_url)

        logger.debug(f"auth url is {fixed_url}")

        return fixed_url

