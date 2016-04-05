# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals
from django.conf.urls import include, url

urlpatterns = [
    url(r'^messaging/js/', include('rest_messaging_js.urls', namespace='rest_messaging_js')),
    url(r'^messaging/', include('rest_messaging.urls', namespace='rest_messaging')),
    url(r'^messaging/centrifugo/', include('rest_messaging_centrifugo.urls', namespace='rest_messaging_centrifugo')),
]
