import datetime

from django.conf import settings
from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import render
from django.views.generic import TemplateView, View

from alice.braces import LoginRequiredMixin
from alice.helpers import rabbit


class CSVView(LoginRequiredMixin, View):
    """ Get Zip of CSVs of current data from Data server """

    def get(self, request):
        data_response = rabbit.get(settings.CSV_AP, request=request)
        today_date = datetime.datetime.utcnow().strftime('%Y-%m-%d')
        filename = 'ew-data-{}.zip'.format(today_date)
        resp = HttpResponse(data_response, content_type='application/zip')
        resp['Content-Disposition'] = 'attachment; filename=' + filename
        return resp


class StaffRequiredMixin(object):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return HttpResponseForbidden()
        return super().dispatch(request, *args, **kwargs)


class BaseAdminView(LoginRequiredMixin, StaffRequiredMixin, TemplateView):

    def _admin_post(self):
        """ POST an admin change and handle result """

        result = rabbit.post(
            self.endpoint,
            request=self.request,
            data=self.request.POST,
        )
        if result.status_code == 500:
            return {
                'error': "Server error, please try again or contact support"
            }
        elif result.status_code != 201:
            error_data = result.json()
            return {'error': error_data['error']}
        else:
            return {'success': True}

    def post(self, *args, **kwargs):
        self.context = self.request.POST.dict()
        result = self._admin_post()
        self.context.update(result)
        return render(self.request, self.template_name, self.context)


class AdminView(BaseAdminView):
    template_name = 'ui/admin-index.html'


class AddUserView(BaseAdminView):
    """ Enter an email address, adds the user and sends them password email """

    endpoint = settings.ADD_USER_AP
    template_name = 'ui/admin-add-user.html'


class NewPassView(BaseAdminView):
    """ Enter an email address, sends them new password email """

    endpoint = settings.NEW_PASSWORD_AP
    template_name = 'ui/admin-new-password.html'


class SendCustomerEmailView(BaseAdminView):
    """ Enter Win ID, send email to customer and officer """

    endpoint = settings.SEND_CUSTOMER_EMAIL_AP
    template_name = 'ui/admin-send-customer-email.html'


class ChangeCustomerEmailView(BaseAdminView):
    """ Enter Win ID & email address, change's customer address & emails """

    endpoint = settings.CHANGE_CUSTOMER_EMAIL_AP
    template_name = 'ui/admin-change-customer-email.html'
