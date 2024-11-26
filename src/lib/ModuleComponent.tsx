import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { DataModulesAtom, type User } from "../lib/stores";
import { ErrorPage } from "@/ui";
import { CredentialCarousel } from "./CredentialCarousel";
import { LoadingPage } from "@/src/lib/LoadingPage";
import { Modules, pendingModules } from "./modules";

export function ModuleComponent(props: { user: User }) {
	const setDataModules = useSetAtom(DataModulesAtom);
	const moduleCredentialsQuery = useQuery({
		queryKey: ["moduleCredentials", props.user.token],
		queryFn: () => {
			return Promise.all(
				pendingModules.map((mod) =>
					mod(props.user.token!).then((x) => {
						setDataModules((prev) => ({
							...(prev ?? {}),
							[x.name.toLowerCase()]: x,
						}));
						return x;
					}),
				),
			);
		},
		enabled: props.user.token !== null,
	});
	const queryClient = useQueryClient();

	// The `|| token === null` isn't logically necessary but helps with TypeScript
	if (!moduleCredentialsQuery.data || props.user.token === null) {
		return <LoadingPage />;
	}
	const provided = !!moduleCredentialsQuery.data?.every(
		(value) => value.provided,
	);
	if (!provided) {
		return (
			<CredentialCarousel
				profile={props.user.profile}
				items={moduleCredentialsQuery.data}
				onComplete={async () => {
					await moduleCredentialsQuery.refetch();
					queryClient.invalidateQueries({ queryKey: ["moduleCredentials"] });
				}}
			/>
		);
	}
	if (moduleCredentialsQuery.isError) {
		return (
			<ErrorPage
				message="Failed to get credential status."
				description={moduleCredentialsQuery.error.message}
			/>
		);
	}
}
