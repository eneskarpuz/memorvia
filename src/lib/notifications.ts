import { PermissionsAndroid, Platform } from 'react-native';
import { setDoc } from '@react-native-firebase/firestore';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { deviceRef, serverTimestamp } from './firebase';

const messaging = getMessaging();

async function saveToken(uid: string, token: string) {
  await setDoc(
    deviceRef(uid),
    { fcmToken: token, platform: Platform.OS, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Asks for permission and stores the FCM token so the backend can push to this device. */
export async function registerForPush(uid: string) {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    const status = await requestPermission(messaging);
    if (
      status !== AuthorizationStatus.AUTHORIZED &&
      status !== AuthorizationStatus.PROVISIONAL
    ) {
      return () => {};
    }
    await saveToken(uid, await getToken(messaging));
    return onTokenRefresh(messaging, t => saveToken(uid, t));
  } catch (e) {
    console.warn('Push kaydı başarısız', e);
    return () => {};
  }
}
