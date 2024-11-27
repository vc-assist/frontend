import type { UserProfile } from "@vcassist/ui";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Modules } from "./modules";
export type LoggedInUser = {
	token: string;
	profile: UserProfile;
};
export type User = { token: null; profile: null } | LoggedInUser;
export const UserAtom = atomWithStorage<User>("user", {
	token: null,
	profile: null,
});

// All of this "DataModule" is pretty stupid code...
// export type DataModule<
// 	Name extends string = string,
// 	LoadedData = any,
// 	ClientType extends ServiceType = ServiceType,
// > = {
// 	name: Name;
//
// 	client: ClientType;
// 	get: () => Promise<LoadedData>;
// 	refetch: () => Promise<LoadedData>;
// };

export const DataModulesAtom = atom<Modules | null>(null);
export const DataModulesLoaded = atom((get) => {
	const dataModules = get(DataModulesAtom);
	if (!dataModules) return false;
	return Object.values(dataModules).every((x) => x.provided);
});
