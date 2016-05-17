import re

from datetime import datetime
from dateutil.relativedelta import relativedelta

from django import forms
from django.conf import settings
from django.core.mail import send_mail

from alice.helpers import rabbit, get_form_field
from alice.metaclasses import ReflectiveFormMetaclass
from ui.forms import BootstrappedForm


class WinReflectiveFormMetaclass(ReflectiveFormMetaclass):
    reflection_url = settings.WINS_AP


class ConfirmationFormMetaclass(ReflectiveFormMetaclass):
    reflection_url = settings.CONFIRMATIONS_AP


class WinForm(BootstrappedForm, metaclass=WinReflectiveFormMetaclass):

    # We're only caring about yyyy-mm formatted dates
    date = forms.fields.CharField(max_length=7, label="Date business won")

    # See: https://code.djangoproject.com/ticket/2723
    is_prosperity_fund_related = forms.fields.TypedChoiceField(
        coerce=lambda _: _ == "True",
        choices=((True, "Yes"), (False, "No")),
        widget=forms.Select,
        label="Prosperity Fund related"
    )
    is_e_exported = forms.fields.TypedChoiceField(
        coerce=lambda _: _ == "True",
        choices=((True, "Yes"), (False, "No")),
        widget=forms.Select,
        label="E-Exporting"
    )
    has_hvo_specialist_involvement = forms.fields.TypedChoiceField(
        coerce=lambda _: _ == "True",
        choices=((True, "Yes"), (False, "No")),
        widget=forms.Select,
        label="HVO Specialist Involvement"
    )

    def __init__(self, *args, **kwargs):

        self.request = kwargs.pop("request")

        BootstrappedForm.__init__(self, *args, **kwargs)

        self.fields["date"].widget.attrs.update({"placeholder": "YYYY-MM"})

        self._add_breakdown_fields()
        self._add_advisor_fields()

    def clean_date(self):
        date = self.cleaned_data.get("date")
        m = re.match(r"^(\d\d\d\d)-(\d\d)$", date)
        if not m:
            raise forms.ValidationError('Invalid format. Please use "YYYY-MM"')
        return "{}-01".format(date)

    def clean(self):

        cleaned_data = self.cleaned_data

        if not self._test_at_least_one_advisor(cleaned_data):
            raise forms.ValidationError(
                "At least one advisor must be defined."
            )

        return cleaned_data

    def save(self):

        win = self.push(settings.WINS_AP, self.cleaned_data)

        regex = re.compile("^breakdown_(?P<type>non_exports|exports)_(?P<year>\d+)$")
        for name, value in self.cleaned_data.items():
            m = regex.match(name)
            if m:
                pass
        self.push(settings.BREAKDOWNS_AP, 7)
        self.push(settings.ADVISORS_AP, 7)

        raise Exception("Don't Panic")

        # Send mail
        send_mail(
            "Subject Line!",
            "Message!",
            settings.SENDING_ADDRESS,
            (self.cleaned_data["customer_email_address"],)
        )

    def _save_breakdown(self):
        pass

    def push(self, ap, data):

        response = rabbit("post", ap, data=data, request=self.request)

        # This would be a nice place to use a public key to encrypt the POST
        # data and store it locally.  That way the user could report an
        # "error <primary key>" for where the payload is stored.
        if not response.status_code == 201:
            raise forms.ValidationError(
                "Something has gone terribly wrong.  Please contact support.")

        import json
        print(
            json.dumps(response.json(), indent=2, sort_keys=True),
            response.status_code
        )

        return response.json()

    def _add_breakdown_fields(self):

        breakdown_values = ("breakdown_exports_{}", "breakdown_non_exports_{}")

        now = datetime.utcnow()

        for i in range(0, 5):

            d = now + relativedelta(years=i)

            for field in breakdown_values:
                self.fields[field.format(i)] = forms.fields.IntegerField(
                    label="{}/{}".format(d.year, str(d.year + 1)[-2:]),
                    widget=forms.fields.NumberInput(
                        attrs={"class": "form-control"}
                    )
                )

    def _add_advisor_fields(self):

        schema = rabbit("get", settings.ADVISORS_AP + "schema/").json()

        for i in range(0, 5):
            for name, spec in schema.items():
                field_name = "advisor_{}_{}".format(i, name)
                self.fields[field_name] = get_form_field(spec)
                self.fields[field_name].required = False
                self.fields[field_name].widget.attrs.update({
                    "class": "form-control"
                })

    @staticmethod
    def _test_at_least_one_advisor(cleaned_data):
        """
        A convoluted way to test whether one advisor was filled out or not.
        This could probably be a lot cleaner but deadlines.
        :param cleaned_data:
        :return:
        """
        for i in range(0, 5):
            score = 0
            for name in ("name", "team_type", "hq_team", "location"):
                field_name = "advisor_{}_{}".format(i, name)
                if field_name not in cleaned_data:
                    break
                if not cleaned_data[field_name]:
                    break
                score += 1
            if score == 4:
                return True
        return False


class ConfirmationForm(BootstrappedForm, metaclass=ConfirmationFormMetaclass):
    pass
