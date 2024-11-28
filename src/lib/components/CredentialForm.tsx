import {
	Panel,
	useImageToColor,
	UserAvatar,
	useStringToMantineColor,
} from "@/ui";
import { twMerge } from "tailwind-merge";
import {
	OAuthForm,
	UsernamePasswordForm,
} from "@/ui/foundation/credential-forms";
import { Avatar, Button, Title } from "@mantine/core";
import * as React from "react";
import { MdEdit } from "react-icons/md";
import { useAtomValue } from "jotai";
import { UserAtom } from "../stores";
export interface CredentialFormProps {
	className?: string;
	// Picture of the credential provider
	picture: string;
	name: string;
	provided: boolean;
	loginFlow:
		| {
				type: "oauth";
				/**
				 * This function should throw when an error happens.
				 */
				onStart(): Promise<void>;
		  }
		| {
				type: "usernamePassword";
				/**
				 * This function should throw when an error happens.
				 */
				onSubmit(username: string, password: string): Promise<void>;
		  };
	onSuccess(): void;
}
export function CredentialForm(props: CredentialFormProps) {
	const { profile } = useAtomValue(UserAtom);
	const pictureColor = useImageToColor(props.picture ?? "");
	const fallbackColor = useStringToMantineColor(props.name);
	const [editing, setEditing] = React.useState(!props.provided);

	const color = pictureColor ?? fallbackColor;

	let form = <></>;
	switch (props.loginFlow.type) {
		case "usernamePassword":
			form = (
				<UsernamePasswordForm
					color={color}
					onSubmit={props.loginFlow.onSubmit}
					onSuccess={props.onSuccess}
				/>
			);
			break;
		case "oauth":
			form = (
				<OAuthForm
					color={color}
					onStart={props.loginFlow.onStart}
					onSuccess={props.onSuccess}
				/>
			);
			break;
	}

	return (
		<Panel className={twMerge("flex flex-col gap-4 max-w-xs", props.className)}>
			<Avatar.Group>
				<UserAvatar className="rounded-full w-14 h-14" {...profile!} />
				<Avatar
					classNames={{
						root: "rounded-full w-14 h-14",
						placeholder: "text-xl",
					}}
					c={color}
					variant="filled"
					src={props.picture}
				>
					{props.name[0].toUpperCase()}
				</Avatar>
			</Avatar.Group>

			<div className="flex flex-col gap-2">
				<Title order={3}>
					{editing ? "Enter your credentials" : "Credentials provided"}
				</Title>
				<p>
					{editing ? (
						<>
							By providing your <b>{props.name}</b> credentials to VC Assist,
							you&apos;re enabling VC Assist to retrieve your data.
						</>
					) : (
						<>
							You have already provided your <b>{props.name}</b> credentials.
						</>
					)}
				</p>
			</div>

			{!editing ? (
				<div className="flex gap-3">
					<Button
						variant="outline"
						color="gray"
						leftSection={<MdEdit size={16} />}
						onClick={() => {
							setEditing(true);
						}}
					>
						Edit
					</Button>
				</div>
			) : (
				form
			)}

			{props.provided && editing ? (
				<Button
					className="w-fit m-auto"
					variant="subtle"
					c="gray"
					onClick={() => setEditing(false)}
				>
					Stop editing
				</Button>
			) : undefined}
		</Panel>
	);
}
