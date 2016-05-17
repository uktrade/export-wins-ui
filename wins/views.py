from .forms import WinForm

from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.urlresolvers import reverse
from django.views.generic import FormView, TemplateView


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


class CustomerResponseView(FormView):

    template_name = "wins/customer-response.html"

    def get_success_url(self):
        return reverse("thanks")


class ThanksView(TemplateView):
    """
    Doubles as the thank-you page for both the win creation and customer
    responses.
    """

    template_name = "wins/thanks.html"
