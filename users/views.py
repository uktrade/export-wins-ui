import logging
from datetime import datetime

import jwt
from django.conf import settings
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect

from alice.helpers import rabbit

logger = logging.getLogger(__name__)


def get_dataserver_session_cookie(cookies):
    """ Get the session cookie from the data server """

    for cookie in cookies:
        if cookie.name == "sessionid":
            return cookie
    raise Exception("The data server didn't return a session cookie")


def cookie_domain():
    # in production, we want to share cookies across exportwins subdomains
    if not settings.DEBUG and not settings.STAGING:
        return ".exportwins.service.trade.gov.uk"
    # otherwise None just uses whatever domain the page is loaded from
    return None


def oauth_callback_view(request):
    code = request.GET.get("code")
    state = request.GET.get("state")

    redirect_uri = request.build_absolute_uri(reverse("oauth_callback_view"))

    logger.debug(f"code {code} state {state}")

    oauth_response = rabbit.post(
        settings.OAUTH_CALLBACK_URL,
        data={"code": code, "state": state, "redirect_uri": redirect_uri},
    )

    js = oauth_response.json()
    logger.debug(f"status_code: {oauth_response.status_code}")

    session_cookie = get_dataserver_session_cookie(oauth_response.cookies)
    next_url = js['next']
    user = js['user']

    logger.debug(user["email"])

    logger.debug(f"redirect to {next_url} for user {user['email']} and session {session_cookie.value}")
    #
    jwt_val = jwt.encode(
        {"user": user, "session": session_cookie.value},
        settings.COOKIE_SECRET,
        algorithm="HS256",
    )

    logger.debug(jwt_val)

    expires = datetime.fromtimestamp(session_cookie.expires).strftime(
        "%a, %d %b %Y %H:%M:%S"
    )
    kwargs = {
        "value": jwt_val,
        "expires": expires,
        "secure": settings.SESSION_COOKIE_SECURE,
        "httponly": True,
        "domain": cookie_domain(),
    }

    response = HttpResponseRedirect(next_url)
    response.set_cookie("alice", **kwargs)

    return response


def oauth_logout_view(request):
    logger.info("attempting oauth logout")
    rabbit.get(settings.LOGOUT_AP, request=request)  # Data server log out

    # client redirect to the logged out view means the browser will
    # delete the cookie
    response = HttpResponseRedirect(reverse("logged_out"))
    # remove the alice cookie - so the user is logged out
    response.delete_cookie("alice", domain=cookie_domain())

    return response


def oauth_logged_out_view(request):
    logger.info("logged out")
    return render(request, "users/logged_out.html", {})
