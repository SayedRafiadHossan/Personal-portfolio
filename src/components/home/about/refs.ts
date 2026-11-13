export type SlideRefs = {
  content: HTMLDivElement | null
  image: HTMLDivElement | null
  number: HTMLSpanElement | null
  face: HTMLSpanElement | null
  nowDot: HTMLSpanElement | null
}

export const emptySlideRefs = (): SlideRefs => ({
  content: null,
  image: null,
  number: null,
  face: null,
  nowDot: null,
})

export const assignSlideRef = <K extends keyof SlideRefs>(
  slides: SlideRefs[],
  index: number,
  key: K,
  el: SlideRefs[K]
) => {
  if (!slides[index]) {
    slides[index] = emptySlideRefs()
  }
  slides[index][key] = el
}

export const areSlideRefsReady = (refs: SlideRefs[], count: number) =>
  refs.length === count &&
  refs.every((r) => r.content && r.image && r.number && r.face)
