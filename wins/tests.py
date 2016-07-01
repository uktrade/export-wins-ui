import datetime
from unittest.mock import MagicMock, Mock, patch

from django.core.urlresolvers import reverse
from django.test import TestCase
from django.utils import timezone


class ConfirmationFormTest(TestCase):

    def setUp(self):
        # win =
        pass

    @patch('wins.views.rabbit.get')
    def test_fails_with_bad_win_pk(self, mock_rabbit_get):
        mock_rabbit_get.return_value = Mock(status_code=400)
        resp = self.client.get(reverse('responses', kwargs={'pk': 'fake-pk'}))
        self.assertNotContains(resp, "Please review this information")
        self.assertContains(resp, "Sorry, this record is not available")

    @patch('wins.views.rabbit.get')
    def test_fails_with_old_win(self, mock_rabbit_get):
        created_dt = timezone.now() - datetime.timedelta(days=31)
        mock_rabbit_get.return_value = MagicMock(
            status_code=200,
            json=Mock(return_value={'created': str(created_dt)}),
        )
        resp = self.client.get(reverse('responses', kwargs={'pk': 'fake-pk'}))
        self.assertNotContains(resp, "Please review this information")
        self.assertContains(resp, "Sorry, this record is no longer available")

    @patch('wins.views.rabbit.get')
    def test_fails_with_confirmed_win(self, mock_rabbit_get):
        created_dt = timezone.now()
        # bit hacky - using same mock for win & confirmation
        mock_rabbit_get.return_value = MagicMock(
            status_code=200,
            json=Mock(return_value={
                        'created': str(created_dt),
                        'id': 'fake-pk',
                        'count': 1,
                        }
                ),
        )
        resp = self.client.get(reverse('responses', kwargs={'pk': 'fake-pk'}))
        self.assertNotContains(resp, "Please review this information")
        self.assertContains(resp, "Sorry, this confirmation was already completed.")

    # @patch('wins.views.rabbit.get')
    # def test_form_shown_unconfirmed_win(self, mock_rabbit_get):
    #     created_dt = timezone.now()
    #     # bit hacky - using same mock for win, confirmation and schema
    #     mock_rabbit_get.return_value = MagicMock(
    #         status_code=200,
    #         json=Mock(return_value={
    #                     'created': str(created_dt),
    #                     'id': 'fake-pk',
    #                     'count': 0,
    #                     }
    #             ),
    #     )
    #     resp = self.client.get(reverse('responses', kwargs={'pk': 'fake-pk'}))
    #     self.assertNotContains(resp, "Sorry, this record")
    #     self.assertContains(resp, "Below is a summary of your recent Export Win")