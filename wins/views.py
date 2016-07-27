import os
from dateutil.parser import parse as date_parser
from dateutil.relativedelta import relativedelta

from django.conf import settings
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.views.generic import FormView

from .forms import WinForm, ConfirmationForm
from alice.braces import LoginRequiredMixin
from alice.helpers import rabbit


class NewWinView(LoginRequiredMixin, FormView):

    template_name = "wins/win-form.html"
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

    template_name = "wins/confirmation-form.html"
    form_class = ConfirmationForm

    # limit the number of days form may be accessed after win submission for
    # security purposes
    ACCEPTANCE_WINDOW = 90

    sample = False  # is this a sample win, which will not be saved?

    class SecurityException(Exception):
        pass

    def dispatch(self, request, *args, **kwargs):
        """ Override dispatch to do some checks before displaying form """

        # quick hack to show sample customer response form with a known test win
        if request.path.endswith('sample/'):
            kwargs['pk'] = os.getenv('SAMPLE_WIN', 'notconfigured')
            self.kwargs['pk'] = kwargs['pk']
            self.sample = True

        try:
            self.win_dict = self._get_valid_win(kwargs["pk"], request)
        except self.SecurityException as e:
            return self._deny_access(request, message=str(e))

        return FormView.dispatch(self, request, *args, **kwargs)

    def get_form_kwargs(self):
        """ Setup additional kwargs for the form """

        kwargs = FormView.get_form_kwargs(self)
        kwargs["request"] = self.request
        kwargs["initial"]["win"] = self.kwargs["pk"]
        return kwargs

    def get_context_data(self, **kwargs):
        """ Get Win data for use in the template

        Not sure why this gets the schema, doesn't seem necessary

        """
        schema_url = "{}schema/".format(settings.WINS_AP)
        win_schema = rabbit.get(schema_url).json()

        for key, value in self.win_dict.items():
            if key == "date":
                value = date_parser(value)
            win_schema[key]["value"] = value

        context = FormView.get_context_data(self, **kwargs)
        context.update({"win": win_schema})
        return context

    def get_success_url(self):
        return reverse("confirmation-thanks")

    def form_valid(self, form):
        if not self.sample:
            form.save()
        return FormView.form_valid(self, form)

    def _deny_access(self, request, message):
        """ Show an error message instead of the form """

        return self.response_class(
            request=request,
            template="wins/confirmation-denied.html",
            context={"message": message},
            using=self.template_engine
        )

    def _get_valid_win(self, pk, request):
        """ Raise SecurityException if Win not valid, else return Win dict """

        win_url = "{}{}/".format(settings.LIMITED_WINS_AP, pk)
        win_resp = rabbit.get(win_url, request=request)

        # likely because already submitted
        if not win_resp.status_code == 200:
            raise self.SecurityException(
                """Sorry, this record is not available. If the form has already
                been submitted, then the record cannot be viewed or
                resubmitted.
                """
            )

        win_dict = win_resp.json()

        # is it within security window?
        created = date_parser(win_dict["created"])
        window_extent = created + relativedelta(days=self.ACCEPTANCE_WINDOW)
        now = timezone.now()
        if now > window_extent:
            raise self.SecurityException(
                "Sorry, this record is no longer available for review."
            )

        # is the confirmation already completed?
        confirmation_url = "{}?win={}".format(
            settings.CONFIRMATIONS_AP,
            win_dict['id'],
        )
        confirmation_dict = rabbit.get(confirmation_url).json()
        if confirmation_dict["count"]:
            raise self.SecurityException(
                "Sorry, this confirmation was already completed."
            )

        return win_dict

def test500(request):
    raise Exception('test error')
