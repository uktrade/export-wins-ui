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
    types_all = forms.fields.BooleanField(required=False)  # just used to hang error on
    type_export = forms.fields.BooleanField(required=False, label="Export")
    type_non_export = forms.fields.BooleanField(required=False, label="Non-export")
    type_odi = forms.fields.BooleanField(required=False, label="Outward Direct Investment")

    # specify fields from the serializer to exclude from the form
    class Meta(object):
        exclude = (
            "id",
            "user",
            "complete",
            "responded",
            "sent",
            "country_name",
            "type_display",
            "location",
            "type",
        )

    def __init__(self, *args, **kwargs):

        self.request = kwargs.pop("request")
        self.editing = kwargs.pop('editing', False)
        self.completed = kwargs.pop('completed', False)
        self.base_year = int(kwargs.pop('base_year'))
        breakdowns = kwargs.pop('breakdowns', [])
        advisors = kwargs.pop('advisors', [])

        super().__init__(*args, **kwargs)

        self.date_format = 'MM/YYYY'  # the format the date field expects

        # when editing an existing win, pre-check the type checkboxes as
        # appropriate to the values entered
        if self.editing:
            self.fields["type_export"].initial = bool(
                kwargs['initial']['total_expected_export_value']
            )
            self.fields["type_non_export"].initial = bool(
                kwargs['initial']['total_expected_non_export_value']
            )
            self.fields["type_odi"].initial = bool(
                kwargs['initial']['total_expected_odi_value']
            )

        self.fields["date"].widget.attrs.update(
            {"placeholder": self.date_format})
        self.fields["date"].label = """
            Date won (within {}/{} financial year)
            """.format(self.base_year, self.base_year + 1)

        self.fields["is_personally_confirmed"].required = True
        self.fields["is_personally_confirmed"].label_suffix = ""

        self.fields["is_line_manager_confirmed"].required = True
        self.fields["is_line_manager_confirmed"].label_suffix = ""

        self.fields["total_expected_export_value"].widget.attrs.update(
            {"placeholder": "£GBP"})
        self.fields["total_expected_non_export_value"].widget.attrs.update(
            {"placeholder": "£GBP"})
        self.fields["total_expected_odi_value"].widget.attrs.update(
            {"placeholder": "£GBP"})

        self.fields["total_expected_export_value"].initial = '0'
        self.fields["total_expected_non_export_value"].initial = '0'
        self.fields["total_expected_odi_value"].initial = '0'

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
            "total_expected_export_value",
            "total_expected_non_export_value",
            "total_expected_odi_value",
        ]

        if self.completed:
            for field_name in non_editable_fields:
                del self.fields[field_name]

        not_dropdowns = [
            'type',
            'goods_vs_services'
        ]

        # add the default for drop-downs: "Please choose..."
        # note: fields which are choices with blank=True get an empty field
        # inserted at the beginning, so replace this with "Please choose..."
        default_choice = [('', 'Please choose...')]
        for name, field in self.fields.items():
            if type(field) == forms.ChoiceField and name not in not_dropdowns:
                if field.choices[0][0] == '':
                    field.choices = default_choice + field.choices[1:]
                else:
                    field.choices = default_choice + field.choices

        # remove 2017 HVCs for 2016. Done here because it is so much easier
        # than adapting this system to do it via the back-end
        new_hvcs_for_2017 = ['E218', 'E219','E220','E221','E222','E223','E224','E225','E226','E227','E228','E229','E230','E231','E232','E233','E234','E235','E236','E237','E238','E239','E240','E241']
        hvcs_removed_for_2017 = ['E001', 'E003', 'E004', 'E010', 'E039', 'E048', 'E060', 'E062', 'E077', 'E080', 'E082', 'E084', 'E088', 'E090', 'E093', 'E101', 'E102', 'E109', 'E114', 'E115', 'E126', 'E127', 'E130', 'E131', 'E134', 'E136', 'E139', 'E142', 'E144', 'E157', 'E160', 'E162', 'E169', 'E172', 'E173', 'E176', 'E178', 'E180', 'E181', 'E190', 'E193', 'E195', 'E213', 'E214']
        hvc_choices = self.fields['hvc'].choices
        if self.base_year == 2016:
            self.fields['hvc'].choices = [
                (code, name) for code, name in hvc_choices
                if code not in new_hvcs_for_2017
            ]
        elif self.base_year == 2017:
            self.fields['hvc'].choices = [
                (code, name) for code, name in hvc_choices
                if code not in hvcs_removed_for_2017
            ]
        else:
            raise Exception('invalid base year')

    @classmethod
    def _get_financial_year(cls, month_year_str):
        month, year = month_year_str.split('/')
        month, year = int(month), int(year)
        return year if month >= 4 else year - 1

    def clean_date(self):
        """ Validate date entered as a string and reformat for serializer """

        date_str = self.cleaned_data.get("date")

        # validate format
        m = re.match(r"^(?P<month>\d\d)/(?P<year>\d\d\d\d)$", date_str)
        if not m:
            raise forms.ValidationError(
                'Invalid format. Please use {}'.format(self.date_format))

        # check won date is within chosen financial year
        input_fy = self._get_financial_year(date_str)
        if self.base_year != input_fy:
            if self.editing:
                raise forms.ValidationError("""
                    You cannot change the financial year of an already saved
                    Win - the business must have been won in the year ({}/{})
                       """.format(self.base_year, self.base_year + 1))
            else:
                raise forms.ValidationError("""
                    You have chosen to enter a Win for financial year
                    {}/{}, the business must have been won in that year
                    """.format(self.base_year, self.base_year + 1))

        try:
            year = int(m.group("year"))
            month = int(m.group("month"))
            if year < 1970:
                raise ValueError("Year is unreasonable")
            date = datetime(year, month, 1)
        except:
            raise forms.ValidationError(
                'Invalid date. Please use {}'.format(self.date_format))

        if date < datetime(day=1, month=1, year=2016):
            raise forms.ValidationError(
                'This system is only for Wins won after 1st January 2016'
            )

        # get a date object to compare with user input.
        # because we only ask user for year & month, we use 1st of month
        # to make a date object. for comparison purposes, change current
        # date to 1st of month
        now = datetime.now()
        comparison_date = datetime(now.year, now.month, 1)
        if date < comparison_date - relativedelta(years=1):
            raise forms.ValidationError('Cannot record wins over 1 year old')

        if date > comparison_date:
            raise forms.ValidationError('Invalid date, must be in the past')

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

    def clean(self):
        cleaned = super().clean()

        if not self.completed:
            # have to have checked at least one type of win
            value_types_names = [
                ('type_export', 'Export'),
                ('type_non_export', 'Non-export'),
                ('type_odi', 'Outward Direct Investment'),
            ]
            if not any(cleaned.get(v) for v, n in value_types_names):
                self._errors['types_all'] = self.error_class([
                    """You must choose at least one of Export, Non-export and
                    Outward Direct Investment"""
                ])

            # have to have value for any checkbox you have ticked
            for value_type, value_name in value_types_names:
                if not cleaned.get(value_type):
                    continue
                type_key = value_type[5:]
                value = cleaned.get("total_expected_{}_value".format(type_key))
                if not value:
                    self._errors[value_type] = self.error_class([
                        """If you check {0}, you must enter at least one
                           corresponding {0} value below""".format(value_name)
                    ])

        # If you add an advisor name, you should also select their team
        for i in range(5):
            name_field_name = 'advisor_{}_name'.format(i)
            if not self.cleaned_data[name_field_name]:
                continue

            team_type_field_name = 'advisor_{}_team_type'.format(i)
            team_field_name = 'advisor_{}_hq_team'.format(i)
            msg = """Please choose a team type and a specific team for all
                     named contributing officers"""
            if not self.cleaned_data[team_type_field_name]:
                # attach message to hq team for template simplicity
                self._errors[team_field_name] = self.error_class([msg])
            if not self.cleaned_data[team_field_name]:
                self._errors[team_field_name] = self.error_class([msg])

        # Breakdowns and totals are not editable once a win is marked complete
        # so should only be validated if win is not completed.
        # They should also only be validated if no other errors since they
        # depend on the various value fields not having errors.
        if not self.errors and not self.completed:
            export_value = cleaned.get("total_expected_export_value")
            non_export_value = cleaned.get("total_expected_non_export_value")
            odi_value = cleaned.get("total_expected_odi_value")

            export_breakdowns = [
                cleaned.get("breakdown_exports_{}".format(i))
                for i in range(5)
            ]

            non_export_breakdowns = [
                cleaned.get("breakdown_non_exports_{}".format(i))
                for i in range(5)
            ]

            odi_breakdowns = [
                cleaned.get("breakdown_odi_{}".format(i))
                for i in range(5)
            ]

            if not export_value and not non_export_value and not odi_value:
                raise forms.ValidationError(
                    """Wins must have total expected export, non-export
                        or ODI value of more than £0.
                    """
                )

            if sum(export_breakdowns) != export_value:
                raise forms.ValidationError(
                    "Value of export breakdowns over 5 years must equal total"
                )

            if sum(non_export_breakdowns) != non_export_value:
                raise forms.ValidationError(
                    """Value of non-export breakdowns over 5 years must equal
                       total"""
                )

            if sum(odi_breakdowns) != odi_value:
                raise forms.ValidationError(
                    """Value of ODI breakdowns over 5 years must equal
                       total"""
                )

        return cleaned

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

        field_data = []
        for breakdown_type in ['exports', 'non_exports', 'odi']:
            for i in range(0, 5):
                year = (self.base_year + i)
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
                    max_value=100000000000,
                    label_suffix="",
                )
        return field_data

    def _breakdown_typenum(self, name):
        if name == 'exports':
            return '1'
        elif name == 'non_exports':
            return 2
        elif name == 'odi':
            return 3
        else:
            raise Exception('unexpected breakdown name')

    def _add_breakdown_initial(self, breakdowns):
        """ Add breakdown data to `initial` """

        # make dict in order to know which value matches which field
        self.year_type_to_breakdown = {
            '{}-{}'.format(b['year'], b['type']): b
            for b in breakdowns
        }
        for field_name, year, breakdown_type in self.breakdown_field_data:
            breakdown_typenum = self._breakdown_typenum(breakdown_type)
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
            breakdown_typenum = self._breakdown_typenum(breakdown_type)
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

    def clean(self):
        cleaned = super().clean()

        if (cleaned.get('agree_with_win') is False and
                not cleaned.get('comments')):
            self._errors['comments'] = self.error_class([
                """Please enter a comment explaining why you these details
                   are not correct"""
            ])

    def save(self):

        confirmation = rabbit.push(
            settings.CONFIRMATIONS_AP,
            self.cleaned_data,
            self.request,
        )

        self.send_notifications(confirmation)
