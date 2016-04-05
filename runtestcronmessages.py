#!/usr/bin/env python
import os
import subprocess
import sys

"""
Creates a database with fixtures and launches a local server.
"""

if __name__ == "__main__":
    
    from django.core.management import execute_from_command_line
    from tests.conftest import pytest_configure
    pytest_configure(database_name='runtestapplication.db')  # we use the same settings than in the unit tests
    from django.conf import settings

    # we ensure the user is running "python migrations.py makemigrations rest_messaging"
    if all(arg in ['runtestcronmessages.py'] for arg in sys.argv[:1]):
        # we start messaging cron jobs, to ensure the messages are pushed in real time
        execute_from_command_line(['django-admin', 'runcrons', 'tests.cron_messages.CronMessages'])
    else:
        raise Exception('Error: could not launch test server.')