VENV_VERSION = 1.11.6
PYTHON_VERSION = 2.7


all: bin/py.test

test: bin/py.test
	bin/flake8 --doctests tradeideas
	bin/py.test --doctest-modules tradeideas

run: bin/py.test
	bin/pserve --reload development.ini

bin/py.test: buildout.cfg versions.cfg setup.py bin/buildout
	bin/buildout
	touch -c $@

bin/buildout: bin/python
	bin/python bootstrap.py --version=2.2.1

bin/python: parts/virtualenv-$(VENV_VERSION)
	cd parts/virtualenv-$(VENV_VERSION) && python$(PYTHON_VERSION) virtualenv.py ../..

parts/virtualenv-$(VENV_VERSION): parts/virtualenv-$(VENV_VERSION).tar.gz
	cd parts && tar -xzf virtualenv-$(VENV_VERSION).tar.gz

parts/virtualenv-$(VENV_VERSION).tar.gz:
	mkdir -p parts
	wget https://pypi.python.org/packages/source/v/virtualenv/virtualenv-$(VENV_VERSION).tar.gz -O $@


.PHONY: all test run
