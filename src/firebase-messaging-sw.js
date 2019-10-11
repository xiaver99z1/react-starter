/* eslint-disable no-undef,no-restricted-globals,consistent-return */
let clickURI;
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const openURL = event.notification.data || clickURI;
    event.waitUntil(self.clients.openWindow(openURL));
});

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    messagingSenderId: '1079720753159',
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
messaging.setBackgroundMessageHandler(payload => {
    // Customize notification here
    const json = JSON.parse(payload.data.notification);
    clickURI = payload.data.clickUri;
    const notificationTitle = json.title;
    const notificationOptions = {
        body: json.body,
        data: payload.data.clickUri,
        clickAction: payload.data.clickUri,
    };
    return self.registration.showNotification(
        notificationTitle,
        notificationOptions,
    );
});
