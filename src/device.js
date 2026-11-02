// Phone features: share sheet, haptics, reminders (local notifications), location, camera, Face ID.
// Each helper returns a plain result and never throws, so screens stay simple.
import { Alert, Platform, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as FileSystem from 'expo-file-system/legacy';
import { AGENT, CITY_COORDS } from './config';

const isWeb = Platform.OS === 'web';

export const tap = () => { if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); };
export const success = () => { if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };

// ---- Share ----
// Plain-text summary of a result with the agent's contact line, ready for Messages/WhatsApp/email.
export function summaryText({ title, value, rows = [] }) {
  const lines = [`${title}: ${value}`, ...rows.map(([k, v]) => `${k}: ${v}`)];
  return `${lines.join('\n')}\n\nEstimate only. Prepared with ${AGENT.name}, ${AGENT.brokerage}\n${AGENT.phoneDisplay} · ${AGENT.email}`;
}

export async function shareResult(item) {
  try {
    await Share.share({ message: summaryText(item), title: item.title });
  } catch {
    Alert.alert('Could not open the share sheet');
  }
}

// ---- Reminders (local notifications; no server) ----
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

async function ensureNotifyPermission() {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

// seconds from now. Returns true when scheduled.
export async function scheduleReminder({ title, body, seconds }) {
  if (isWeb) { Alert.alert('Reminders need the app', 'Install the phone app to set reminders.'); return false; }
  try {
    if (!(await ensureNotifyPermission())) {
      Alert.alert('Notifications are off', 'Turn them on for this app in your phone settings to get reminders.');
      return false;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, channelId: 'reminders' },
    });
    return true;
  } catch {
    Alert.alert('Could not set the reminder');
    return false;
  }
}

// ---- Location: nearest city in the app's list ----
const rad = (d) => (d * Math.PI) / 180;
function km(a, b) {
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function nearestCity(point) {
  let best = null;
  for (const [city, c] of Object.entries(CITY_COORDS)) {
    const d = km(point, c);
    if (!best || d < best.km) best = { city, km: d };
  }
  return best;
}

// Returns { city, km } or null. Asks for "while using the app" permission only.
export async function findNearestCity() {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) { Alert.alert('Location is off', 'Allow location for this app to find listings near you.'); return null; }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return nearestCity({ lat: pos.coords.latitude, lon: pos.coords.longitude });
  } catch {
    Alert.alert('Could not get your location');
    return null;
  }
}

// ---- Camera: photo of a property, kept in the app's own folder ----
export async function takePhoto() {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Camera is off', 'Allow the camera for this app in your phone settings.'); return null; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (res.canceled || !res.assets || !res.assets[0]) return null;
    const uri = res.assets[0].uri;
    if (isWeb) return uri;
    try {
      const dest = `${FileSystem.documentDirectory}photo-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      return uri;
    }
  } catch {
    Alert.alert('Could not open the camera');
    return null;
  }
}

// ---- Face ID / fingerprint / passcode ----
export async function canUseLock() {
  if (isWeb) return false;
  try {
    return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  } catch {
    return false;
  }
}

export async function unlock(prompt = 'Unlock home-nader') {
  try {
    const res = await LocalAuthentication.authenticateAsync({ promptMessage: prompt, fallbackLabel: 'Use passcode' });
    return !!res.success;
  } catch {
    return false;
  }
}
