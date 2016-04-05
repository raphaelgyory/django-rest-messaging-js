# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.utils.timezone import now, timedelta
from rest_framework.test import APIClient, APIRequestFactory
from rest_messaging.models import Message, NotificationCheck, Participant, Participation, Thread
import random


def populate(request):
    password = "password"
    user = User(username="John")
    user.set_password(password)
    user.save()
    request_authenticated = APIRequestFactory()
    request_authenticated.user = user
    participant1 = Participant.objects.create(id=user.id)
    client_authenticated = APIClient()
    client_authenticated.login(username=user.username, password=password)
    client_unauthenticated = APIClient()
    # we create participants
    user2 = User(username="Steve")
    user2.set_password(password)
    user2.save()
    user3 = User(username="Marc")
    user3.set_password(password)
    user3.save()
    user4 = User(username="Ada")
    user4.set_password(password)
    user4.save()
    user5 = User(username="Pepito")
    user5.set_password(password)
    user5.save()
    user6 = User(username="Pedro")
    user6.set_password(password)
    user6.save()
    participant2 = Participant.objects.create(id=user2.id)
    participant3 = Participant.objects.create(id=user3.id)
    # we create a thread where all users are in
    thread1 = Thread.objects.create(name="All in!")
    participation1 = Participation.objects.create(participant=participant1, thread=thread1)
    participation2 = Participation.objects.create(participant=participant2, thread=thread1)
    participation3 = Participation.objects.create(participant=participant3, thread=thread1)
    # we create a thread where all users where in but one has left
    thread2 = Thread.objects.create(name="One has left")
    Participation.objects.create(participant=participant1, thread=thread2)
    Participation.objects.create(participant=participant2, thread=thread2)
    Participation.objects.create(participant=participant3, thread=thread2, date_left=now())
    # we create a thread where all only two users are in
    thread3 = Thread.objects.create(name="Two only are in")
    p1 = Participation.objects.create(participant=participant1, thread=thread3)
    p2 = Participation.objects.create(participant=participant3, thread=thread3)
    # we create a parasiting thread with people unrelated, to ensure it does not modify the counts
    participant4 = Participant.objects.create(id=4)
    participant5 = Participant.objects.create(id=5)
    participant6 = Participant.objects.create(id=6)
    thread_unrelated = Thread.objects.create(name="Unrelated")
    Participation.objects.create(participant=participant4, thread=thread_unrelated)
    Participation.objects.create(participant=participant5, thread=thread_unrelated)
    Participation.objects.create(participant=participant6, thread=thread_unrelated)
    # we map the users and the participants
    dct = dict()
    for u in User.objects.all():
        for p in Participant.objects.all():
            if u.id == p.id:
                dct[p.id] = u
    # 1 message for thread 1, 2 for thread 2, etc.
    # we create messages for each conversation
    messages = []
    for thread in Thread.objects.all():
        participants = [participation.participant for participation in Participation.objects.filter(thread=thread)]
        for i in range(0, 150):
            participant = random.choice(participants)
            messages.append(Message(sender=participant, thread=thread, body="Message by participant {0} in thread {1}".format(dct[participant.id].username, thread.id)))
    Message.objects.bulk_create(messages)
    # a notification check
    # participant 1 has checked his notifications one day ago
    NotificationCheck.objects.create(participant=participant1, date_check=now() - timedelta(days=1))
    # we mark some threads as read
    # participant 3 has read the 2 last messages, 1 only the first
    p2.date_last_check = now() - timedelta(days=1)
    p2.save()
    p1.date_last_check = now() - timedelta(days=2)
    p1.save()
