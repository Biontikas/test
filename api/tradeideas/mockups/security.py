from .mockups import load_mockups


def groupfinder(userid, request):
    """Returns user groups specified in users.json mockup."""
    users = load_mockups(request.registry.settings, 'users.json')
    if userid in users:
        return users[userid].get('groups', [])
