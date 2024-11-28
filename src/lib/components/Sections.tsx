import type { Course } from "@backend.vcmoodle/api_pb";
import { TextInput } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Panel } from "@vcassist/ui";
import { createRef } from "react";
import { MdOutlineFolder, MdSearch } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { ListItemButton } from "@/src/lib/components/ListItemButton";
import { PanelTitle } from "@/src/lib/components/PanelTitle";
import { useListMaxWidthClass, useScrollIntoViewRef } from "../utils";

export function Sections(props: {
	course: Course;
	selected?: number;
	onSelect(idx?: number): void;
	search?: string;
	searchResults?: React.ReactNode;
	onSearch(value: string): void;
}) {
	const maxWidthClass = useListMaxWidthClass();
	const selectedRef = useScrollIntoViewRef(props.selected);
	const searchBoxRef = createRef<HTMLInputElement>();

	useHotkeys([["/", () => searchBoxRef.current?.focus()]]);

	return (
		<div className="flex flex-col gap-3">
			<Panel className={twMerge("flex flex-col gap-1 p-3", maxWidthClass)}>
				<PanelTitle label="Sections" />

				<div className="flex flex-col gap-1">
					{props.course.sections.map((s, idx) => {
						return (
							<ListItemButton
								key={s.idx}
								icon={MdOutlineFolder}
								selected={idx === props.selected}
								onClick={() => props.onSelect(idx)}
							>
								<p
									ref={idx === props.selected ? selectedRef : undefined}
									className="text-md"
								>
									{s.name}
								</p>
							</ListItemButton>
						);
					})}
				</div>
			</Panel>

			<Panel className="flex flex-col gap-1 p-3 max-w-[280px]">
				<PanelTitle label={`Search in ${props.course.name}`} />
				<TextInput
					ref={searchBoxRef}
					placeholder="Search"
					leftSection={<MdSearch size={20} />}
					value={props.search}
					onChange={(e) => {
						props.onSearch(e.currentTarget.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							e.currentTarget.blur();
						}
					}}
				/>
				{props.searchResults}
			</Panel>
		</div>
	);
}
