#!/usr/bin/env python
"""
Configure project environments.

This script creates `buildout.cfg` file extending specified environment.

Currently active environment name is written to cfg/env file.

"""

import sys
import argparse

from glob import glob
from os import path


def write(filename, content):
    with open(filename, 'w') as f:
        f.write(content)


def get_buildout_cfg(env_path):
    "Return buildout.cfg file content."
    return """\
###
# zc.buildout configuration
# https://pypi.python.org/pypi/zc.buildout/2.2.1
###

# This configuration file intentionally is not under version control. This is
# your local buildout configuration file. If you want to add global changes, do
# it in `cfg/` configuration files.

[buildout]
extends = {env_path}
""".format(env_path=env_path)


def get_environments():
    "Discover available environments."
    paths = glob('cfg/*/buildout.cfg')
    environments = [path.basename(path.dirname(p)) for p in paths]
    return dict(zip(environments, paths))


def main():
    envs = get_environments()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('env', choices=envs.keys(), help='Environment name.')
    parser.add_argument('-f', '--overwrite',
        action='store_true', default=False,
        help='overwrite buildout.cfg even if it already exists'
    )
    args = parser.parse_args()

    if not args.overwrite and path.exists('buildout.cfg'):
        print 'Environment is already configured.'
        sys.exit(1)
    else:
        write('buildout.cfg', get_buildout_cfg(envs[args.env]))
        write('cfg/env', '%s\n' % args.env)

        print 'Environment "%s" successfully configured.' % args.env
        print 'Run `make` to build project with this configuration.'


if __name__ == '__main__':
    main()
