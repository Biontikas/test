from collections import Hashable

from pyramid.security import Allow
from pyramid.security import Deny
from pyramid.security import Everyone
from pyramid.security import Authenticated
from pyramid.security import ALL_PERMISSIONS

from .mockups import load_mockups


class MockupResource(object):
    """Dynamic resource class.

    This class is initialized using ``resource_factory`` helper function.
    """
    def __init__(self, acl):
        self.__acl__ = acl


def decode_acl(acl):
    """Convert JSON ACL to Pyramid's ACL.

    This function takes ACL list, probable defined in ``permissions.json``
    file, and returns same list adjusted to look like Pyramid's ACL.

    Also see ``tradeideas.mockups.tests.test_resources.DecodeAclTests``.
    """
    actions = {'allow': Allow, 'deny': Deny}
    principals = {'everyone': Everyone, 'authenticated': Authenticated}
    permissions = {'all': ALL_PERMISSIONS}

    for action, principal, permission in acl:
        action = actions[action]
        principal = principals.get(principal, principal)
        if isinstance(permission, Hashable) and permission in permissions:
            permission = permissions[permission]
        else:
            if isinstance(permission, list):
                permission = tuple(permission)
        yield action, principal, permission


def resource_factory(name, request):
    """Helper function to initialize ``MockupResource``.

    ``name`` argument specifies context name from ``permissions.json`` file.
    Using ACL assigned to context name, ``MockupResource`` class is initialized
    and returned.

    ``request`` is used just for ``request.registry.settings`` to get
    ``mockups_path``.
    """
    permissions = load_mockups(request.registry.settings, 'permissions.json')
    acl = permissions[name]
    acl = list(decode_acl(acl))
    return MockupResource(acl)
