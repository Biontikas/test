import unittest

from pyramid.security import Allow
from pyramid.security import Deny
from pyramid.security import Everyone
from pyramid.security import ALL_PERMISSIONS

from tradeideas.mockups.resources import decode_acl


class DecodeAclTests(unittest.TestCase):
    def test_decode_acl(self):
        acl = [
            ['allow', 'analytics', 'add'],
            ['deny', 'everyone', 'all'],
        ]
        acl = list(decode_acl(acl))
        self.assertEqual(acl, [
            (Allow, 'analytics', 'add'),
            (Deny, Everyone, ALL_PERMISSIONS),
        ])
