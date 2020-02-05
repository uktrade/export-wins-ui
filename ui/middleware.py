import sys
from urllib.parse import urlsplit, urlunsplit

from django.http import HttpResponseRedirect
from django.utils.deprecation import MiddlewareMixin


class SSLRedirectMiddleware(MiddlewareMixin):

    def process_request(self, request):
        if not request.is_secure():
            if "runserver" not in sys.argv and "test" not in sys.argv:
                return HttpResponseRedirect(urlunsplit(
                    ["https"] + list(urlsplit(request.get_raw_uri())[1:])))
