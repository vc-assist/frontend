import "@mantine/carousel/styles.css";

import { Carousel, type Embla } from "@mantine/carousel";
import * as React from "react";
import { BrandTag, LogoutModal, Positioned, type UserProfile } from "@/ui";
import { MdArrowBack, MdArrowForward, MdEdit } from "react-icons/md";
import { useSetAtom } from "jotai";
import { UserAtom } from "../stores";
import { rem } from "@mantine/core";
import type { Module } from "../modules";
import type { ServiceType } from "@bufbuild/protobuf";
type CredentialModule<N extends string = string> = Pick<
	Module<N, unknown, ServiceType>,
	"name" | "login" | "provided"
>;
export function CredentialCarousel(props: {
	className?: string;
	profile: UserProfile;
	items: CredentialModule[];
	onComplete: () => void;
}) {
	const setUser = useSetAtom(UserAtom);

	type Cred = Pick<CredentialModule, "name" | "provided">;
	const [embla, setEmbla] = React.useState<Embla | null>(null);
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
