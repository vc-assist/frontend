const sectionTitleMatchers: {
  re: RegExp
  show?: boolean
}[] = [
  { re: /unit *#?[\dA-Z]/gim },
  { re: /objectives/gim },
  { re: /unit *standard/gim },
  { re: /learning *outcome/gim },
  { re: /biblical *integration/gim },
  { re: /learning *outcome/gim },
  { re: /classroom *activities/gim },
  { re: /homework/gim, show: true },
]

// a section title has to:
// 1. be no longer than 80 chars.
// 2. has text that matches one of the matchers
// 3. is not underneath a ul, ol or table

function isSectionTitle(title: string): { shownByDefault: boolean } | null {
  if (title.length >= 80) {
    return null
  }
  for (const match of sectionTitleMatchers) {
    if (title.match(match.re)) {
      return { shownByDefault: match.show ?? false }
    }
  }
  return null
}

export type LessonPlanSection = {
  title: HTMLElement
  content: HTMLElement[]
  shownByDefault: boolean
}

// segmentation goal:
// "You want to find all the titles."
// "Then for each title, you want to find the shallowest
//  nodes after the current node that do not contain a title."

// segmentation algorithm:
// 1. if current is a leaf
//    1. if leaf is title, create title obj, append to output array, and return title obj
//    2. else return null
// 2. recurse through all children
//    1. if a child returns a title object, set it to the current title object
//    2. if a child returns null, and the current title object exists, add it to the current title object
// 3. return null if current title object is null

export function segmentLessonPlan(
  root: HTMLElement,
  out: LessonPlanSection[],
  underListOrTable?: boolean,
): LessonPlanSection | null {
  const isTitle = isSectionTitle(root.innerText)
  if (!underListOrTable && root.children.length === 0 && isTitle) {
    const section = {
      title: root,
      content: [],
      shownByDefault: isTitle.shownByDefault,
    }
    out.push(section)
    return section
  }

  const isListOrTable =
    root.nodeName === "OL" ||
    root.nodeName === "UL" ||
    root.nodeName === "table"

  let current: LessonPlanSection | null = null
  for (const node of root.children) {
    if (!(node instanceof HTMLElement)) {
      continue
    }

    const titles = segmentLessonPlan(node, out, isListOrTable)
    if (titles) {
      current = titles
      continue
    }
    if (current) {
      current.content.push(node)
    }
  }

  return current
}

// this removes all leaves with empty text (as well as nodes containing only leaves with empty text)
export function removeEmptySpace(root: HTMLElement): boolean {
  if (root.children.length === 0) {
    return root.innerText.trim() === ""
  }

  const toBeRemoved: HTMLElement[] = []
  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      console.warn(child, "is not an HTMLElement")
      continue
    }
    const empty = removeEmptySpace(child)
    if (empty) {
      toBeRemoved.push(child)
    }
  }

  for (const c of toBeRemoved) {
    root.removeChild(c)
  }
  return root.children.length === 0 && root.innerText.trim() === ""
}

// this removes all leaves with a certain innerText
export function removeNodeWithText(root: HTMLElement, text: string) {
  if (root.children.length === 0 && root.innerText.trim() === text) {
    root.remove()
    return
  }
  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      console.warn(child, "is not an HTMLElement")
      continue
    }
    removeNodeWithText(child, text)
  }
}

// this turns all H1-H6 nodes into p + bold
export function demoteNonSectionHeaders(root: Element) {
  if (root.nodeName.length === 2) {
    const no = Number.parseInt(root.nodeName[1])
    if (root.nodeName[0] === "H" && no >= 1 && no <= 6) {
      const replacement = document.createElement("p")
      replacement.style.fontWeight = "semibold"
      replacement.innerHTML = root.innerHTML
      root.replaceWith(replacement)
      return
    }
  }
  for (const child of root.children) {
    demoteNonSectionHeaders(child)
  }
}

const dangerMatchers: RegExp[] = [
  /test/gim,
  /quiz/gim,
  /learning +opportunity/gim,
  /final/gim,
  /assessment/gim,
]

export function highlightDangerKeywords(root: HTMLElement, className: string) {
  if (root.children.length === 0) {
    let newContent = root.innerHTML
    for (const match of dangerMatchers) {
      newContent = newContent.replaceAll(match, (val) => {
        return `<span class="${className}">${val}</span>`
      })
    }
    root.innerHTML = newContent
    return
  }
  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      console.warn(child, "is not an HTMLElement")
      continue
    }
    highlightDangerKeywords(child, className)
  }
}

export function handleLinks(root: HTMLElement, handle: (href: string) => void) {
  if (root instanceof HTMLAnchorElement) {
    const href = root.href
    root.href = "#"
    root.onclick = (e) => {
      e.preventDefault()
      handle(href)
    }
    return
  }
  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      console.warn(child, "is not an HTMLElement")
      continue
    }
    handleLinks(child, handle)
  }
}
