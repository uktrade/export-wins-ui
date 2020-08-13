import datetime

import responses
from django.test import Client, TestCase
from django.urls import reverse
from django.utils import timezone


class MiddlewareTest(TestCase):
    def setUp(self):
        self.client = Client()

    @responses.activate
    def test_cache_control_middleware(self):
        responses.add(
            method=responses.GET,
            url='http://127.0.0.1:8000/limited-wins/123456789012345678901234567890123456/',
            json={'created': str(timezone.now() - datetime.timedelta(weeks=53))},
            status=200,
            content_type='application/json',
        )

        response = self.client.get(reverse('responses', kwargs={'win_id': '123456789012345678901234567890123456'}))
        assert response['Pragma'] == 'no-cache'
        assert response['Cache-Control'] == 'max-age=0, no-cache, no-store, must-revalidate, private'
