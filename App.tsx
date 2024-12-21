import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Alert, View, Text, Button, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  const [fcmToken, setFcmToken] = useState('');

  // Request notification permission and get FCM token
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestNotificationPermission();
    }
 // Handle notifications in the foreground
 const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
  console.log('Foreground message:', remoteMessage);
  Alert.alert('Notification Received', remoteMessage.notification.body);
});

// Background and quit state handler
const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
  console.log('Notification caused app to open:', remoteMessage);
  Alert.alert('Notification Clicked', remoteMessage.notification.body);
});

const unsubscribeInitialNotification = messaging()
  .getInitialNotification()
  .then((remoteMessage) => {
    if (remoteMessage) {
      console.log('App opened from quit state by notification:', remoteMessage);
      Alert.alert('Notification Clicked (Quit State)', remoteMessage.notification.body);
    }
  });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpened();
    unsubscribeInitialNotification();
  };

  }, []);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
          getFcmToken(); // Fetch the FCM token
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert(
            'Permission Denied',
            'Notification permissions are required to stay updated. Please enable them in Settings.',
            [{ text: 'OK' }]
          );
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Permission Blocked',
            'Notification permissions are blocked. Please enable them in Settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // ********************* Receive notification ******************** // 

  

  // **************************** Storing FCMToken ************************* //
  const getFcmToken = async () => {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log('FCM Token:', token);
        setFcmToken(token);
      } else {
        console.log('No FCM token received');
      }
    } catch (error) {
      console.error('Error fetching FCM token:', error);
    }
  };

  // **************************** Save Token to Backend ************************* //
  const saveAdminToken = async () => {
    const userId = 1
    console.log(fcmToken,"received")
    if (!userId || !fcmToken) {
      Alert.alert('Error', 'User ID and Admin token are required');
      return;
    }

    try {
      const response = await fetch('http://192.168.75.47:8080/admintoken/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          admin_token: fcmToken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Failed to save Admin token');
      }
    } catch (error) {
      console.error('Error saving Admin token:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

// send notification 
       const handleSendNotification = async () => {
      try {
        const response = await fetch('http://192.168.75.47:8080/admin/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'hi ji',
            userId: 1
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          Alert.alert('Success', data.message);
        } else {
          Alert.alert('Error', data.error || 'Something went wrong');
        }
      } catch (error) {
        console.error('Error sending notification:', error);
        Alert.alert('Error', 'Failed to send notification');
      }
    };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ marginBottom: 10 }}>Android Notification Permission Example</Text>
      <Button title="Request Permission" onPress={requestNotificationPermission} />
      {fcmToken ? (
        <Text style={{ marginTop: 20 }}>FCM Token: {fcmToken}</Text>
      ) : (
        <Text style={{ marginTop: 20 }}>Fetching FCM Token...</Text>
      )}
      <Button
        title="Save Token"
        onPress={saveAdminToken}
      />

<Button
        title="Notification"
        onPress={handleSendNotification}
      />
    </View>
  );
};

export default App;
