# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals
from django.conf.urls import url
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^django-rest-messaging-demo-production/$', 'rest_messaging_js.views.react_serverside', name='django_production'),
    url(r'^django-rest-messaging-demo-development/$', TemplateView.as_view(template_name='rest_messaging_js/django_local_webpack.html'), name='django_local_webpack'),
    url(r'^django-rest-messaging-demo-login/$', 'rest_messaging_js.views.log_user_in', name='django_local_webpack_login')
]
