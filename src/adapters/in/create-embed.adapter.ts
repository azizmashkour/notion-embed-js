import type { NotionEmbedOptions, NotionEmbedResult } from '../../types.js';
import { CreateEmbedUseCase } from '../../domain/use-cases/create-embed.use-case.js';
import { UrlValidatorAdapter } from '../out/url-validator.adapter.js';
import { OptionsSegmentResolverAdapter } from '../out/segment-resolver.adapter.js';
import { DomEmbedRendererAdapter } from '../out/dom-embed-renderer.adapter.js';

const urlValidator = new UrlValidatorAdapter();
const embedRenderer = new DomEmbedRendererAdapter();

/**
 * Primary adapter: Create Notion embed (composition root)
 */
export function createEmbed(
  options: NotionEmbedOptions,
  container?: HTMLElement
): NotionEmbedResult {
  const segmentResolver = new OptionsSegmentResolverAdapter(options);
  const useCase = new CreateEmbedUseCase(urlValidator, segmentResolver);

  const { spec, segments, initialSegment, getSegmentUrl } =
    useCase.execute(options);

  const rendered = embedRenderer.render(
    spec,
    {
      segments: segments ?? undefined,
      initialSegment,
      getSegmentUrl: segments ? getSegmentUrl : undefined,
    },
    container ?? null
  );

  if (container && !spec.launcher) {
    container.appendChild(rendered.element);
  }

  return {
    element: rendered.element,
    destroy: rendered.destroy,
    setSegment: rendered.setSegment,
    getActiveSegment: rendered.getActiveSegment,
    open: rendered.open,
    close: rendered.close,
    isOpen: rendered.isOpen,
  };
}
