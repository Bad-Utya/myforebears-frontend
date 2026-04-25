import useUserDataState, {type UserData} from "~/composables/scripts/storages/create/userData";
import {getAccessToken} from "~/composables/scripts/cookies/getAccessToken";
import sendGetUserAvatarRequest from "~/composables/scripts/photos/getUserAvatar";

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  const payloadPart = parts[1];
  if (!payloadPart) return null;

  try {
    const payloadJson = decodeBase64Url(payloadPart);
    const payload = JSON.parse(payloadJson);
    if (!payload || typeof payload !== 'object') return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickString(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

function pickNumber(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

export default function useUserDataHandler() {
  const userData = useUserDataState();
  const accessToken = getAccessToken();
  const pending = ref(false);

  async function loadFromToken() {
    const token = accessToken.value;
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    const id = pickNumber(payload, ['user_id', 'userId', 'id', 'sub']);
    const email = pickString(payload, ['email', 'mail']);
    const username = pickString(payload, ['username', 'name', 'login', 'preferred_username']);

    const data: UserData = {id, email, username};
    return data;
  }

  async function ensureLoaded() {
    if (pending.value) return;
    if (userData.value) return;

    pending.value = true;
    try {
      const baseData = await loadFromToken();
      if (!baseData) {
        userData.value = null;
        return;
      }

      if (typeof baseData.id === 'number') {
        try {
          const avatarBlob = await sendGetUserAvatarRequest(baseData.id);
          const avatarUrl = URL.createObjectURL(avatarBlob);

          baseData.avatarUrl = avatarUrl;
        } catch {
          // ignore avatar errors
        }
      }

      userData.value = baseData;
    } finally {
      pending.value = false;
    }
  }

  onBeforeUnmount(() => {
    const current = userData.value;
    if (current?.avatarUrl) {
      URL.revokeObjectURL(current.avatarUrl);
    }
  });

  return {
    userData,
    pending: computed(() => pending.value),
    ensureLoaded,
  };
}
