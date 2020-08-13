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


class CacheControlMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        response['Pragma'] = 'no-cache'
        response['Cache-Control'] = 'max-age=0, no-cache, no-store, must-revalidate, private'
        return response
