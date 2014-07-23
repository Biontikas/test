import json

from pathlib import Path


def load_mockups(settings, mockup):
    """Returns python object decoded from JSON mockup.

    ``mockup`` is a relative path to JSON mockup file. Relative path is
    resolved from given ``settings`` argument, by looking for ``mockups_path``
    setting. ``mockups_path`` should be specified in ``development.ini`` or
    ``production.ini`` configuration files.
    """
    path = settings.get('mockups_path')
    path = Path(path) / mockup
    with path.open('rb') as f:
        return json.load(f)
