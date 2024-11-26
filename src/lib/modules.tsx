import { createClient, type Client } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { SIService } from "@backend.sis/api_connect";
import { MoodleService } from "@backend.vcmoodle/api_connect";
import type { ServiceType } from "@bufbuild/protobuf";
import type { Data } from "@backend.sis/api_pb";
import vcassistConfig from "@/vcassist.config";
import { CredentialForm } from "./CredentialForm";
// Required for TypeScript
function defineModule<Name extends string, Data, Service extends ServiceType>(
	module: Module<Name, Data, Service>,
): Module<Name, Data, Service> {
	return module;
}
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
		const output = defineModule({
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
		});
		return output;
	},
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
		const client = createClient(SIService, transport);
		// useSISContext.setState({ client })

		const res = await client.getCredentialStatus({});
		const status = res.status;
		const loginFlow = res.status?.loginFlow;
		if (!status || !loginFlow) {
			throw new Error("loginFlow is undefined.");
		}

		// let credentialState: CredentialState
		switch (loginFlow.case) {
			case "usernamePassword":
				credentialState = {
					name: status.name,
					provided: status.provided,
					picture: status.picture,
					loginFlow: {
						type: "usernamePassword",
						async onSubmit(username: string, password: string) {
							await client.provideCredential({
								credential: {
									case: "usernamePassword",
									value: { username, password },
								},
							});
						},
					},
				};
				break;
			case "oauth":
				credentialState = {
					name: "PowerSchool",
					provided: res.status?.provided ?? false,
					loginFlow: {
						type: "oauth",
						onStart() {
							return fnSpan(
								undefined,
								"intercept-token",
								async (span) => {
									return new Promise<void>((resolve, reject) => {
										(async () => {
											try {
												span.addEvent(
													"Opening webview - iOS wants a listener BEFORE loading URLs.",
												);

												const loginUrl = getOAuthLoginUrl(loginFlow.value);
												span.setAttribute("loginUrl", loginUrl);

												const userAgent = await native.userAgent();
												await native.openWebview(loginUrl, userAgent);

												const unsubscribeNav = await native.onWebviewNavigate(
													async (urlStr) => {
														span.addEvent("got token request!", {
															url: urlStr,
														});

														try {
															const url = new URL(urlStr);
															const code = url.searchParams.get("code");
															if (!code) {
																span.setStatus({
																	code: SpanStatusCode.ERROR,
																	message: "no token in url",
																});
																return;
															}

															span.addEvent("requesting tokenFormData");
															const tokenForm = getTokenFormData(
																code,
																loginFlow.value,
															);
															console.log("starting tokenForm Request");
															const res = await fetch(
																loginFlow.value.tokenRequestUrl,
																{
																	method: "POST",
																	body: tokenForm,
																},
															);

															const resText = await res.text();
															const token = openIdTokenResponse.parse(
																JSON.parse(resText),
															);
															console.log(token);

															span.addEvent("submitting tokens to server!");

															await client.provideCredential({
																credential: {
																	case: "token",
																	value: {
																		token: resText,
																	},
																},
															});

															console.log("done.");

															resolve();

															await native.closeWebview(); // This is similar to the handler, in that it will not run if the webview is removed prematurely. No clue why.
															await unsubscribeNav?.();
														} catch (e) {
															span.recordException(narrowError(e));
															span.setStatus({
																code: SpanStatusCode.ERROR,
																message: "Submit token failure.",
															});

															reject(e);

															await unsubscribeNav?.();
															await native.closeWebview();
														}

														span.end();
													},
												);

												const unsubscribeClosed = await native.onWebviewClosed(
													async () => {
														await unsubscribeClosed?.();
													},
												);
											} catch (e) {
												span.recordException(narrowError(e));
												span.setStatus({
													code: SpanStatusCode.ERROR,
													message: "Webview error.",
												});
												span.end();

												reject(e);
											}
										})();
									});
								},
								true,
							);
						},
					},
				};
				break;
			case undefined:
				credentialState = {
					name: "PowerSchool",
					provided: status.provided ?? false,
					loginFlow: {
						type: "usernamePassword",
						async onSubmit(username, password) {},
					},
				};
				break;
			default:
				// @ts-ignore
				throw new Error(`unknown credential loginFlow case ${loginFlow.case}`);
		}
		function _handleData(data: Data | undefined): Data | undefined {
			if (!data) {
				return data;
			}

			// hard-coded workaround
			// We have to do this funny assignment thing
			// instead of the spread operator because
			// the spread operator apparently doesn't include
			// the fromJSON methods, etc
			data.courses = data.courses.filter((c) => {
				const lowered = c.name.toLowerCase();
				return !(
					lowered.includes("chapel") ||
					lowered.includes("unscheduled") ||
					lowered.includes("open period")
				);
			});

			return data;
		}
		const output = defineModule({
			name: "PowerSchool",
			client,
			provided: status.provided ?? false,
			picture: status.picture,
			//   credentialStates: [credentialState],
			async get() {
				return _handleData((await client.getData({})).data);
			},
			refetch() {
				this.get = async () => _handleData((await client.refreshData({})).data);
			},
			login() {
				return <>o</>;
			},

			// return {
			//   refetch: async () => {

			//   },
			//   routes: {
			//     "/dashboard": {
			//       title: "Dashboard",
			//       icon: MdDashboard,
			//       render() {
			//         const data = useSISContext((c) => c.data)
			//         return <Dashboard data={data} />
			//       },
			//     },
			//     "/grade-calculator": {
			//       title: "Grade Calculator",
			//       icon: MdCalculate,
			//       render() {
			//         const courses = useSISContext((c) => c.data.courses)
			//         return <GradeCalculator courses={courses} />
			//       },
			//     },
			//     "/grade-trends": {
			//       title: "Grade Trends",
			//       icon: MdTimeline,
			//       rootClassName: "h-full",
			//       render() {
			//         const courses = useSISContext((c) => c.data.courses)
			//         return <GradeTrends courses={courses} />
			//       },
			//     },
			//   },
			// }
		});
		return output;
	},
] as const;
export type Module<Name extends string, Data, Service extends ServiceType> = {
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

type InferModule<T> = T extends (
	token: string,
) => Promise<Module<infer Name, infer Data, infer Service>>
	? Module<Name, Data, Service>
	: never;

type ModulesFromPending<T extends readonly unknown[]> = Partial<{
	[K in T[number] as Lowercase<InferModule<K>["name"]>]: InferModule<K>;
}>;

export type Modules = ModulesFromPending<typeof pendingModules>;
