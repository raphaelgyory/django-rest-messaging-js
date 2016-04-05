#!/usr/bin/env python
import os
import subprocess
import sys

"""
Creates an empty database.
"""

from django.core.management import execute_from_command_line
from tests.conftest import pytest_configure
pytest_configure()
from django.conf import settings
print "WEBPACK_LOADER", settings.WEBPACK_LOADER
execute_from_command_line(['django-admin', 'migrate'])