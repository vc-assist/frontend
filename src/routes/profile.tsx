import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import ProfileHeader from "@/src/lib/ProfileHeader";
import { Title } from "@mantine/core";
// import { useUser } from "@/src/stores";
import {
	IconButton,
	LogoutModal,
	Panel,
	ThemeToggleButton,
	createDefaultMeter,
} from "@vcassist/ui";
import { MdDelete, MdGetApp } from "react-icons/md";
import { SettingsPanel } from "@/src/lib/Settings";
import { useAtom } from "jotai";
import { UserAtom } from "../lib/stores";
import { IconType } from "react-icons";
export const Route = createFileRoute("/profile")({
	component: ProfileComponent,
});

const meter = createDefaultMeter("routes.profile");
const requestData = meter.createCounter("request-data");
const deleteData = meter.createCounter("delete-data");
const viewPage = meter.createCounter("view");
function ProfileComponent() {
	const [user, setUser] = useAtom(UserAtom);
	if (!user.profile) {
		return null;
	}
	const profile = user.profile;
	React.useEffect(() => {
		viewPage.add(1);
	}, []);

	return (
		<div
			className={twMerge(
				"h-full grid grid-cols-1 grid-rows-[min-content_min-content_1fr]",
				"lg:grid-cols-5 xl:grid-cols-3 lg:grid-rows-[1fr_2fr] gap-6",
			)}
		>
			<ProfileHeader className="lg:col-span-5 xl:col-span-3" {...profile} />
			<div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-1">
				<Panel className="flex justify-between gap-3 h-fit">
					<div className="flex flex-col gap-3">
						<Title className="max-w-[5rem]" order={4}>
							Control Panel
						</Title>

						<ThemeToggleButton />
					</div>
					<div className="flex flex-col gap-3 items-end">
						<div className="flex gap-3">
							<IconButton
								icon={MdGetApp}
								label="Request Account Data"
								color="blue"
								onClick={() => {
									requestData.add(1);

									window.open(
										"https://vi.vcassist.org/data-management/requestData",
										"_blank",
									);
								}}
							/>
							<IconButton
								icon={MdDelete}
								label="Delete Account Data"
								color="red"
								onClick={() => {
									deleteData.add(1);

									window.open(
										"https://vi.vcassist.org/data-management/deleteData",
										"_blank",
									);
								}}
							/>
						</div>

						<div className="flex gap-3">
							{/* <IconButton */}
							{/*   icon={MdRefresh} */}
							{/*   label="Refresh Data" */}
							{/*   color="orange" */}
							{/*   disabled={isRefreshing.value} */}
							{/*   onClick={async () => { */}
							{/*     isRefreshing.value = true */}
							{/*     notifications.show({ */}
							{/*       id: "refresh-user-data", */}
							{/*       message: "Refreshing user data.", */}
							{/*     }) */}
							{/*     try { */}
							{/*       await refreshStudentData() */}
							{/*       notifications.show({ */}
							{/*         message: "Refreshed successfully.", */}
							{/*         autoClose: 3000, */}
							{/*       }) */}
							{/*     } catch (err) { */}
							{/*       notifyError(err) */}
							{/*     } */}
							{/*     notifications.hide("refresh-user-data") */}
							{/*     isRefreshing.value = false */}
							{/*   }} */}
							{/* /> */}
						</div>

						<div className="flex gap-3 flex-wrap justify-end">
							<LogoutModal
								handleLogout={() => {
									setUser({ token: null, profile: null });
								}}
							/>
						</div>
					</div>
				</Panel>
			</div>
			<SettingsPanel className="min-h-[300px] h-full lg:col-span-3 xl:col-span-2" />
		</div>
	);
}
