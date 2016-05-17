import requests

from hashlib import sha256
from urllib.parse import urlsplit

from django import forms
from django.conf import settings


TYPES_MAP = {
    "string": forms.CharField,
    "email": forms.EmailField,
    "choice": forms.ChoiceField,
    "integer": forms.IntegerField,
    "boolean": forms.BooleanField,
    "date": forms.DateField,
    "datetime": forms.DateTimeField
}


class RabbitException(Exception):
    pass


def rabbit(method, *args, request=None, **kwargs):
    """
    A cleaner way to allow API calls to the data server without having to
    repeat all of the boiler-plate key signing stuff.

    :param method: The HTTP method in lower case: "get", "post", etc.
    :param request: A django request object
    :param args: Passed directly to requests.<method>()
    :param kwargs: Passed directly to requests.<method>()

    :return: A requests response object
    """

    prepared_request = requests.Request(method, *args, **kwargs).prepare()

    if request and request.COOKIES and "alice" in request.COOKIES:
        prepared_request.headers["Authorization"] = "Token {}".format(
            request.COOKIES["alice"]
        )

    path = bytes(urlsplit(args[0]).path, "utf-8")
    salt = bytes(settings.UI_SECRET, "utf-8")

    body = prepared_request.body or b""
    if isinstance(body, str):
        body = bytes(body, "utf-8")

    signature = sha256(path + body + salt).hexdigest()
    prepared_request.headers["X-Signature"] = signature

    response = requests.Session().send(prepared_request)

    if response.status_code == 403:
        raise RabbitException("Data server access is failing for {} requests "
                              "to {}.".format(method, str(path, "utf-8")))

    return response


def get_form_field(spec):
    """
    :param spec: A subset of the result from a /*/schema API call
    :return: A form field
    """

    field = TYPES_MAP[spec["type"]]

    kwargs = {
        "label": spec.get("label"),
        "required": spec.get("required") or False,
        "help_text": spec.get("help_text"),
    }

    if "choices" in spec:
        kwargs["choices"] = [
            [c["value"], c["display_name"]] for c in spec["choices"]]
        if not kwargs["required"]:
            kwargs["choices"].insert(0, ("", ""))

    if spec["type"] == "string":
        if "max_length" in spec:
            kwargs["max_length"] = spec["max_length"]
        else:
            kwargs["widget"] = forms.widgets.Textarea

    return field(**kwargs)
