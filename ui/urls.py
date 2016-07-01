import os

from django.conf.urls import url
from django.views.generic import TemplateView

from ui.views import IndexView, CSVView
from users.views import LoginView, LogoutView
from wins.views import NewWinView, ConfirmationView

urlpatterns = [

    url(r"^wins/new/", NewWinView.as_view(), name="new"),
    url(
        r"^wins/thanks/",
        TemplateView.as_view(template_name="wins/thanks.html"),
        name="thanks"
    ),
    url(
        r"^wins/review/thanks/",
        TemplateView.as_view(template_name="wins/confirmation-thanks.html"),
        name="confirmation-thanks"
    ),
    url(
        r"^wins/review/sample/",
        ConfirmationView.as_view(),
        name="response_sample"
    ),
    url(
        r"^wins/review/(?P<pk>[a-z0-9\-]+)/",
        ConfirmationView.as_view(),
        name="responses"
    ),

    url(r'^accounts/login/', LoginView.as_view(), name="login"),
    url(r"^accounts/logout/", LogoutView.as_view(), name="logout"),

    url(r"^$", IndexView.as_view(), name="index"),

]

csv_secret = os.getenv("CSV_SECRET")
if csv_secret:
    csv_url = url(r"^{}/".format(csv_secret), CSVView.as_view(), name="new")
    urlpatterns = [csv_url] + urlpatterns
