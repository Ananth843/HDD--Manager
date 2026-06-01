// ================================================================
//  Firebase Cloud Messaging Service Worker
//  Handles background push notifications
// ================================================================
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey            : "AIzaSyD1e3IjNeMuzsleeCsqVeBrQmd2oKe3fVU",
  authDomain        : "hdd--details.firebaseapp.com",
  projectId         : "hdd--details",
  storageBucket     : "hdd--details.firebasestorage.app",
  messagingSenderId : "87776310301",
  appId             : "1:87776310301:web:7aa5f3caadf5627233c2f4"
});

var messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[FCM SW] Background message:', payload);

  var data  = payload.data || {};
  var title = data.title || 'HDD Manager';
  var body  = data.body  || 'You have a new notification.';
  var icon  = '/icons/icon-192.png';
  var badge = '/icons/icon-72.png';

  var options = {
    body       : body,
    icon       : icon,
    badge      : badge,
    vibrate    : [200, 100, 200],
    tag        : data.tag || 'hdd-notification',
    data       : { url: data.url || '/' },
    actions    : [
      { action: 'open',    title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss'  }
    ]
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;

  var url = (event.notification.data && event.notification.data.url)
            ? event.notification.data.url
            : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.includes('HDD--Manager') && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
