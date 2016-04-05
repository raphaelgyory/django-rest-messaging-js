# coding=utf8
# -*- coding: utf8 -*-
# vim: set fileencoding=utf8 :

from __future__ import unicode_literals

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.core.urlresolvers import reverse
from django.test.client import RequestFactory
from django.test.utils import override_settings
from selenium.webdriver.firefox.webdriver import WebDriver
from rest_messaging.models import Message, NotificationCheck, Participant, Participation, Thread
from pyvirtualdisplay import Display

import os
import signal
import subprocess
import time


class IntegrationTests(StaticLiveServerTestCase):

    fixtures = ['fixtures.json']

    @classmethod
    def setUpClass(cls):
        super(IntegrationTests, cls).setUpClass()
        # we do not display
        cls.display = Display(visible=0, size=(1024, 768))
        cls.display.start()
        cls.selenium = WebDriver()
        # we launch centrifugo
        cls.centrifugo = subprocess.Popen(["centrifugo --config=tests/config.json --port={0}".format(getattr(settings, "CENTRIFUGO_PORT", 8802))], stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid)
        # we launch a node server
        cls.node_server = subprocess.Popen(["cd example && node server.js {0}".format(getattr(settings, "REACT_RENDER_URL", 9009))], stdout=subprocess.PIPE, shell=True, preexec_fn=os.setsid)
        # we create a fake request
        cls.user = User.objects.create(id=1)
        cls.request = RequestFactory()

    @classmethod
    def tearDownClass(cls):
        cls.selenium.close()
        cls.selenium.quit()
        cls.display.stop()
        # we stop centrifugo
        # sudo kill `sudo lsof -t -i:xxxx`
        os.killpg(cls.centrifugo.pid, signal.SIGTERM)
        os.killpg(cls.node_server.pid, signal.SIGTERM)
        super(IntegrationTests, cls).tearDownClass()

    def integration(self, url):
        # for now, the user is anonymous and should see no message
        self.selenium.get(self.live_server_url + reverse(url))
        time.sleep(10)
        message_form_u = self.selenium.find_elements_by_class_name("messagesMessagesFormUnactivated")
        message_list_u = self.selenium.find_elements_by_class_name("messagesMessagesListUnauthenticated")
        message_load_more_u = self.selenium.find_elements_by_class_name("messagesLoadMoreUnactivated")
        thread_form_u = self.selenium.find_elements_by_class_name("messagesThreadsFormUnauthenticated")
        thread_list_u = self.selenium.find_elements_by_class_name("messagesThreadsListUnauthenticated")
        thread_load_more_u = self.selenium.find_elements_by_class_name("threadsLoadMoreUnactivated")
        thread_create_u = self.selenium.find_elements_by_class_name("threadsCreateUnactivated")
        notification_counter_u = self.selenium.find_elements_by_class_name("notificationsUnactivated")
        self.assertEqual(1, len(message_form_u))
        self.assertEqual(1, len(message_list_u))
        self.assertEqual(1, len(message_load_more_u))
        self.assertEqual(1, len(thread_form_u))
        self.assertEqual(2, len(thread_list_u))
        self.assertEqual(1, len(thread_load_more_u))
        self.assertEqual(1, len(thread_create_u))
        self.assertEqual(1, len(notification_counter_u))
        # we log the user in
        # we have a dummy login button
        self.selenium.execute_script("document.querySelectorAll('.dummyLogin')[0].click()")
        time.sleep(2)
        message_form_u = self.selenium.find_elements_by_class_name("messagesMessagesFormUnactivated")
        message_list_u = self.selenium.find_elements_by_class_name("messagesMessagesListUnauthenticated")
        message_load_more_u = self.selenium.find_elements_by_class_name("messagesLoadMoreUnactivated")
        thread_form_u = self.selenium.find_elements_by_class_name("messagesThreadsFormUnauthenticated")
        thread_list_u = self.selenium.find_elements_by_class_name("messagesThreadsListUnauthenticated")
        thread_load_more_u = self.selenium.find_elements_by_class_name("threadsLoadMoreUnactivated")
        thread_create_u = self.selenium.find_elements_by_class_name("threadsCreateUnactivated")
        notification_counter_u = self.selenium.find_elements_by_class_name("notificationsUnactivated")
        # some element are still not displayed because they require more than just loggin in
        self.assertEqual(1, len(message_form_u))
        self.assertEqual(0, len(message_list_u))
        self.assertEqual(1, len(message_load_more_u))
        self.assertEqual(0, len(thread_form_u))
        self.assertEqual(0, len(thread_list_u))
        self.assertEqual(0, len(thread_load_more_u))
        self.assertEqual(0, len(thread_create_u))
        self.assertEqual(0, len(notification_counter_u))
        # we must see the thread list, the create thread link and the notifications counter
        thread_list = self.selenium.find_elements_by_class_name("messagesThreadsList")
        thread_create = self.selenium.find_elements_by_class_name("threadsCreate")
        thread_load_more = self.selenium.find_elements_by_class_name("messagesThreadsLoadMore")
        notification_counter = self.selenium.find_elements_by_class_name("notificationCounter")
        self.assertEqual(2, len(thread_list))  # one time in the right column and one time in the notifications
        self.assertEqual(1, len(thread_create))
        self.assertEqual(1, len(thread_load_more))
        self.assertEqual(1, len(notification_counter))
        # we load the additional thread
        self.assertEqual(2 * 2, len(self.selenium.find_elements_by_class_name("threadListLayout")))
        self.selenium.execute_script("document.querySelectorAll('.messagesThreadsLoadMore')[0].click()")
        time.sleep(2)
        self.assertEqual(3 * 2, len(self.selenium.find_elements_by_class_name("threadListLayout")))
        # we click on a thread
        # this should display the list of messages in contains
        # we first count the unread threads (the count will be updated)
        time.sleep(2)
        unreads = self.selenium.find_elements_by_class_name("threadIsUnread")
        count_unreads = len(unreads)
        self.assertTrue(0 < count_unreads)
        # we click on the first unread message
        self.selenium.execute_script("document.querySelectorAll('div.threadIsUnread')[0].click()")
        time.sleep(2)
        # we have two unread message less (one time in the navbar, one time in the sidebar)
        self.assertEqual(count_unreads - 2, len(self.selenium.find_elements_by_class_name("threadIsUnread")))
        # messages are displayed
        message_list = self.selenium.find_elements_by_class_name("messagesMessagesList")
        self.assertEqual(1, len(message_list))
        # by 30 units or by DJANGO_REST_MESSAGING_MESSAGES_PAGE_SIZE
        # here we limit to 2 for testing purpose
        messages_units = self.selenium.find_elements_by_class_name("messageList")
        self.assertEqual(2, len(messages_units))
        # we add a message
        hello = "hello"
        self.selenium.find_elements_by_class_name('messageFormInput')[0].send_keys(hello)
        # we count the notifications before posting
        notifications_count = int(self.selenium.find_elements_by_class_name('notificationCounterPositiveCount')[0].get_attribute('innerHTML'))
        # we post it
        count_messages = Message.objects.all().count()
        self.selenium.execute_script("document.querySelectorAll('.messageFormSubmit')[0].click()")
        time.sleep(2)
        # it must be on the screen
        self.assertEqual(count_messages + 1, Message.objects.all().count())
        messages_units = self.selenium.find_elements_by_class_name("messageList")
        self.assertEqual(3, len(messages_units))
        # the notifications count should not be modified
        refreshed_notifications_count = int(self.selenium.find_elements_by_class_name('notificationCounterPositiveCount')[0].get_attribute('innerHTML'))
        self.assertEqual(notifications_count, refreshed_notifications_count)
        # we click on the load more button
        self.selenium.execute_script("document.querySelectorAll('.messagesMessagesLoadMore')[0].click()")
        time.sleep(2)
        messages_units = self.selenium.find_elements_by_class_name("messageList")
        self.assertTrue(3 < len(messages_units))
        # the form must be empty
        input = self.selenium.find_elements_by_class_name("messageFormInput")[0]
        self.assertEqual(input.get_attribute('value').encode('utf-8'), "")
        # the new message must be at the top in the thread list
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), hello)
        # and at the bottom of the messages list
        message_list_body = self.selenium.find_elements_by_class_name("messageListLayoutBody")
        self.assertEqual(message_list_body[-1].get_attribute('innerHTML'), hello)
        # we add people to the thread
        self.selenium.execute_script("document.querySelectorAll('i.addUser')[0].click()")
        time.sleep(2)
        count_bagdes = len(self.selenium.find_elements_by_class_name("recipientBadge"))
        count_participations = Participation.objects.all().count()
        # we add the first one
        self.selenium.execute_script("document.querySelectorAll('.selectableRecipient')[0].click()")
        # he appears in the list of the selected recipients
        self.assertEqual(count_bagdes + 1, len(self.selenium.find_elements_by_class_name("recipientBadge")))
        # he is the only removable in the list
        self.assertEqual(1, len(self.selenium.find_elements_by_class_name("removeRecipientBadge")))
        # now we see a button allowing to save this recipient
        self.selenium.execute_script("document.querySelectorAll('button.saveNewRecipient')[0].click()")
        time.sleep(2)
        # the db is updated
        self.assertEqual(count_participations + 1, Participation.objects.all().count())
        # as long as the participant has not been saved, we can remove him
        # we add another recipient
        self.selenium.execute_script("document.querySelectorAll('.selectableRecipient')[0].click()")
        self.assertEqual(count_bagdes + 2, len(self.selenium.find_elements_by_class_name("recipientBadge")))
        self.assertEqual(count_participations + 1, Participation.objects.all().count())  # no update
        # we remove him
        self.selenium.execute_script("document.querySelectorAll('.removeRecipientBadge')[0].click()")
        self.assertEqual(count_bagdes + 1, len(self.selenium.find_elements_by_class_name("recipientBadge")))
        self.assertEqual(count_participations + 1, Participation.objects.all().count())
        # now we chek the notifications
        # for now, there is a positive count
        self.assertEqual(1, len(self.selenium.find_elements_by_class_name("notificationCounterPositiveCount")))
        old = NotificationCheck.objects.get(participant=Participant.objects.get(id=1))
        self.selenium.execute_script("document.querySelectorAll('.notificationCounter')[0].click()")
        time.sleep(1)
        new = NotificationCheck.objects.get(participant=Participant.objects.get(id=1))
        self.assertTrue(old.date_check < new.date_check)
        self.assertEqual(0, len(self.selenium.find_elements_by_class_name("notificationCounterPositiveCount")))
        # we add a new thread
        self.selenium.execute_script("document.querySelectorAll('.threadsCreate')[0].click()")
        # we ensure we need participants and a message to submit it!
        self.selenium.find_elements_by_class_name('messageFormInput')[0].send_keys(hello)
        count_messages = Message.objects.all().count()
        self.selenium.execute_script("document.querySelectorAll('.messageFormSubmit')[0].click()")
        time.sleep(2)
        # the count must not change
        self.assertEqual(count_messages, Message.objects.all().count())
        # we add recipients
        self.selenium.execute_script("var recipients = document.querySelectorAll('.selectableRecipient'); recipients[0].click(); recipients[1].click(); recipients[2].click(); recipients[3].click();")
        self.assertEqual(4, len(self.selenium.find_elements_by_class_name("recipientBadge")))
        # we remove one
        self.selenium.execute_script("document.querySelectorAll('.removeRecipientBadge')[0].click()")
        # we use a filter (we exclude all of them here for easiness)
        self.assertTrue(0 < len(self.selenium.find_elements_by_class_name("selectableRecipient")))
        self.selenium.find_elements_by_class_name('recipientsFilterClass')[0].send_keys('UserThatDoesNotExist')
        time.sleep(2)
        self.assertEqual(3, len(self.selenium.find_elements_by_class_name("recipientBadge")))
        self.assertEqual(0, len(self.selenium.find_elements_by_class_name("selectableRecipient")))
        # we submit
        count_threads_screen = len(self.selenium.find_elements_by_class_name("threadListLayout"))
        count_threads_db = Thread.objects.all().count()
        self.selenium.execute_script("document.querySelectorAll('.messageFormSubmit')[0].click()")
        time.sleep(2)
        # we have a new thread
        # + 2  because the thread list appears once in the navbar and once in the side bar
        self.assertEqual(count_threads_screen + 1 * 2, len(self.selenium.find_elements_by_class_name("threadListLayout")))
        self.assertEqual(count_threads_db + 1, Thread.objects.all().count())
        # now we test the dynamic features
        # a non connected participants adds a new thread
        threads_of_current_participant = Thread.objects.filter(participants=Participant.objects.get(id=1))
        connected_participants_ids = []
        for thread in threads_of_current_participant:
            participants_in_thread = [p.participant for p in Participation.objects.filter(thread=thread)]
            for participant in participants_in_thread:
                connected_participants_ids.append(participant.id)
        connected_participants_ids = list(set(connected_participants_ids))
        unconnected_participants = Participant.objects.exclude(id__in=connected_participants_ids).exclude(id=Participant.objects.get(id=1).id)
        unconnected_participant = unconnected_participants[0]
        request = RequestFactory()
        request.rest_messaging_participant = unconnected_participant
        thread = Thread.managers.get_or_create_thread(request, None, *[1])
        body = "New Thread created! Message sent by {0}".format(unconnected_participant)
        Message.objects.create(sender=unconnected_participant, thread=thread, body=body)
        time.sleep(2)
        # a new thread must have appeared at the top!
        all_threads = self.selenium.find_elements_by_class_name("threadListLayout")
        new_count_threads_screen = count_threads_screen + 2 * 2  # + 4 because the thread list appears once in the navbar and once in the side bar
        self.assertEqual(new_count_threads_screen, len(all_threads))
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), body)
        # we have one notification
        self.assertEqual(self.selenium.find_elements_by_class_name("notificationCounterPositiveCount")[0].get_attribute('innerHTML'), "1")
        # we push another message to this thread
        other_message_body = "Other message"
        last_message = Message.objects.create(sender=unconnected_participant, thread=thread, body=other_message_body)
        time.sleep(2)
        # the new message has appeared
        all_threads = self.selenium.find_elements_by_class_name("threadListLayout")
        self.assertEqual(new_count_threads_screen, len(all_threads))  # the count did not change
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), other_message_body)
        # we add a user to this thread
        # our user should continue to get the messages
        # this ensures the channels are not messed up
        unconnected_participant2 = Participant.objects.create(id=8)
        thread.add_participants(request, *[unconnected_participant2.id])
        body = "New participant in thread {0}".format(thread.id)
        Message.objects.create(sender=unconnected_participant2, thread=thread, body=body)
        time.sleep(2)
        all_threads = self.selenium.find_elements_by_class_name("threadListLayout")
        self.assertEqual(new_count_threads_screen, len(all_threads))  # the count did not change
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), body)
        # the notification count did not change
        self.assertEqual(self.selenium.find_elements_by_class_name("notificationCounterPositiveCount")[0].get_attribute('innerHTML'), "1")
        # he selects the last thread
        self.selenium.execute_script("document.querySelectorAll('.threadListLayout')[0].click()")
        time.sleep(2)
        # he quits this last thread
        count_active = Participation.objects.filter(participant=Participant.objects.get(id=1), date_left__isnull=True).count()
        self.selenium.execute_script("document.querySelectorAll('.messagesThreadsQuit')[0].click()")
        time.sleep(2)
        # the thread has disappeared
        all_threads = self.selenium.find_elements_by_class_name("threadListLayout")
        self.assertEqual(new_count_threads_screen - 2 * 1, len(all_threads))
        count_active_after_quit = Participation.objects.filter(participant=Participant.objects.get(id=1), date_left__isnull=True).count()
        self.assertEqual(count_active - 1, count_active_after_quit)
        # any message sent to the corresponding channel will not be received
        not_seen_message_body = "This will never been seen"
        Message.objects.create(sender=last_message.sender, thread=last_message.thread, body=not_seen_message_body)
        time.sleep(2)
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        last_visible_thread_body = thread_list_body[0].get_attribute('innerHTML')
        self.assertNotEqual(last_visible_thread_body, not_seen_message_body)
        # if the user is removed from a conversation, he should not get the newly pushed messages
        thread_to_be_unactivated = Participation.objects.filter(participant=Participant.objects.get(id=1), date_left__isnull=True)[0].thread
        # we push a message, he should get it
        message_ok = Message.objects.create(sender=Message.objects.filter(thread=thread_to_be_unactivated).exclude(sender=Participant.objects.get(id=1))[0].sender, thread=thread_to_be_unactivated, body="Message ok")
        self.assertEqual(Message.objects.latest('id').id, message_ok.id)
        time.sleep(2)
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), message_ok.body)
        # we remove him from the conversation
        thread_to_be_unactivated.remove_participant(request, Participant.objects.get(id=1))
        message_not_ok = Message.objects.create(sender=last_message.sender, thread=thread_to_be_unactivated, body="Message not ok")
        time.sleep(2)
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertNotEqual(thread_list_body[0].get_attribute('innerHTML'), message_not_ok.body)
        # we add him to a new conversation, he should get the messages
        running_thread = Thread.managers.get_or_create_thread(request, None, *[2])
        message_not_in_thread_yet = Message.objects.create(sender=Participant.objects.get(id=2), thread=running_thread, body="Message not in thread yet")
        time.sleep(2)
        # he should not see it
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertNotEqual(thread_list_body[0].get_attribute('innerHTML'), message_not_in_thread_yet.body)
        # we add him to the conversation
        running_thread.add_participants(request, *[1])
        message_in_thread = Message.objects.create(sender=Participant.objects.get(id=2), thread=running_thread, body="Message in thread")
        time.sleep(2)
        thread_list_body = self.selenium.find_elements_by_class_name("threadListLayoutBody")
        self.assertEqual(thread_list_body[0].get_attribute('innerHTML'), message_in_thread.body)

'''
# DJANGO_REST_MESSAGING_THREADS_PAGE_SIZE allows us to test the load more thread btn
@override_settings(CENTRIFUGO_PORT=8802,
                   CENTRIFUGE_ADDRESS='http://localhost:{0}/'.format(8802),
                   DJANGO_REST_MESSAGING_MESSAGES_PAGE_SIZE=2,
                   REST_MESSAGING_REMOVE_PARTICIPANTS_CALLBACK=lambda *args, **kwargs: [p.id for p in Participant.objects.all()])
class TestClientSide(IntegrationTests):

    def test_integration_client_side(self):
        """ Test client side """
        self.integration(url='rest_messaging_js:django_local_webpack')
'''


# DJANGO_REST_MESSAGING_THREADS_PAGE_SIZE allows us to test the load more thread btn
@override_settings(CENTRIFUGO_PORT=8802,
                   CENTRIFUGE_ADDRESS='http://localhost:{0}/'.format(8802),
                   DJANGO_REST_MESSAGING_MESSAGES_PAGE_SIZE=2,
                   REST_MESSAGING_REMOVE_PARTICIPANTS_CALLBACK=lambda *args, **kwargs: [p.id for p in Participant.objects.all()])
class TestServerSide(IntegrationTests):

    def test_integration_server_side(self):
        """ Test client side """
        self.integration(url='rest_messaging_js:django_production')
