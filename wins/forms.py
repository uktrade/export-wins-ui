import re

from datetime import datetime
from dateutil.relativedelta import relativedelta

from django import forms
from django.conf import settings
from django.core.mail import send_mail
from django.core.urlresolvers import reverse

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

    class Meta(object):
        exclude = ("id",)

    def __init__(self, *args, **kwargs):

        self.request = kwargs.pop("request")

        BootstrappedForm.__init__(self, *args, **kwargs)

        self.fields["date"].widget.attrs.update({"placeholder": "YYYY-MM"})

        self._add_breakdown_fields()
        self._add_advisor_fields()

        self._advisors = []

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

        for data in self._get_breakdown_data(win["id"]):
            self.push(settings.BREAKDOWNS_AP, data)

        for data in self._get_advisor_data(win["id"]):
            self.push(settings.ADVISORS_AP, data)

        # Send mail
        send_mail(
            "Subject Line!",
            "Oh hai! You should click this:\n\n  {}".format(
                self.request.build_absolute_uri(
                    reverse("responses", kwargs={"win_id": win["id"]})
                )
            ),
            settings.SENDING_ADDRESS,
            (self.cleaned_data["customer_email_address"],)
        )

    def push(self, ap, data):

        # The POST request is http-url-encoded rather than json-encoded for now
        # since I don't know how to set it that way and don't have the time to
        # find out.
        response = rabbit("post", ap, data=data, request=self.request)

        # This would be a nice place to use a public key to encrypt the POST
        # data and store it locally.  That way the user could report an
        # "error <primary key>" for where the payload is stored.
        if not response.status_code == 201:
            raise forms.ValidationError(
                "Something has gone terribly wrong.  Please contact support.")

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

    def _get_breakdown_data(self, win_id):

        r = []
        now = datetime.utcnow()

        for i in range(0, 5):
            d = now + relativedelta(years=i)
            for t in ("exports", "non_exports"):
                value = self.cleaned_data.get("breakdown_{}_{}".format(t, i))
                if value:
                    r.append({
                        "type": "1" if t == "exports" else "2",
                        "year": d.year,
                        "value": value,
                        "win": win_id
                    })
        return r

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

    def _get_advisor_data(self, win_id):
        for advisor in self._advisors:
            advisor["win"] = win_id
        return self._advisors

    def _test_at_least_one_advisor(self, cleaned_data):
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
                self._advisors.append({
                    "name": self.cleaned_data["advisor_{}_name".format(i)],
                    "team_type": self.cleaned_data["advisor_{}_team_type".format(i)],
                    "hq_team": self.cleaned_data["advisor_{}_hq_team".format(i)],
                    "location": self.cleaned_data["advisor_{}_location".format(i)]
                })
        return bool(self._advisors)


class ConfirmationForm(BootstrappedForm, metaclass=ConfirmationFormMetaclass):
    pass
