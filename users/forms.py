from django import forms
from django.contrib.auth import authenticate

from ui.forms import BootstrappedForm

from .exceptions import LoginException


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

        cleaned_data = BootstrappedForm.clean(self)

        try:
            self.user = authenticate(
                username=cleaned_data.get("email"),
                password=cleaned_data.get("password")
            )
        except LoginException as e:
            raise forms.ValidationError(e)

        if self.user is not None:
            return cleaned_data

        raise forms.ValidationError("Invalid login.  Please try again.")
