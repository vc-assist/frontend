import type { GetCoursesResponse } from "@/backend/proto/vcassist/services/vcmoodle/v1/api_pb";
import { createClient, type Client } from "@connectrpc/connect";
import { MoodleService } from "@/backend/proto/vcassist/services/vcmoodle/v1/api_connect";
import type { ServiceType } from "@bufbuild/protobuf";
import { createConnectTransport } from "@connectrpc/connect-web";
import vcassistConfig from "@/vcassist.config";
import { CredentialForm } from "./CredentialForm";
export const pendingModules = [
	async (token: string) => {
		const authHeader = `Bearer ${token}`;
		const transport = createConnectTransport({
			baseUrl: vcassistConfig.endpoints.vcassist_backend,
			interceptors: [
				(next) => (req) => {
					req.header.append("Authorization", authHeader);
					return next(req);
				},
			],
		});
		const client = createClient(MoodleService, transport);
		// useMoodleContext.setState({ client });

		const res = await client.getAuthStatus({});
		// Required assignment to output to satisfy TypeScript
		// (otherwise it gets very confused with `this`)
		const output = {
			name: "Moodle" as const,
			provided: res.provided ?? false,
			client,
			picture: "https://moodle.org/logo.png",
			login(props: {
				dispatch: React.Dispatch<{ name: "Moodle"; provided: boolean }>;
			}) {
				return (
					<CredentialForm
						name={this.name}
						provided={res.provided ?? false}
						loginFlow={{
							type: "usernamePassword",
							async onSubmit(username: string, password: string) {
								await client.provideUsernamePassword({
									username,
									password,
								});
							},
						}}
						picture={this.picture}
						className="m-auto hover:cursor-auto"
						onSuccess={() => {
							props.dispatch({ name: "Moodle", provided: true });
						}}
					/>
				);
			},
			get() {
				return client.getCourses({});
			},
			refetch() {
				this.get = () => client.refreshCourses({});
			},
		};
		return output;
	},
];
type Module<Name extends string, Data, Service extends ServiceType> = {
	name: Name;
	provided: boolean;
	picture: string;
	login: (props: {
		dispatch: React.Dispatch<{ name: Name; provided: boolean }>;
	}) => JSX.Element;
	client: Client<Service>;
	get: () => Promise<Data>;
	refetch: () => void;
};
type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
export type Modules<
	T = Awaited<ReturnType<ArrayElement<typeof pendingModules>>>,
> = T extends Module<infer K, infer D, infer C> //{ [key: string]: Refetchable<infer K, infer D> }
	? Record<Lowercase<K>, Module<K, D, C>> //{ [key in Lowercase<K>]: Refetchable<K, D> }
	: never;
