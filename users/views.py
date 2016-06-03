from django.conf import settings
from django.contrib.auth import login, logout
from django.utils.http import is_safe_url
from django.views.generic import FormView, RedirectView

from alice.helpers import rabbit

from .forms import LoginForm


class LoginView(FormView):

    form_class = LoginForm
    template_name = "users/login.html"

    def form_valid(self, form):
        login(self.request, form.user)
        response = FormView.form_valid(self, form)
        response.set_cookie(
            "alice",
            form.user.token,
            secure=settings.SESSION_COOKIE_SECURE,
            httponly=True
        )
        return response

    def get_success_url(self):
        redirect_to = self.request.GET.get("next")
        if redirect_to:
            if is_safe_url(url=redirect_to, host=self.request.get_host()):
                return redirect_to
        return "/"


class LogoutView(RedirectView):

    url = "/"

    def get(self, request, *args, **kwargs):
        logout(self.request)  # Local
        rabbit.get(settings.LOGOUT_AP)  # Remote
        response = RedirectView.get(self, request, *args, **kwargs)
        response.delete_cookie("alice")
        return response
