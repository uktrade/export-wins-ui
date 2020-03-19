import logging
from datetime import datetime

import jwt
from django.conf import settings
from django.shortcuts import render
from django.utils.http import is_safe_url
from django.urls import reverse
from django.views.generic import FormView, RedirectView
from django.http import HttpResponse, HttpResponseRedirect

from alice.helpers import rabbit
from .forms import LoginForm, get_dataserver_session_cookie

logger = logging.getLogger(__name__)


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
    jwt_val = jwt.encode({
        "user": user,
        "session": session_cookie.value
    },
        settings.COOKIE_SECRET,
        "HS256",
    ).decode("utf-8")

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


class LoginView(FormView):
    """ Login via data server and set JWT cookie

    When user put their details into the form, the form passes them to the data
    server, which creates and manages a session for the user.

    THIS IS LEFT IN THE CODE TO HANDLE MIGRATION FROM USERNAME/PASSWORD TO SSO

    """

    form_class = LoginForm
    template_name = "users/login.html"

    def form_valid(self, form):
        response = FormView.form_valid(self, form)

        # After successful login, save dict of user data given by data server
        # API into JWT cookie. Also save session id of session from data
        # server, for use when making requests to data server via Rabbit.
        # Note UI server and admin server have different secrets and domains.
        logger.debug(form.user)
        jwt_val = jwt.encode(
            {"user": form.user, "session": form.session_cookie.value},
            settings.COOKIE_SECRET,
            "HS256",
        ).decode("utf-8")
        expires = datetime.fromtimestamp(form.session_cookie.expires).strftime(
            "%a, %d %b %Y %H:%M:%S"
        )
        kwargs = {
            "value": jwt_val,
            "expires": expires,
            "secure": settings.SESSION_COOKIE_SECURE,
            "httponly": True,
            "domain": cookie_domain(),
        }

        response.set_cookie("alice", **kwargs)
        return response

    def get_success_url(self):
        redirect_to = self.request.GET.get("next")
        if redirect_to:
            if is_safe_url(url=redirect_to, allowed_hosts=self.request.get_host()):
                return redirect_to
        return "/"


class LogoutView(RedirectView):
    url = "/"

    def get(self, request, *args, **kwargs):
        rabbit.get(settings.LOGOUT_AP, request=request)  # Data server log out
        response = RedirectView.get(self, request, *args, **kwargs)
        response.delete_cookie("alice", domain=cookie_domain())
        return response
