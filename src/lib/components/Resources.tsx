import { ResourceType, type Section } from "@backend.vcmoodle/api_pb";
import { useHotkeys } from "@mantine/hooks";
import { Panel } from "@vcassist/ui";
import type { IconType } from "react-icons";
import { MdLink, MdOutlineBook, MdOutlineFileOpen } from "react-icons/md";
import DOMPurify from "dompurify";
import { twMerge } from "tailwind-merge";
import { ListItemButton } from "@/src/lib/components/ListItemButton";
import { PanelTitle } from "@/src/lib/components/PanelTitle";
import { useListMaxWidthClass, useScrollIntoViewRef } from "../utils";

export function Resources(props: {
	section: Section;
	selected?: number;
	onSelect(idx?: number): void;
	onShow(idx: number): void;
}) {
	const maxWidthClass = useListMaxWidthClass();
	const selectedRef = useScrollIntoViewRef(props.selected);

	useHotkeys([
		[
			"Enter",
			() => {
				if (props.selected === undefined) {
					return;
				}
				props.onShow(props.selected);
			},
		],
	]);

	return (
		<Panel className={twMerge("flex flex-col gap-1 p-3", maxWidthClass)}>
			<PanelTitle label="Resources" />

			<div className="flex flex-col gap-1">
				{props.section.resources.map((r, idx) => {
					let icon: IconType;

					switch (r.type) {
						case ResourceType.GENERIC_URL:
							icon = MdLink;
							break;
						case ResourceType.BOOK:
							icon = MdOutlineBook;
							break;
						case ResourceType.FILE:
							icon = MdOutlineFileOpen;
							break;
						case ResourceType.HTML_AREA:
							return (
								<ListItemButton
									key={r.idx}
									selected={idx === props.selected}
									className="content"
									onClick={() => {
										props.onSelect(idx);
									}}
								>
									<div
										ref={idx === props.selected ? selectedRef : undefined}
										className="content"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: this is sanitized
										dangerouslySetInnerHTML={{
											__html: DOMPurify.sanitize(r.displayContent),
										}}
									/>
								</ListItemButton>
							);
					}

					return (
						<ListItemButton
							key={r.idx}
							icon={icon}
							selected={idx === props.selected}
							onClick={() => {
								props.onSelect(idx);
								props.onShow(idx);
							}}
						>
							<p
								ref={idx === props.selected ? selectedRef : undefined}
								className="text-md"
							>
								{r.displayContent}
							</p>
						</ListItemButton>
					);
				})}
			</div>
		</Panel>
	);
}
