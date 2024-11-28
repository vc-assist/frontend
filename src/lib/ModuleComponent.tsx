import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { DataModulesAtom, type LoggedInUser } from "../lib/stores";
import { ErrorPage } from "@/ui";
import { CredentialCarousel } from "./CredentialCarousel";
import { LoadingPage } from "@/src/lib/LoadingPage";
import { pendingModules } from "./modules";
import { useCallback } from "react";

export function ModuleComponent(props: { user: LoggedInUser }) {
	const setDataModules = useSetAtom(DataModulesAtom);
	const moduleCredentialsQuery = useQuery({
		queryKey: ["moduleCredentials", props.user.token],
		queryFn: () => {
			return Promise.all(
				pendingModules.map((mod) =>
					mod(props.user.token!).then((x) => {
						// I'm not sure what's the best way
						// to tell TypeScript about this 1-to-1
						// non-isomorphic relationship
						// - ThatXliner
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
	// Required to avoid infinite loop
	const onComplete = useCallback(async () => {
		await moduleCredentialsQuery.refetch();
		queryClient.invalidateQueries({ queryKey: ["moduleCredentials"] });
	}, [moduleCredentialsQuery.refetch, queryClient]);
	if (!moduleCredentialsQuery.data) {
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
				onComplete={onComplete}
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
