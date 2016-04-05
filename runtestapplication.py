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
    # we use the same settings than in the unit tests
    # except for the js file
    database_name = 'runtestapplication.db'
    pytest_configure(database_name=database_name)
    # now we load the settings
    from django.conf import settings
    # we ensure the user is running "python migrations.py makemigrations rest_messaging"
    if all(arg in ['runtestapplication.py'] for arg in sys.argv[:1]):
        # execute the following command if you want to remove the old database
        # execute_from_command_line(['django-admin', 'flush'])
        # we make the migrations
        execute_from_command_line(['django-admin', 'migrate'])
        # to create a fixture.json file, run the command on next line
        # execute_from_command_line(['django-admin', 'dumpdata', '-o', 'fixtures.json', '--exclude', 'contenttypes', '--exclude', 'auth.Permission'])
        # we load the fixtures
        execute_from_command_line(['django-admin', 'loaddata', 'fixtures.json'])
        # we start centrifugo
        try:
            # we launch centrifugo if not done yet
            subprocess.Popen(["centrifugo --config=tests/config.json --port={0} --debug=false".format(getattr(settings, "CENTRIFUGO_PORT", 8802))], stdout=subprocess.PIPE,
                                          shell=True, preexec_fn=os.setsid)
            # we lauch the node server
            # subprocess.Popen(["node ./django-rest-messaging-js/javascript_server.js"], stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid)
        except Exception as e:
            pass
            
        try:
            import atexit
            import os
            import signal
            # we launch a node server 
            node_server = subprocess.Popen(["cd example && node server.js {0}".format(getattr(settings, "REACT_RENDER_URL", 9009))], stdout=subprocess.PIPE,
                                          shell=True, preexec_fn=os.setsid)
            # and kill it on termination
            atexit.register(lambda: os.killpg(node_server.pid, signal.SIGTERM))
        except Exception as e:
            pass
        # we run the test server
        execute_from_command_line(['django-admin', 'runserver'])
    else:
        raise Exception('Error: could not launch test server.')
