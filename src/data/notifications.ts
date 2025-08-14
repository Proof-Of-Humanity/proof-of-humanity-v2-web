export type AttrString = { S: string };
export type AttrBool = { BOOL: boolean };

export type SettingsSelector = Record<string, boolean>;
export type SettingsUpdate = Record<string, AttrString | AttrBool>;

export interface Envelope<TSettings> {
  payload: {
    address: string;
    settings: TSettings;
    signature: string;
  };
}

export interface FetchResponseItem {
  [key: string]: AttrString | AttrBool;
}

export interface FetchResponse {
  payload: { settings: { Item?: FetchResponseItem } };
}

export function buildDefaultSelector(): SettingsSelector {
  return {
    email: true,
    fullName: true,
    phone: true,
    pushNotifications: true,
    courtNotificationSettingDraw: true,
    courtNotificationSettingAppeal: true,
    courtNotificationSettingLose: true,
    courtNotificationSettingWin: true,
    courtNotificationSettingStake: true,
  };
}

export function buildSubscribeSettings(email: string, fullName?: string): SettingsUpdate {
  const trimmed = email.trim();
  return {
    email: { S: trimmed },
    fullName: { S: (fullName || "").trim() },
    phone: { S: " " },
    pushNotifications: { BOOL: false },
    pushNotificationsData: { S: " " },
    courtNotificationSettingDraw: { BOOL: true },
    courtNotificationSettingAppeal: { BOOL: true },
    courtNotificationSettingWin: { BOOL: true },
    courtNotificationSettingLose: { BOOL: true },
    courtNotificationSettingStake: { BOOL: true },
  };
}

export async function fetchNotificationSettings(params: {
  baseUrl: string;
  address: string;
  selector: SettingsSelector;
  signature: string;
}): Promise<FetchResponse> {
  const body: Envelope<SettingsSelector> = {
    payload: {
      address: params.address,
      settings: params.selector,
      signature: params.signature,
    },
  };
  const response = await fetch(`${params.baseUrl}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch notification settings: ${response.status}`);
  }
  const json = (await response.json()) as FetchResponse;
  return json;
}

export async function updateNotificationSettings(params: {
  baseUrl: string;
  address: string;
  settings: SettingsUpdate;
  signature: string;
}): Promise<void> {
  const body: Envelope<SettingsUpdate> = {
    payload: {
      address: params.address,
      settings: params.settings,
      signature: params.signature,
    },
  };
  const response = await fetch(`${params.baseUrl}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Failed to update notification settings: ${response.status}`);
  }
}
