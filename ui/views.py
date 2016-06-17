from django.views.generic import TemplateView

from alice.braces import LoginRequiredMixin


class IndexView(LoginRequiredMixin, TemplateView):
    template_name = "ui/index.html"
