import os
from dateutil.parser import parse as date_parser
from dateutil.relativedelta import relativedelta

from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import Http404
from django.shortcuts import redirect
from django.utils import timezone
from django.views.generic import FormView, TemplateView

from .forms import WinForm, ConfirmationForm
from alice.braces import LoginRequiredMixin
from alice.helpers import rabbit


class WinTemplateView(TemplateView):
    """ Template with Win context

    Expects to be called with url with `win_id`

    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['win'] = get_win(kwargs['win_id'], self.request)
        return context


class LockedWinTemplateView(TemplateView):
    """ For locked Wins """

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['edit_days'] = settings.EDIT_TIMEOUT_DAYS
        return context


class MyWinsView(LoginRequiredMixin, TemplateView):
    """ View a list of all Wins of logged in User """

    template_name = 'wins/my-wins.html'

    def get_context_data(self, **kwargs):
        context = TemplateView.get_context_data(self, **kwargs)

        # get all user's wins
        url = settings.WINS_AP + '?user__id=' + str(self.request.user.id)
        win_response = rabbit.get(url, request=self.request).json()
        wins = win_response['results']

        # parse dates
        for win in wins:
            win['created'] = date_parser(win['created'])
            if win['updated']:
                win['updated'] = date_parser(win['updated'])
            win['sent'] = [date_parser(d) for d in win['sent']]
            if win['responded']:
                win['responded']['created'] = (
                    date_parser(win['responded']['created'])
                )

        # split wins up for user
        context['unsent'] = [w for w in wins if not w['complete']]
        context['responded'] = [w for w in wins if w['responded']]
        context['sent'] = [
            w for w in wins
            if w['complete'] and w not in context['responded']
        ]
        return context


def get_win(win_id, request):
    url = settings.WINS_AP + '?id=' + win_id
    resp = rabbit.get(url, request=request)
    if resp.status_code != 200:
        raise Http404
    else:
        return resp.json()['results'][0]


def get_limited_win(win_id, request):
    url = "{}{}/".format(settings.LIMITED_WINS_AP, win_id)
    resp = rabbit.get(url, request=request)
    return resp


def get_win_details(win_id, request):
    url = "{}{}/".format(settings.WIN_DETAILS_AP, win_id)
    resp = rabbit.get(url, request=request)
    return resp


def get_win_advisors(win_id, request):
    url = settings.ADVISORS_AP + '?win__id=' + win_id
    resp = rabbit.get(url, request=request)
    if resp.status_code != 200:
        raise Http404
    else:
        return resp.json()['results']


def get_win_breakdowns(win_id, request):
    url = settings.BREAKDOWNS_AP + '?win__id=' + win_id
    resp = rabbit.get(url, request=request)
    if resp.status_code != 200:
        raise Http404
    else:
        return resp.json()['results']


def locked(win):
    if not win['sent']:
        return False

    sent = date_parser(win['sent'][0])
    sent_delta = (timezone.now() - sent)  # tz doesn't really matter
    return sent_delta.days >= settings.EDIT_TIMEOUT_DAYS


class WinView(LoginRequiredMixin, TemplateView):
    """ View details of a Win of logged in User """

    template_name = 'wins/win-details.html'

    def get_context_data(self, **kwargs):
        context = TemplateView.get_context_data(self, **kwargs)
        resp = get_win_details(kwargs['win_id'], self.request)
        if resp.status_code != 200:
            raise Http404
        context['win'] = resp.json()
        context['locked'] = locked(context['win'])
        context['edit_days'] = settings.EDIT_TIMEOUT_DAYS
        return context


class WinCompleteView(LoginRequiredMixin, WinTemplateView):
    """ Mark win complete """

    template_name = 'wins/win-complete.html'

    def post(self, *args, **kwargs):
        """ POST means user has confirmed they want to submit """

        win_id = kwargs['win_id']
        rabbit.push(
            settings.WINS_AP + win_id + '/',
            {'complete': True},
            self.request,
            'patch',
        )
        return redirect(
            reverse("complete-win-success", kwargs={'win_id': win_id})
        )


class BaseWinFormView(LoginRequiredMixin, FormView):
    """ Base class for adding and editing Wins """

    form_class = WinForm

    def get_form_kwargs(self):
        kwargs = FormView.get_form_kwargs(self)
        kwargs["request"] = self.request
        return kwargs


class NewWinView(BaseWinFormView):
    """ Create a new Win """

    template_name = "wins/win-form.html"

    def form_valid(self, form):
        """ If form is valid, create on data server """
        self.win = form.create()
        return FormView.form_valid(self, form)

    def get_success_url(self):
        return reverse("new-win-success", kwargs={'win_id': self.win['id']})


class EditWinView(BaseWinFormView):
    """ Edit a Win of logged in User """

    template_name = "wins/win-edit-form.html"

    def dispatch(self, *args, **kwargs):
        self.win = get_win(self.kwargs['win_id'], self.request)
        if locked(self.win):
            return redirect(
                reverse(
                    "edit-win-locked",
                    kwargs={'win_id': self.kwargs['win_id']},
                )
            )
        return super().dispatch(*args, **kwargs)

    def get_initial(self):
        # note: breakdowns and advisors get added to initial dict in the
        # form's __init__
        initial = self.win
        initial['date'] = date_parser(initial['date']).strftime('%m/%Y')
        return initial

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['win'] = self.win
        return context

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['completed'] = self.win['complete']
        kwargs['advisors'] = get_win_advisors(
            self.kwargs['win_id'],
            self.request,
        )

        breakdowns = get_win_breakdowns(
            self.kwargs['win_id'],
            self.request,
        )
        # for a non-complete win, add breakdowns as form kwarg
        kwargs['breakdowns'] = breakdowns

        # for a complete win, breakdown not editable, just statically displayed
        # format data same as they are given in detail page for convenience
        exports = [
            {'value': b['value'], 'year': b['year']}
            for b in breakdowns if b['type'] == 1
        ]
        nonexports = [
            {'value': b['value'], 'year': b['year']}
            for b in breakdowns if b['type'] == 2
        ]
        self.win['breakdowns'] = {
            'exports': exports,
            'nonexports': nonexports,
        }

        return kwargs

    def form_valid(self, form):
        """ If form is valid, update on data server """

        form.update(self.kwargs['win_id'])
        return FormView.form_valid(self, form)

    def get_success_url(self):
        win_id = self.kwargs['win_id']
        if self.request.POST.get('send'):
            return reverse("win-complete", kwargs={'win_id': win_id})
        else:
            return reverse("edit-win-success", kwargs={'win_id': win_id})


class ConfirmationView(FormView):
    """ Create a new Customer Response """

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

        # quick hack to show sample customer response form with known test win
        if request.path.endswith('sample/'):
            kwargs['win_id'] = os.getenv('SAMPLE_WIN', 'notconfigured')
            self.kwargs['win_id'] = kwargs['win_id']
            self.sample = True

        try:
            self.win_dict = self._get_valid_win(kwargs["win_id"], request)
        except self.SecurityException as e:
            return self._deny_access(request, message=str(e))

        return FormView.dispatch(self, request, *args, **kwargs)

    def get_form_kwargs(self):
        """ Setup additional kwargs for the form """

        kwargs = FormView.get_form_kwargs(self)
        kwargs["request"] = self.request
        kwargs["initial"]["win"] = self.kwargs["win_id"]
        return kwargs

    def get_context_data(self, **kwargs):
        """ Get Win data for use in the template """

        context = FormView.get_context_data(self, **kwargs)
        context.update({"win": self.win_dict})
        context['win']['date'] = date_parser(self.win_dict['date'])
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

        win_resp = get_limited_win(pk, request)

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
