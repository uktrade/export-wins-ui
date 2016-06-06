from unittest.mock import patch, Mock

from django.test import Client, TestCase
from django.core.urlresolvers import reverse


class LoginTest(TestCase):

    def setUp(self):
        self.client = Client()
        self.login_url = reverse('login')

    def test_login_page(self):
        response = self.client.get(self.login_url)
        self.assertContains(response, 'Email')
        self.assertContains(response, 'Password')

    def _login(self, url=None):
        if not url:
            url = self.login_url
        return self.client.post(
            url,
            {
                'email': 'email@example.com',
                'password': 'password',
            },
            follow=True,
        )

    @patch('users.backends.rabbit.post')
    def test_login_post_invalid_credentials(self, mock_rabbit_post):
        mock_rabbit_post.return_value = Mock(
            status_code=400,
            json=Mock(return_value={'non_field_errors': ['Unable to log in']}),
        )
        response = self._login()
        self.assertContains(response, 'Unable to log in')

    @patch('users.backends.rabbit.post')
    def test_login_post_valid_credentials(self, mock_rabbit_post):
        mock_rabbit_post.return_value = Mock(
            status_code=200,
            json=Mock(return_value={'token': 'lol does not matter'}),
        )
        response = self._login()
        self.assertRedirects(response, '/')
        self.assertContains(response, 'Record a New Export Win')

    @patch('users.backends.rabbit.post')
    def test_login_post_valid_credentials_bad_redirect(self, mock_rabbit_post):
        mock_rabbit_post.return_value = Mock(
            status_code=200,
            json=Mock(return_value={'token': 'lol does not matter'}),
        )
        response = self._login(self.login_url + '?next=http://example.com')
        self.assertRedirects(response, '/')
        self.assertContains(response, 'Record a New Export Win')

    @patch('users.backends.rabbit.post')
    def test_login_bad_rabbit_no_json(self, mock_rabbit_post):
        mock_rabbit_post.return_value = Mock(
            status_code=500,
            json=Mock(return_value={}),
        )
        response = self._login()
        self.assertContains(response, 'Invalid login.  Please try again.')

    @patch('users.backends.rabbit.post')
    def test_login_bad_rabbit_no_return(self, mock_rabbit_post):
        mock_rabbit_post.return_value = Mock(status_code=500)
        with self.assertRaises(Exception):
            response = self._login()
