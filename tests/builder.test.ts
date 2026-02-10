import { describe, it, expect } from 'vitest';
import { GammaRequest, GammaTemplateRequest } from '../src/builder';

describe('GammaRequest Builder', () => {
  describe('generate mode', () => {
    it('builds a minimal request', () => {
      const request = GammaRequest
        .create('Three tips for productivity')
        .generate()
        .build();

      expect(request).toEqual({
        inputText: 'Three tips for productivity',
        textMode: 'generate',
      });
    });

    it('builds a full-featured presentation request', () => {
      const request = GammaRequest
        .create('Remote team management strategies')
        .generate()
        .withTone('professional, authoritative')
        .withAudience('team leads and managers')
        .withTextAmount('medium')
        .asPresentation()
        .widescreen()
        .withCards(10)
        .withAiImages('flux-1-quick', 'clean, modern, minimal')
        .withTheme('abc123')
        .exportAs('pdf')
        .build();

      expect(request.inputText).toBe('Remote team management strategies');
      expect(request.textMode).toBe('generate');
      expect(request.textOptions?.tone).toBe('professional, authoritative');
      expect(request.textOptions?.audience).toBe('team leads and managers');
      expect(request.textOptions?.amount).toBe('medium');
      expect(request.format).toBe('presentation');
      expect(request.cardOptions?.dimensions).toBe('16x9');
      expect(request.numCards).toBe(10);
      expect(request.imageOptions?.source).toBe('aiGenerated');
      expect(request.imageOptions?.model).toBe('flux-1-quick');
      expect(request.imageOptions?.style).toBe('clean, modern, minimal');
      expect(request.themeId).toBe('abc123');
      expect(request.exportAs).toBe('pdf');
    });

    it('supports all format types', () => {
      const presentation = GammaRequest.create('test').generate().asPresentation().build();
      const document = GammaRequest.create('test').generate().asDocument().build();
      const social = GammaRequest.create('test').generate().asSocial().build();
      const webpage = GammaRequest.create('test').generate().asWebpage().build();

      expect(presentation.format).toBe('presentation');
      expect(document.format).toBe('document');
      expect(social.format).toBe('social');
      expect(webpage.format).toBe('webpage');
    });

    it('supports dimension shortcuts', () => {
      const widescreen = GammaRequest.create('test').generate().asPresentation().widescreen().build();
      const standard = GammaRequest.create('test').generate().asPresentation().standard().build();
      const letter = GammaRequest.create('test').generate().asDocument().letter().build();
      const a4 = GammaRequest.create('test').generate().asDocument().a4().build();
      const square = GammaRequest.create('test').generate().asSocial().square().build();
      const portrait = GammaRequest.create('test').generate().asSocial().portrait().build();
      const story = GammaRequest.create('test').generate().asSocial().story().build();

      expect(widescreen.cardOptions?.dimensions).toBe('16x9');
      expect(standard.cardOptions?.dimensions).toBe('4x3');
      expect(letter.cardOptions?.dimensions).toBe('letter');
      expect(a4.cardOptions?.dimensions).toBe('a4');
      expect(square.cardOptions?.dimensions).toBe('1x1');
      expect(portrait.cardOptions?.dimensions).toBe('4x5');
      expect(story.cardOptions?.dimensions).toBe('9x16');
    });

    it('supports image options', () => {
      const aiImages = GammaRequest.create('test').generate().withAiImages('imagen-4-pro', 'realistic').build();
      const noImages = GammaRequest.create('test').generate().noImages().build();
      const pexels = GammaRequest.create('test').generate().withImages('pexels').build();

      expect(aiImages.imageOptions?.source).toBe('aiGenerated');
      expect(aiImages.imageOptions?.model).toBe('imagen-4-pro');
      expect(aiImages.imageOptions?.style).toBe('realistic');
      expect(noImages.imageOptions?.source).toBe('noImages');
      expect(pexels.imageOptions?.source).toBe('pexels');
    });

    it('supports sharing options', () => {
      const request = GammaRequest
        .create('test')
        .generate()
        .withSharing({
          workspaceAccess: 'view',
          externalAccess: 'noAccess',
          emailOptions: {
            recipients: ['team@example.com'],
            access: 'comment',
          },
        })
        .build();

      expect(request.sharingOptions?.workspaceAccess).toBe('view');
      expect(request.sharingOptions?.externalAccess).toBe('noAccess');
      expect(request.sharingOptions?.emailOptions?.recipients).toEqual(['team@example.com']);
      expect(request.sharingOptions?.emailOptions?.access).toBe('comment');
    });

    it('supports folders', () => {
      const request = GammaRequest
        .create('test')
        .generate()
        .inFolders('folder1', 'folder2')
        .build();

      expect(request.folderIds).toEqual(['folder1', 'folder2']);
    });
  });

  describe('condense mode', () => {
    it('builds a condense request with amount', () => {
      const request = GammaRequest
        .create('Long text to condense...')
        .condense()
        .withTextAmount('brief')
        .withLanguage('es')
        .build();

      expect(request.textMode).toBe('condense');
      expect(request.textOptions?.amount).toBe('brief');
      expect(request.textOptions?.language).toBe('es');
    });
  });

  describe('preserve mode', () => {
    it('builds a preserve request with manual card breaks', () => {
      const request = GammaRequest
        .create('# Slide 1\nContent\n---\n# Slide 2\nMore content')
        .preserve()
        .withLanguage('en')
        .withCardSplit('inputTextBreaks')
        .asDocument()
        .a4()
        .noImages()
        .build();

      expect(request.textMode).toBe('preserve');
      expect(request.textOptions?.language).toBe('en');
      expect(request.cardSplit).toBe('inputTextBreaks');
      expect(request.format).toBe('document');
      expect(request.imageOptions?.source).toBe('noImages');
    });
  });
});

describe('GammaTemplateRequest Builder', () => {
  it('builds a template request', () => {
    const request = GammaTemplateRequest
      .create('g_abc123def456', 'Update with Q1 2026 data')
      .withTheme('theme123')
      .withAiImages('imagen-4-pro', 'corporate, professional')
      .exportAs('pptx')
      .inFolders('folder1')
      .build();

    expect(request.gammaId).toBe('g_abc123def456');
    expect(request.prompt).toBe('Update with Q1 2026 data');
    expect(request.themeId).toBe('theme123');
    expect(request.imageOptions?.model).toBe('imagen-4-pro');
    expect(request.imageOptions?.style).toBe('corporate, professional');
    expect(request.exportAs).toBe('pptx');
    expect(request.folderIds).toEqual(['folder1']);
  });

  it('builds a minimal template request', () => {
    const request = GammaTemplateRequest
      .create('g_abc123', 'Simple prompt')
      .build();

    expect(request.gammaId).toBe('g_abc123');
    expect(request.prompt).toBe('Simple prompt');
  });
});
