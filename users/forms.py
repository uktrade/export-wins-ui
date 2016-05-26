from django import forms
from django.contrib.auth import authenticate

from ui.forms import BootstrappedForm


class LoginForm(BootstrappedForm):

    email = forms.EmailField()
    password = forms.CharField(widget=forms.widgets.PasswordInput)

    def __init__(self, *args, **kwargs):
        BootstrappedForm.__init__(self, *args, **kwargs)
        self.user = None

    def clean_email(self):
        if "email" in self.cleaned_data:
            return self.cleaned_data["email"].lower()

    def clean(self):

        self.user = authenticate(
            username=self.cleaned_data["email"],
            password=self.cleaned_data["password"]
        )

        if self.user is not None:
            return self.cleaned_data

        raise forms.ValidationError("Invalid login.  Please try again.")
