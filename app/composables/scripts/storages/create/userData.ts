export type UserData = {
  id?: number;
  email?: string;
  username?: string;
  avatarUrl?: string;
};

export default function useUserDataState() {
  return useState<UserData | null>('user-data', () => null);
}
