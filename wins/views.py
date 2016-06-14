from dateutil.parser import parse as date_parser
from dateutil.relativedelta import relativedelta

from django.conf import settings
from alice.braces import LoginRequiredMixin
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.views.generic import FormView

from alice.helpers import rabbit

from .forms import WinForm, ConfirmationForm


class NewWinView(LoginRequiredMixin, FormView):

    template_name = "wins/new.html"
    form_class = WinForm

    def form_valid(self, form):
        form.save()
        return FormView.form_valid(self, form)

    def get_success_url(self):
        return reverse("thanks")

    def get_form_kwargs(self):
        r = FormView.get_form_kwargs(self)
        r["request"] = self.request
        return r


class ConfirmationView(FormView):

    template_name = "wins/confirmation.html"
    form_class = ConfirmationForm

    ACCEPTANCE_WINDOW = 7  # Days

    class SecurityException(Exception):
        pass

    def dispatch(self, request, *args, **kwargs):

        try:
            win = self._check_outside_window(kwargs["pk"], request)
            self._check_already_submitted(win["id"])
        except self.SecurityException as e:
            return self.denied(request, message=str(e), *args, **kwargs)

        return FormView.dispatch(self, request, *args, **kwargs)

    def get_form_kwargs(self):
        r = FormView.get_form_kwargs(self)
        r["request"] = self.request
        r["initial"]["win"] = self.kwargs["pk"]
        return r

    def get_context_data(self, **kwargs):

        win_url = "{}{}/".format(settings.LIMITED_WINS_AP, self.kwargs["pk"])
        schema_url = "{}schema/".format(settings.WINS_AP)

        values = rabbit.get(win_url).json()
        win = rabbit.get(schema_url).json()
        for key, value in values.items():
            if key == "date":
                value = date_parser(value)
            win[key]["value"] = value

        context = FormView.get_context_data(self, **kwargs)
        context.update({"win": win})

        return context

    def get_success_url(self):
        return reverse("confirmation-thanks")

    def form_valid(self, form):
        form.save()
        return FormView.form_valid(self, form)

    def denied(self, request, *args, **kwargs):
        return self.response_class(
            request=request,
            template="wins/confirmation-denied.html",
            context={"message": kwargs["message"]},
            using=self.template_engine
        )

    def _check_outside_window(self, pk, request):

        now = timezone.now()

        win_url = "{}{}/".format(settings.LIMITED_WINS_AP, pk)
        win = rabbit.get(win_url, request=request)

        if not win.status_code == 200:
            raise self.SecurityException("That key appears to be invalid")

        win = win.json()

        created = date_parser(win["created"])
        window_extent = created + relativedelta(days=self.ACCEPTANCE_WINDOW)

        if now > window_extent:
            raise self.SecurityException(
                "This record is no longer available for review.")

        return win

    def _check_already_submitted(self, pk):
        ap = settings.CONFIRMATIONS_AP
        confirmation_url = "{}?win={}".format(ap, pk)
        confirmation = rabbit.get(confirmation_url).json()

        if bool(confirmation["count"]):
            raise self.SecurityException(
                "This confirmation was already completed."
            )
