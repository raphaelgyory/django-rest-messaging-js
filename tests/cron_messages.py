# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals
from django.contrib.auth.models import User
from django.test.client import RequestFactory
from django.utils.timezone import now
from rest_messaging.models import Message, Participant, Participation, Thread
from django_cron import CronJobBase, Schedule
import random
import time


class CronMessages(CronJobBase):
    """
    Sends a few messages every minute when launched
    """
    RUN_EVERY_MINS = 1

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'tests.cron_messages'

    def do(self):
        """ We write """
        # we get all the threads involving user 1
        participant1 = Participant.objects.get(id=1)
        request = RequestFactory()
        count = 0
        # we map the users and the participants
        dct = dict()
        for u in User.objects.all():
            for p in Participant.objects.all():
                if u.id == p.id:
                    dct[p.id] = u
        # we send a random number of messages in random selected threads
        # we never stop the loop as long as the server runs
        # at the beginning, we want to create threads to to ensure the channel works
        while True:
            threads = [participation.thread for participation in Participation.objects.filter(participant=participant1)]
            # we want the participants not yet connected, to create new threads
            participants_connected = []
            for thread in threads:
                participants_in_thread = [p.participant for p in Participation.objects.filter(thread=thread).exclude(participant=participant1)]
                for participant in participants_in_thread:
                    participants_connected.append(participant)
            participants_connected = list(set(participants_connected))
            participants_not_connected = Participant.objects.exclude(id__in=[p.id for p in participants_connected]).exclude(id=participant1.id)
            participants_not_connected = list(set(participants_not_connected))
            if count < len(participants_not_connected):
                for participant in participants_not_connected:
                    # we say the participant create the thread
                    # we need to present him as the request user
                    request.rest_messaging_participant = participant
                    thread = Thread.managers.get_or_create_thread(request, None, participant1.id)
                    body = "New Thread created! Message sent by {0} in thread {1} via cron on {2}".format(dct[participant.id].username, thread.id, now())
                    Message.objects.create(sender=participant, thread=thread, body=body)
                    print(body)
                    count += 1
                    time.sleep(random.randint(10, 60))  # ensures all the messages cannot be fetched at once using json
            else:
                random_thread = random.choice(threads)
                # we get a radom participant in the thread
                random_participant = random.choice(random_thread.participants.exclude(id=participant1.id))
                body = "Message sent by {0} in thread {1} via cron on {2}".format(dct[random_participant.id].username, random_thread.id, now())
                Message.objects.create(sender=random_participant, thread=random_thread, body=body)
                print(body)
                time.sleep(random.randint(10, 60))  # ensures all the messages cannot be fetched at once using json
