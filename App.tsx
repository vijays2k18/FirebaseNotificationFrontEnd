import React, { useEffect } from 'react';
import { Platform, View, Button, StyleSheet,Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';

const App = () => {
  // Function to store the FCM token in the backend
  useEffect(()=>{
    requestAndroidNotificationPermission()
  },[])
  useEffect(() => {
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage.notification);
      // Handle the notification, e.g., show a local alert or display a notification in-app
    });
  }, []);
  useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background state:', remoteMessage.notification);
      // Handle notification when app opens from background
    });
  
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from a notification:', remoteMessage.notification);
        // Handle the notification
      }
    });
  }, []);

  const requestAndroidNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission denied.");
      }
    }
  };
    
  const storeFcmToken = async (adminToken) => {
    try {
      // Replace with the actual user ID
      const user_id = 1;
      console.log("ghhji")
      // Make the API call
      const response = await fetch('http://192.168.213.65:8080/admintoken/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          admin_token: adminToken, // Pass the stored FCM token
        }),
      });
  
      // Parse the response
      console.log(response,"response")
      const responseJson = await response.json();
      console.log('Server Response:', responseJson);
  
      if (response.ok) {
        console.log('Admin token saved successfully:', responseJson);
        Alert.alert('Success', 'Admin token saved successfully');
      } else {
        console.error('Error saving admin token:', responseJson.message || 'Unknown error');
        Alert.alert('Error', responseJson.message || 'Failed to save admin token');
      }
    } catch (error) {
      console.error('Error storing FCM token:', error);
      Alert.alert('Error', 'An unexpected error occurred while saving the admin token');
    }
  };

  useEffect(() => {
    // Request permission to receive notifications (iOS only)
    if (Platform.OS === 'ios') {
      messaging()
        .requestPermission()
        .then((authStatus) => {
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          if (enabled) {
            console.log('Notification permission granted');
          } else {
            console.log('Notification permission denied');
          }
        });
    }

    // Get FCM token and store it in a constant
    const getAndStoreFcmToken = async () => {
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          // Store the FCM token in a constant variable
          const adminToken = fcmToken;
          // Send the token to the backend
          storeFcmToken(adminToken);
        } else {
          console.log('No FCM token found');
        }
      } catch (error) {
        console.error('Error retrieving FCM token:', error);
      }
    };

    getAndStoreFcmToken();

    // Handle background notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    // Handle when app is completely closed
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage.notification);
    });
  }, []);

  // Function to send notification request
  const sendNotificationRequest = async () => {
    console.log("clicked")
    try {
      const response = await fetch('http://192.168.213.65:8080/admin/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'This is a test notification',
          userId: 1, // Replace with the actual user ID
        }),
      });
  
      // Log the response status and full response
      console.log('Response Status:', response.status);
      const responseData = await response.json();
      console.log('Response Data:', responseData);
  
      if (response.ok) {
        console.log('Notification sent successfully:', responseData);
      } else {
        console.error('Error sending notification:', responseData.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Button
        title="Request Notification"
        onPress={sendNotificationRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
