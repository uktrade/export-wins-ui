import re

from datetime import datetime
from dateutil.relativedelta import relativedelta

from django import forms
from django.conf import settings
from django.core.urlresolvers import reverse

from alice.helpers import rabbit, get_form_field
from alice.metaclasses import ReflectiveFormMetaclass
from ui.forms import BootstrappedForm


class WinReflectiveFormMetaclass(ReflectiveFormMetaclass):

    reflection_url = settings.WINS_AP


class ConfirmationFormMetaclass(ReflectiveFormMetaclass):

    reflection_url = settings.CONFIRMATIONS_AP

    def __new__(mcs, name, bases, attrs):

        new_class = ReflectiveFormMetaclass.__new__(mcs, name, bases, attrs)

        make_typed_choice = (
            "agree_with_win",
            "case_study_willing"
        )
        for name in make_typed_choice:
            form_field = forms.TypedChoiceField(
                coerce=lambda x: x == "True",
                choices=((True, 'Yes'), (False, 'No')),
                widget=forms.RadioSelect,
                label=new_class._schema[name]["label"]
            )
            new_class.base_fields[name] = form_field
            new_class.declared_fields[name] = form_field

        return new_class


class WinForm(BootstrappedForm, metaclass=WinReflectiveFormMetaclass):

    # We're only caring about MM/YYYY formatted dates
    date = forms.fields.CharField(max_length=7, label="Date won")

    # specify fields from the serializer to exclude from the form
    class Meta(object):
        exclude = (
            "id",
            "user",
            "complete",
            "responded",
            "sent",
            "country_name",
        )

    def __init__(self, *args, **kwargs):

        self.request = kwargs.pop("request")
        self.completed = kwargs.pop('completed', False)
        breakdowns = kwargs.pop('breakdowns', [])
        advisors = kwargs.pop('advisors', [])

        super().__init__(*args, **kwargs)

        self.date_format = 'MM/YYYY'  # the format the date field expects

        self.fields["date"].widget.attrs.update(
            {"placeholder": self.date_format})

        self.fields["is_personally_confirmed"].required = True
        self.fields["is_personally_confirmed"].label_suffix = ""

        self.fields["is_line_manager_confirmed"].required = True
        self.fields["is_line_manager_confirmed"].label_suffix = ""

        self.fields["total_expected_export_value"].widget.attrs.update(
            {"placeholder": "£GBP"})
        self.fields["total_expected_non_export_value"].widget.attrs.update(
            {"placeholder": "£GBP"})
        self.fields["total_expected_export_value"].initial = '0'
        self.fields["total_expected_non_export_value"].initial = '0'

        # make checkboxes not required
        self.fields["has_hvo_specialist_involvement"].required = False
        self.fields["is_prosperity_fund_related"].required = False
        self.fields["is_e_exported"].required = False

        if not self.completed:
            # cannot edit breakdowns once completed/sent
            self.breakdown_field_data = self._add_breakdown_fields()
            self._add_breakdown_initial(breakdowns)

        self.advisor_field_specs = self._get_advisor_fields()
        self._add_advisor_fields()
        self._add_advisor_initial(advisors)

        # fields which are shown the customer, and so cannot be edited after
        # customer has been invited to confirm
        non_editable_fields = [
            "description",
            "date",
            "country",
            "customer_location",
            "total_expected_export_value",
            "total_expected_non_export_value",
            "type",
        ]

        if self.completed:
            for field_name in non_editable_fields:
                del self.fields[field_name]

        not_dropdowns = [
            'type',
            'goods_vs_services'
        ]

        # add the default for drop-downs
        for name, field in self.fields.items():
            if type(field) == forms.ChoiceField and name not in not_dropdowns:
                field.choices = [('', 'Please choose...')] + field.choices

    def clean_date(self):
        """ Validate date entered as a string and reformat for serializer """

        date_str = self.cleaned_data.get("date")

        m = re.match(r"^(?P<month>\d\d)/(?P<year>\d\d\d\d)$", date_str)
        if not m:
            raise forms.ValidationError(
                'Invalid format. Please use {}'.format(self.date_format))

        try:
            year = int(m.group("year"))
            month = int(m.group("month"))
            if year < 1970:
                raise ValueError("Year is unreasonable")
            date = datetime(year, month, 1)
        except:
            raise forms.ValidationError(
                'Invalid date. Please use {}'.format(self.date_format))

        return date.strftime('%Y-%m-%d')  # serializer expects YYYY-MM-DD

    def clean_is_personally_confirmed(self):
        r = self.cleaned_data.get("is_personally_confirmed")
        if not r:
            raise forms.ValidationError("This is a required field")
        return r

    def clean_is_line_manager_confirmed(self):
        r = self.cleaned_data.get("is_line_manager_confirmed")
        if not r:
            raise forms.ValidationError("This is a required field")
        return r

    def create(self):
        """ Push cleaned data to appropriate data server access points """

        self.cleaned_data["complete"] = False  # not until user reviews

        # This doesn't really matter, since the data server ignores this value
        # and substitutes the logged-in user id.  However, if you don't provide
        # it, the serialiser explodes, so we attach it for kicks.
        self.cleaned_data["user"] = self.request.user.pk

        win = rabbit.push(settings.WINS_AP, self.cleaned_data, self.request)

        for data in self._get_breakdown_data(win["id"]):
            rabbit.push(settings.BREAKDOWNS_AP, data, self.request)

        for data in self._get_advisor_data(win["id"]):
            #  assume rows without name filled in are not to be recorded
            if not data['name'].strip():
                continue
            rabbit.push(settings.ADVISORS_AP, data, self.request)

        return win

    def update(self, win_id):
        """ Push editable fields to data server for updating """

        self.cleaned_data["user"] = self.request.user.pk
        rabbit.push(
            settings.WINS_AP + win_id + '/',
            self.cleaned_data,
            self.request,
            'patch',
        )

        # can't edit breakdowns once completed/sent
        if not self.completed:
            for data in self._get_breakdown_data(win_id):
                rabbit.push(
                    settings.BREAKDOWNS_AP + str(data['id']) + '/',
                    data,
                    self.request,
                    'patch',
                )

        for data in self._get_advisor_data(win_id):
            existing_advisor_id = data['id']
            ignore_or_delete_advisor = not bool(data['name'].strip())

            # if has an id already, update that advisor
            if existing_advisor_id:

                # if does not have a name, but does have an id, delete it
                # because user has blanked the name field to remove it
                if ignore_or_delete_advisor:
                    rabbit.push(
                        settings.ADVISORS_AP + str(existing_advisor_id) + '/',
                        data,
                        self.request,
                        'delete',
                    )
                else:
                    rabbit.push(
                        settings.ADVISORS_AP + str(existing_advisor_id) + '/',
                        data,
                        self.request,
                        'patch',
                    )
            elif not ignore_or_delete_advisor:
                rabbit.push(settings.ADVISORS_AP, data, self.request)

    def _add_breakdown_fields(self):
        """ Create breakdown fields

        This assumes wins cannot be edited in the year after they are created

        """
        base_year = 2016  # project is intended only to be used for 2016/17
        field_data = []
        for breakdown_type in ['exports', 'non_exports']:
            for i in range(0, 5):
                year = (base_year + i)
                field_name = 'breakdown_{}_{}'.format(breakdown_type, i)
                field_data.append((field_name, year, breakdown_type))
                label = "{}/{}".format(
                    year,
                    str(year + 1)[-2:],
                )
                widget = forms.fields.NumberInput(
                    attrs={
                        "class": "form-control",
                        "placeholder": "GBP"
                    }
                )
                self.fields[field_name] = forms.fields.IntegerField(
                    label=label,
                    widget=widget,
                    initial='0',
                    max_value=2000000000,
                    label_suffix="",
                )
        return field_data

    def _add_breakdown_initial(self, breakdowns):
        """ Add breakdown data to `initial` """

        # make dict in order to know which value matches which field
        self.year_type_to_breakdown = {
            '{}-{}'.format(b['year'], b['type']): b
            for b in breakdowns
        }
        for field_name, year, breakdown_type in self.breakdown_field_data:
            breakdown_typenum = "1" if breakdown_type == "exports" else "2"
            breakdown = self.year_type_to_breakdown.get(
                '{}-{}'.format(year, breakdown_typenum)
            )
            if breakdown:
                self.initial[field_name] = breakdown['value']

    def _get_breakdown_data(self, win_id):
        """ Get input breakdown data for pushing to endpoint """

        retval = []
        for field_name, year, breakdown_type in self.breakdown_field_data:
            value = self.cleaned_data.get(field_name)
            breakdown_typenum = "1" if breakdown_type == "exports" else "2"
            breakdown = self.year_type_to_breakdown.get(
                '{}-{}'.format(year, breakdown_typenum)
            )
            retval.append({
                "id": breakdown['id'] if breakdown else None,
                "type": breakdown_typenum,
                "year": year,
                "value": value or 0,
                "win": win_id,
            })
        return retval

    def _get_advisor_fields(self):
        """ Make list of lists of advisor field names and specs """

        advisor_schema = rabbit.get(settings.ADVISORS_AP + "schema/").json()
        advisor_fields = []
        num_advisor_fields = 5
        for i in range(0, num_advisor_fields):
            instance_fields = []
            for name, spec in advisor_schema.items():
                if name == 'win':
                    # don't want a field for the foreign key in the form
                    continue
                field_name = "advisor_{}_{}".format(i, name)
                instance_fields.append((name, field_name, spec))
            advisor_fields.append(instance_fields)
        return advisor_fields

    def _add_advisor_fields(self):
        """ Create advisor fields from advisor field specification """

        for field_data in self.advisor_field_specs:
            for _, field_name, field_spec in field_data:
                self.fields[field_name] = get_form_field(field_spec)
                self.fields[field_name].required = False
                self.fields[field_name].widget.attrs.update({
                    "class": "form-control"
                })

    def _add_advisor_initial(self, advisors):
        """ Add advisor data to `self.initial` """

        for i, field_data in enumerate(self.advisor_field_specs):
            if i + 1 > len(advisors):
                break
            advisor = advisors[i]
            for name, field_name, _ in field_data:
                self.initial[field_name] = advisor.get(name)

    def _get_advisor_data(self, win_id):
        """ Get input advisor data for pushing to endpoint """

        advisor_data = []
        for field_data in self.advisor_field_specs:
            instance_dict = {
                name: self.cleaned_data[field_name]
                for name, field_name, _ in field_data
            }
            instance_dict['win'] = win_id
            advisor_data.append(instance_dict)
        return advisor_data


class ConfirmationForm(BootstrappedForm, metaclass=ConfirmationFormMetaclass):

    win = forms.CharField(max_length=128)

    def __init__(self, *args, **kwargs):

        self.request = kwargs.pop("request")

        BootstrappedForm.__init__(self, *args, **kwargs)

        self.fields["win"].widget = forms.widgets.HiddenInput()

    def send_notifications(self, win_id):
        pass

    def save(self):

        confirmation = rabbit.push(
            settings.CONFIRMATIONS_AP,
            self.cleaned_data,
            self.request,
        )

        self.send_notifications(confirmation)
