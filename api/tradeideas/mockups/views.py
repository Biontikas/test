from pyramid.view import forbidden_view_config
from pyramid.security import remember
from pyramid.security import forget

from jsonschema import ValidationError

from tradeideas.helpers.dictshape import exclude

from .mockups import load_mockups
from .schemas import validate


class MockupView(object):
    """Dynamic mockup view."""

    def __init__(self, route):
        """Create new dynamic mockup view.

        ``route`` argument is a dict consisting of these possible keys:

        ``pattern``
            URL route patter as described here:

            http://docs.pylonsproject.org/projects/pyramid/en/1.5-branch/narr/urldispatch.html#route-pattern-syntax

        ``context``
            View context name, from ``permissions.json`` file. Context is
            mainly used for permissions.

        ``permission``
            View permission, from ``permissions.json`` file.

        ``mockup``
            Path to JSON file. Content of this file will be returned as
            response for this view.

        ``method``
            HTTP method. This property can be used to restrict defined route
            only to specified HTTP method. If not specified, all HTTP methods
            will be accepted.

        ``view``
            Dotted python path to view callable. This parameter allows to
            specify real view, instead of a mockup. If ``view`` is specified,
            ``mockup`` parameter will be ignored.

        ``validate``
            Dict with keys specifying request data type (GET, POST or items)
            and values specifying schema name. Schema by name is fetched from
            ``schemas.json`` file.

            Example: {"validate": {"POST": "login"}}

        """
        self.route = route

    def __call__(self, context, request):
        self.validate(request)
        return self.get_response(request)

    def validate(self, request):
        """Validates request data by specified schema.

        Schema for validation comes from ``schemas.json`` file.
        """
        for method, schema in self.route.get('validate', {}).items():
            assert method in ('GET', 'POST', 'params')
            try:
                validate(request, getattr(request, method), schema)
            except ValidationError as e:
                request.response.status_code = 400
                return {'message': e.message}

    def get_response(self, request):
        """Returns mockup data as response for givin request.

        If route['mockup'] is string, relative mockup file path is assumed, and
        content of this file is fetched as response. If route['mockup'] is not
        string, route['mockup'] value will be returned as is.
        """
        if isinstance(self.route['mockup'], basestring):
            mockup = self.route['mockup']
            data = load_mockups(request.registry.settings, mockup)
            return data['d']
        else:
            return self.route['mockup']


def login(request):
    """Simple login view based on ``users.json`` mockup data."""

    try:
        validate(request, request.POST, 'login')
    except ValidationError as e:
        request.response.status_code = 400
        return {'message': e.message}

    users = load_mockups(request.registry.settings, 'users.json')
    username = request.POST['username']

    if username not in users:
        request.response.status_code = 401
        return {'message': 'User "%s" not found.' % username}

    user = users[username]
    password = request.POST['password']

    if user['password'] != password:
        request.response.status_code = 401
        return {'message': 'Incorrect password for "%s".' % username}

    headers = remember(request, username)
    request.response.headers.extend(headers)
    return exclude(user, {'password'})


def logout(request):
    headers = forget(request)
    request.response.headers.extend(headers)
    return {}


@forbidden_view_config(renderer='json')
def forbidden(request):
    request.response.status_code = 403
    return {'message': 'Forbidden.'}
