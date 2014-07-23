def exclude(old, keys):
    """Exclude some keys from given dict.

    >>> exclude({'a': 1, 'b': 1}, {'a'})
    {'b': 1}

    """
    new = {}
    for k, v in old.items():
        if k not in keys:
            new[k] = v
    return new
