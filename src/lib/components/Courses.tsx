import type { Course } from "@backend.vcmoodle/api_pb";
import { Kbd } from "@mantine/core";
import { Panel, useLayout } from "@vcassist/ui";
import { twMerge } from "tailwind-merge";
import { ListItemButton } from "@/src/lib/components/ListItemButton";
import { PanelTitle } from "@/src/lib/components/PanelTitle";
import { useListMaxWidthClass, useScrollIntoViewRef } from "../utils";

export function Courses(props: {
	courses: Course[];
	selected?: number;
	onSelect(idx?: number): void;
}) {
	const maxWidthClass = useListMaxWidthClass();
	const layout = useLayout();
	const selectedRef = useScrollIntoViewRef(props.selected);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col gap-3">
				<Panel className={twMerge("flex flex-col gap-1 p-3", maxWidthClass)}>
					<PanelTitle label="Courses" />

					<div className="flex flex-col gap-1">
						{props.courses.map((c, idx) => {
							return (
								<ListItemButton
									key={c.id}
									selected={idx === props.selected}
									onClick={() => {
										props.onSelect(idx);
									}}
								>
									<div ref={idx === props.selected ? selectedRef : undefined}>
										<p className="text-md">{c.name}</p>
										{c.teacher ? (
											<p className="text-md text-dimmed" key={c.id}>
												{c.teacher}
											</p>
										) : undefined}
									</div>
								</ListItemButton>
							);
						})}
					</div>
				</Panel>
			</div>

			{layout === "desktop" ? (
				<Panel className="flex flex-col gap-1">
					<div className="flex gap-3">
						<div>
							<Kbd>k</Kbd> / ̷<Kbd>↑</Kbd>
						</div>
						<p>Up</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>j</Kbd> / ̷<Kbd>↓</Kbd>
						</div>
						<p>Down</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>h</Kbd> / ̷<Kbd>←</Kbd>
						</div>
						<p>Left</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>l</Kbd> / ̷<Kbd>→</Kbd>
						</div>
						<p>Right</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>/</Kbd>
						</div>
						<p>Focus search bar</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>ESC</Kbd>
						</div>
						<p>Defocus search bar</p>
					</div>

					<div className="flex gap-3">
						<div>
							<Kbd>ENTER</Kbd>
						</div>
						<p>Open link / lesson plan</p>
					</div>
				</Panel>
			) : undefined}
		</div>
	);
}
