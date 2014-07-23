import jsonschema

from .mockups import load_mockups


def validate(request, data, schema):
    """Validate ``data`` against given ``schema`` name.

    By given ``schema`` name, actual schema will be fetched from
    ``schemas.json`` mockup file.
    """
    data = dict(data)
    schemas = load_mockups(request.registry.settings, 'schemas.json')
    jsonschema.validate(data, schemas[schema])
