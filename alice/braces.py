import logging
from urllib.parse import urlparse, urlunparse

from django.conf import settings
from django.http import HttpResponseRedirect, QueryDict
from django.urls import reverse
from django.utils.encoding import filepath_to_uri

from alice.helpers import rabbit

logger = logging.getLogger(__name__)


def set_querystring_param(url, querystring_key, querystring_value):
    parts = list(urlparse(url))
    query_dict = QueryDict(parts[4], mutable=True)  # 4... is a magic number
    query_dict[querystring_key] = querystring_value

    parts[4] = query_dict.urlencode(safe="/")

    changed_url = urlunparse(parts)
    logger.debug(changed_url)

    return changed_url


def get_oauth_url(request, next):
    redirect_url = request.build_absolute_uri(reverse("oauth_callback_view"))

    url = settings.OAUTH_URL

    if next:
        url += "?next=" + filepath_to_uri(next)

    response = rabbit.get(url, request=request)
    response_json = response.json()
    target_url = response_json["target_url"]

    fixed_url = set_querystring_param(target_url, "redirect_uri", redirect_url)
    logger.debug(f"login redirect url is {fixed_url}")

    return fixed_url


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

        logger.debug(f"not logged in")

        login_redirect_url = get_oauth_url(request, request.get_full_path())
        logger.debug(f"redirecting to {login_redirect_url}")

        return HttpResponseRedirect(login_redirect_url)
