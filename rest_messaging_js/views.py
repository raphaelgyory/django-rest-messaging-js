# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.shortcuts import render
from react.render import render_component
import json
import os


PROJECT_DIR = os.path.dirname(os.path.dirname(__file__))


def react_serverside(request):
    """
    Renders the application on the server side.
    See https://github.com/markfinger/python-react
    """

    rendered = render_component(
        '{0}/example/exampleApp.jsx'.format(PROJECT_DIR),
    )

    return render(request, 'rest_messaging_js/react_serverside.html', {"rendered": rendered})


def log_user_in(request):
    """ Logs the user in if he is unauthenticated. """
    user = request.user
    if not user.is_authenticated():
        user = authenticate(username="John", password="password")
        if user is not None:
            login(request, user)
    return HttpResponse(json.dumps({'id': user.id, 'user': user.username}), content_type='application/json; charset=utf-8')
