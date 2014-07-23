from functools import partial
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy

from .views import MockupView
from .resources import resource_factory
from .mockups import load_mockups
from .security import groupfinder


def make_factory(route):
    """Make route resource factory.

    ``route`` argument is a dict with optional ``context`` key in it. If
    ``context`` is defined in ``route`` dict, a factory for ``MockupResource``
    will be returned.

    See ``tradeideas.mockups.views.MockupView.__init__`` docstring for full
    description of ``route`` argument.
    """
    if 'context' in route:
        return partial(resource_factory, route['context'])
    else:
        return None


def make_mockup_routes(config, routes):
    """Dynamically adds views and routes defined in ``routes.json`` mockup.

    See ``tradeideas.mockups.views.MockupView.__init__`` docstring for full
    description of ``routes`` list items.
    """
    for i, route in enumerate(routes):
        route_name = 'route-%d' % i
        config.add_route(
            route_name, route['pattern'], xhr=True,
            factory=make_factory(route),
            request_method=route.get('method'),
        )

        view = route.get('view') or MockupView(route)
        config.add_view(
            view, route_name=route_name,
            permission=route.get('permission'),
            renderer='json'
        )


def includeme(config):
    "Configure ``tradeideas.mockups`` package."

    routes = load_mockups(config.registry.settings, 'routes.json')
    make_mockup_routes(config, routes)

    authn_policy = AuthTktAuthenticationPolicy(
        config.registry.settings['auth_secret'],
        callback=groupfinder,
        hashalg='sha512',
    )
    authz_policy = ACLAuthorizationPolicy()
    config.set_authentication_policy(authn_policy)
    config.set_authorization_policy(authz_policy)
