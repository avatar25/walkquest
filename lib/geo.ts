import * as Location from 'expo-location';

export async function getLocationOnce() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location perm denied');
  return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
}

export function canCheckIn(user: Location.LocationObject, targetLat: number, targetLng: number, radiusM: number) {
  const toRad = (deg: number)=>deg*Math.PI/180;
  const R = 6371000;
  const dLat = toRad(targetLat - user.coords.latitude);
  const dLon = toRad(targetLng - user.coords.longitude);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(user.coords.latitude))*Math.cos(toRad(targetLat))*Math.sin(dLon/2)**2;
  const d = 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const speedKMH = Math.max(0, (user.coords.speed ?? 0) * 3.6);
  return d <= radiusM && speedKMH < 12 && (user.coords.accuracy ?? 999) < 25;
}
