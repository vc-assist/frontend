import "@mantine/carousel/styles.css";

import { Carousel, type Embla } from "@mantine/carousel";
import * as React from "react";
import { BrandTag, LogoutModal, Positioned, type UserProfile } from "@/ui";
import { MdArrowBack, MdArrowForward, MdEdit } from "react-icons/md";
import { useSetAtom } from "jotai";
import { UserAtom } from "./stores";
import { rem } from "@mantine/core";
type CredentialModule<N extends string = string> = {
	name: N;
	login(props: {
		dispatch: React.Dispatch<{ name: N; provided: boolean }>;
	}): React.ReactNode;
	picture: string;
};
export function CredentialCarousel<T extends CredentialModule>(props: {
	className?: string;
	profile: UserProfile;
	items: T[];
	onComplete: () => void;
}) {
	const setUser = useSetAtom(UserAtom);
	// This funny T["name"] syntax is a way to extract the "name" property from the generic type T
	// This helps us restrict whatever can go in the `name` field in the dispatch action
	type ModuleName = T["name"];
	type Cred = { name: ModuleName; provided: boolean };
	const [creds, dispatch] = React.useReducer(
		(state: Cred[], action: Cred) => {
			// Move to the next uncompleted credential
			const idx = state.findIndex((c) => !c.provided);
			if (idx >= 0) {
				embla?.scrollTo(idx);
			}
			return state.map((x) => (x.name === action.name ? action : x));
		},
		props.items.map((x) => ({ name: x.name, provided: false })),
	);
	const [embla, setEmbla] = React.useState<Embla | null>(null);

	React.useEffect(() => {
		const complete = Object.values(creds).every((x) => x);
		if (complete) {
			props.onComplete();
		}
	}, [creds, props.onComplete]);
	return (
		<div className="flex w-full h-full">
			<Carousel
				className={props.className}
				slideSize="100%"
				w="100%"
				height="100%"
				withIndicators
				styles={{
					indicator: {
						width: rem(12),
						height: rem(4),
						transition: "width 250ms ease",
					},
				}}
				withControls
				withKeyboardEvents={false}
				controlSize={40}
				previousControlIcon={<MdArrowBack size={22} />}
				nextControlIcon={<MdArrowForward size={22} />}
				getEmblaApi={setEmbla}
			>
				{props.items.map((module, i) => (
					<Carousel.Slide
						className="flex hover:cursor-grab active:cursor-grabbing"
						key={module.name}
					>
						<module.login dispatch={dispatch} />
					</Carousel.Slide>
				))}
			</Carousel>
			<BrandTag className="absolute bottom-12 left-1/2 -translate-x-1/2" />
			<Positioned x="left" y="top" padding="2rem">
				<LogoutModal
					handleLogout={() => {
						setUser({ token: null, profile: null });
					}}
				/>
			</Positioned>
		</div>
	);
}
