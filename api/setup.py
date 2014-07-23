import codecs

from os import path
from setuptools import setup, find_packages

here = path.abspath(path.dirname(__file__))

with codecs.open(path.join(here, 'README.rst'), encoding='utf-8') as f:
    README = f.read()

with codecs.open(path.join(here, 'CHANGES.rst'), encoding='utf-8') as f:
    CHANGES = f.read()

setup(
    name='tradeideas',
    version='0.1',
    description='tradeideas',
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
    ],
    author='POV',
    author_email='info@pov.lt',
    url='https://bitbucket.org/glgpartners/glgpartners.net',
    keywords='api',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    test_suite='tradeideas',
    install_requires=[
        'pyramid',
        'waitress',
        'pathlib',
        'WebTest',
        'jsonschema',
    ],
    entry_points={
        'paste.app_factory': [
            'main = tradeideas:main',
        ],
    },
)
