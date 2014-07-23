import unittest

from pathlib import Path
from webtest import TestApp


class MockupsTests(unittest.TestCase):
    def setUp(self):
        from tradeideas import main

        path = Path(__file__).parent / 'fixtures'
        app = main({}, mockups_path=str(path), auth_secret='secret')
        self.app = TestApp(app)

    def test_root(self):
        resp = self.app.get('/data/1', xhr=True)
        self.assertEqual(resp.json, {"status": "ok"})

    def test_login(self):
        data = {'username': 'admin', 'password': 'admin'}
        resp = self.app.post('/login', data, xhr=True)
        self.assertEqual(resp.json, {
            "username": "admin",
            'groups': ['originators'],
        })

    def test_forbidden(self):
        data = {'username': 'user', 'password': 'pass'}
        resp = self.app.post('/users/create', data, xhr=True,
                             expect_errors=True)
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.json, {'message': 'Forbidden.'})

    def test_login_logout(self):
        # Login
        data = {'username': 'admin', 'password': 'admin'}
        resp = self.app.post('/login', data, xhr=True)

        # Call
        data = {'username': 'user', 'password': 'pass'}
        resp = self.app.post('/users/create', data, xhr=True)
        self.assertEqual(resp.json, {
            'username': 'user',
            'groups': ['analytics'],
        })

        # Logout
        resp = self.app.post('/logout', data, xhr=True)

        # Call
        data = {'username': 'user', 'password': 'pass'}
        resp = self.app.post('/users/create', data, xhr=True,
                             expect_errors=True)
        self.assertEqual(resp.status_code, 403)
        self.assertEqual(resp.json, {'message': 'Forbidden.'})

    def test_schema(self):
        data = {}
        resp = self.app.post('/login', data, xhr=True, expect_errors=True)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json, {
            'message': 'u\'username\' is a required property'
        })

    def test_schema_extra_params(self):
        data = {'username': 'user', 'password': 'pass', 'foo': 'bar'}
        resp = self.app.post('/login', data, xhr=True, expect_errors=True)
        self.assertEqual(resp.status_code, 400)
        self.assertEqual(resp.json, {
            'message': (
                'Additional properties are not allowed (\'foo\' was '
                'unexpected)'
            )
        })
