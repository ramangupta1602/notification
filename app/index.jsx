import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Index() {
  const [permissionStatus, setPermissionStatus] = useState("Checking...");
  const [latestNotification, setLatestNotification] = useState(
    "No notification received yet.",
  );

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      if (isMounted) {
        setPermissionStatus(status);
      }

      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          const title = notification.request.content.title ?? "Notification";
          const body =
            notification.request.content.body ?? "You received a notification.";

          if (isMounted) {
            setLatestNotification(`${title}: ${body}`);
          }
        });

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const title =
            response.notification.request.content.title ?? "Notification";
          const body =
            response.notification.request.content.body ??
            "You tapped the notification.";

          if (isMounted) {
            setLatestNotification(`${title}: ${body}`);
          }
        });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    };

    let cleanupPromise;
    cleanupPromise = setupNotifications();

    return () => {
      isMounted = false;
      cleanupPromise?.then?.((cleanup) => cleanup?.());
    };
  }, []);

  const scheduleLocalNotification = async () => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Push Notification Demo",
          body: "This local notification was scheduled from your JavaScript app.",
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 15,
        },
      });

      Alert.alert("Notification scheduled", `ID: ${id}`);
    } catch (error) {
      Alert.alert("Notification error", error.message || "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications Demo</Text>
      <Text style={styles.text}>Permission status: {permissionStatus}</Text>
      <Text style={styles.text}>Latest notification: {latestNotification}</Text>
      <View style={styles.buttonWrapper}>
        <Button
          title="Schedule notification"
          onPress={scheduleLocalNotification}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 16,
    width: "100%",
  },
});
