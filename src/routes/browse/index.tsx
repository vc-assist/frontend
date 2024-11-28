import {
	type Chapter,
	type Course,
	ResourceType,
} from "@backend.vcmoodle/api_pb";
import { Carousel } from "@mantine/carousel";
import { Divider, rem } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useLayout } from "@vcassist/ui";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import {
	MdLink,
	MdOutlineArticle,
	MdOutlineBook,
	MdOutlineFileOpen,
} from "react-icons/md";
// import { useMoodleContext } from "../../stores";
import { ChapterDisplay } from "@/src/lib/components/ChapterDisplay";
import { HighlightSearch } from "@/src/lib/components/HighlightSearch";
import { ListItemButton } from "@/src/lib/components/ListItemButton";
import { Chapters } from "@/src/lib/components/Chapters";
import { Courses } from "@/src/lib/components/Courses";
import { Resources } from "@/src/lib/components/Resources";
import { Sections } from "@/src/lib/components/Sections";
import { useScrollIntoViewRef } from "@/src/lib/utils";
import "@/src/lib/components/mantine-carousel-fix.css";
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useAtomValue } from "jotai";
import { DataModulesAtom } from "@/src/lib/stores";

const browseParamsSchema = z.object({
	path: fallback(z.array(z.bigint().optional()), []).default([]),
	// Not sure if this is the right way to do this
	search: fallback(z.string().optional(), undefined).optional(),
});
type BrowseParams = z.infer<typeof browseParamsSchema>;

export const Route = createFileRoute("/browse/")({
	component: BrowseComponent,
	validateSearch: zodValidator(browseParamsSchema),
});

function usePostProcessCourses(courses: Course[]): Course[] {
	return useMemo(
		() =>
			courses
				.filter((c) => c.sections.length > 0)
				.map((c) => {
					c.sections = c.sections.filter((s) => s.resources.length > 0);
					return c;
				})
				.sort((a, b) => {
					if (
						(a.teacher !== "" && b.teacher !== "") ||
						(a.teacher === "" && b.teacher === "")
					) {
						return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
					}
					if (a.teacher !== "") {
						return -1;
					}
					if (b.teacher !== "") {
						return 1;
					}
					return 0;
				}),
		[courses],
	);
}

function getInitialPath(courses: Course[], params?: BrowseParams) {
	const defaultPath = [
		undefined, // selected course
		undefined, // selected section
		undefined, // selected resource
		undefined, // selected chapter
	];

	const inputPath = params?.path;
	if (!inputPath) {
		return defaultPath;
	}

	const courseIdx = courses.findIndex((c) => c.id === inputPath[0]);
	if (courseIdx < 0) {
		return defaultPath;
	}

	const sectionIdx =
		inputPath[1] !== undefined ? Number(inputPath[1]) : undefined;
	const resourceIdx =
		inputPath[2] !== undefined ? Number(inputPath[2]) : undefined;

	if (sectionIdx !== undefined && resourceIdx !== undefined) {
		const chapterIdx = courses[courseIdx].sections[sectionIdx].resources[
			resourceIdx
		].chapters.findIndex((c) => c.id === inputPath[3]);
		return [courseIdx, sectionIdx, resourceIdx, chapterIdx];
	}

	return [courseIdx, sectionIdx, resourceIdx];
}

function useSearch(
	courses: Course[],
	courseId?: number,
	initialSearch?: string,
) {
	const [search, setSearch] = useState(initialSearch ?? "");

	const resourceAgg = useMemo(() => {
		if (courseId === undefined) {
			return [];
		}
		const course = courses[courseId];
		return course.sections
			.flatMap((section) =>
				section.resources.map((resource) => ({
					value: resource,
					key: `${section.idx}.${resource.idx}`,
					path: [courseId, Number(section.idx), Number(resource.idx)],
				})),
			)
			.filter((r) => r.value.type !== ResourceType.HTML_AREA);
	}, [courseId, courses]);

	const chapterAgg = useMemo(() => {
		if (courseId === undefined) {
			return [];
		}
		const course = courses[courseId];
		return course.sections.flatMap((section) =>
			section.resources.flatMap((resource) =>
				resource.chapters.map((chapter) => ({
					value: chapter,
					path: [
						courseId,
						Number(section.idx),
						Number(resource.idx),
						Number(chapter.id),
					],
				})),
			),
		);
	}, [courseId, courses]);

	const resourceFuse = useMemo(
		() =>
			resourceAgg.length > 0
				? new Fuse(resourceAgg, {
						keys: ["value.displayContent"],
					})
				: undefined,
		[resourceAgg],
	);
	const chapterFuse = useMemo(
		() =>
			chapterAgg.length > 0
				? new Fuse(chapterAgg, {
						keys: ["value.name"],
					})
				: undefined,
		[chapterAgg],
	);

	const resourceResults = useMemo(
		() => resourceFuse?.search(search) ?? [],
		[resourceFuse, search],
	);
	const chapterResults = useMemo(
		() => chapterFuse?.search(search) ?? [],
		[chapterFuse, search],
	);

	return { search, setSearch, resourceResults, chapterResults };
}

// this is probably not idiomatic react
function BrowseComponent(props: { courses: Course[] }) {
	const courses = usePostProcessCourses(props.courses);

	const params = Route.useSearch();

	const [path, setPath] = useState<(number | undefined)[]>(
		getInitialPath(courses, params),
	);
	const [cursor, setCursor] = useState(
		params?.path ? params.path.length - 1 : 0,
	);
	const [shownChapter, setShownChapter] = useState<Chapter>();

	function pathCapacities() {
		return [
			courses.length,
			path[0] !== undefined ? courses[path[0]].sections.length : undefined,
			path[0] !== undefined && path[1] !== undefined
				? courses[path[0]].sections[path[1]].resources.length
				: undefined,
			path[0] !== undefined && path[1] !== undefined && path[2] !== undefined
				? courses[path[0]].sections[path[1]].resources[path[2]].chapters.length
				: undefined,
		];
	}

	const down = () => {
		if (cursor !== 3) {
			setShownChapter(undefined);
		}

		if (path[cursor] === undefined) {
			path[cursor] = 0;
			setPath([...path]);
			return;
		}
		if (path[cursor] >= pathCapacities()[cursor]! - 1) {
			path[cursor] = undefined;
			setPath([...path]);
			return;
		}
		path[cursor]!++;
		setPath([...path]);
	};

	const up = () => {
		if (cursor !== 3) {
			setShownChapter(undefined);
		}

		if (path[cursor] === undefined) {
			path[cursor] = pathCapacities()[cursor]! - 1;
			setPath([...path]);
			return;
		}
		if (path[cursor] === 0) {
			path[cursor] = undefined;
			setPath([...path]);
			return;
		}
		path[cursor]--;
		setPath([...path]);
	};

	const left = () => {
		if (cursor !== 3) {
			setShownChapter(undefined);
		}

		if (cursor === 0) {
			setPath([]);
			return;
		}
		path[cursor] = undefined;
		setPath([...path]);
		setCursor(cursor - 1);
	};

	const right = () => {
		if (cursor !== 3) {
			setShownChapter(undefined);
		}

		if (path[cursor] === undefined) {
			path[cursor] = 0;
			setPath([...path]);
			return;
		}
		if (cursor === 3 || pathCapacities()[cursor + 1] === 0) {
			return;
		}
		path[cursor + 1] = 0;
		setPath([...path]);
		setCursor(cursor + 1);
	};

	const { search, setSearch, chapterResults, resourceResults } = useSearch(
		courses,
		path[0],
		params?.search,
	);

	const layout = useLayout();

	useHotkeys([
		["j", down],
		["ArrowDown", down],
		["k", up],
		["ArrowUp", up],
		["l", right],
		["ArrowRight", right],
		["h", left],
		["ArrowLeft", left],
	]);

	const chapterDisplayRef = useScrollIntoViewRef(shownChapter);
	const dataModule = useAtomValue(DataModulesAtom);
	if (!dataModule?.moodle) {
		return;
	}
	const client = dataModule.moodle.client;

	const coursesList = (
		<Courses
			courses={courses}
			selected={path[0]}
			onSelect={(idx) => {
				setPath([idx]);
				setCursor(0);
			}}
		/>
	);

	const sectionsList =
		path[0] !== undefined ? (
			<Sections
				course={courses[path[0]]}
				selected={path[1]}
				onSelect={(idx) => {
					setPath([path[0], idx]);
					setCursor(1);
					setShownChapter(undefined);
				}}
				search={search}
				onSearch={(value) => {
					setSearch(value);
				}}
				searchResults={
					<>
						{resourceResults.map((resource) => (
							<ListItemButton
								icon={
									resource.item.value.type === ResourceType.FILE
										? MdOutlineFileOpen
										: resource.item.value.type === ResourceType.BOOK
											? MdOutlineBook
											: MdLink
								}
								key={resource.item.key}
								onClick={() => {
									setPath(resource.item.path);
									setShownChapter(undefined);
								}}
							>
								{resource.item.value.displayContent}
							</ListItemButton>
						))}

						{resourceResults.length > 0 && chapterResults.length > 0 ? (
							<Divider />
						) : undefined}

						{chapterResults.map((chapter) => (
							<ListItemButton
								icon={MdOutlineArticle}
								key={chapter.item.value.id}
								onClick={() => {
									setPath(chapter.item.path);
								}}
							>
								{chapter.item.value.name}
							</ListItemButton>
						))}
					</>
				}
			/>
		) : undefined;

	const resourcesList =
		path[0] !== undefined && path[1] !== undefined ? (
			<Resources
				section={courses[path[0]].sections[path[1]]}
				selected={path[2]}
				onSelect={(idx) => {
					setPath([path[0], path[1], idx]);
					setCursor(2);
					setShownChapter(undefined);
				}}
				onShow={(idx) => {
					const resource = courses[path[0]!].sections[path[1]!].resources[idx];
					if (
						resource.type !== ResourceType.GENERIC_URL &&
						resource.type !== ResourceType.FILE
					) {
						return;
					}
					window.open(resource.url);
				}}
			/>
		) : undefined;

	const chaptersList =
		path[0] !== undefined && path[1] !== undefined && path[2] !== undefined ? (
			<Chapters
				resource={courses[path[0]].sections[path[1]].resources[path[2]]}
				selected={path[3]}
				onSelect={(idx) => {
					setPath([path[0], path[1], path[2], idx]);
					setCursor(3);
				}}
				onShow={(idx) => {
					const chapter =
						courses[path[0]!].sections[path[1]!].resources[path[2]!].chapters[
							idx
						];
					setShownChapter(chapter);
				}}
			/>
		) : undefined;

	const chapterDisplay =
		shownChapter && path[0] !== undefined ? (
			<div ref={chapterDisplayRef}>
				<ChapterDisplay
					courseId={path[0]}
					chapter={shownChapter}
					content={{
						key: Number(shownChapter.id),
						async fetch() {
							const res = await client.getChapterContent({
								id: shownChapter.id,
							});
							return res.html;
						},
					}}
				/>
			</div>
		) : undefined;

	const LayoutComponent = layout === "mobile" ? MobileLayout : DesktopLayout;
	return (
		<>
			<LayoutComponent
				courses={coursesList}
				sections={sectionsList}
				resources={resourcesList}
				chapters={chaptersList}
				chapterDisplay={chapterDisplay}
			/>
			<HighlightSearch />
		</>
	);
}

interface BrowseLayoutProps {
	courses: React.ReactNode;
	sections?: React.ReactNode;
	resources?: React.ReactNode;
	chapters?: React.ReactNode;
	chapterDisplay?: React.ReactNode;
}

function DesktopLayout(props: BrowseLayoutProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex gap-3">
				{props.courses}
				{props.sections}
				{props.resources}
				{props.chapters}
			</div>

			{props.chapterDisplay}
		</div>
	);
}

function MobileCarouselSlide(props: { display: React.ReactNode }) {
	if (!props.display) {
		return;
	}
	return (
		<Carousel.Slide className="flex hover:cursor-grab active:cursor-grabbing">
			<div className="mx-auto">{props.display}</div>
		</Carousel.Slide>
	);
}

function MobileLayout(props: BrowseLayoutProps) {
	return (
		<Carousel
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
			withKeyboardEvents={false}
		>
			<MobileCarouselSlide display={props.courses} />
			<MobileCarouselSlide display={props.sections} />
			<MobileCarouselSlide display={props.resources} />
			<MobileCarouselSlide display={props.chapters} />
			<MobileCarouselSlide display={props.chapterDisplay} />
		</Carousel>
	);
}
