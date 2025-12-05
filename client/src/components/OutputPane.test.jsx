import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';
import OutputPane from './OutputPane';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock translation object
const t = {
  terminalTitle: 'Terminal',
  statusExecuting: 'Executing',
  statusIdle: 'Idle',
  waitingOutput: 'Waiting for output...',
  traceback: 'Traceback',
  analyzing: 'Analyzing...',
  explainBtn: 'Explain Error',
  tutorTitle: 'AI Tutor'
};

describe('OutputPane Component', () => {
  it('renders text output correctly', () => {
    const output = ['Line 1', 'Line 2'];
    render(
      <OutputPane
        t={t}
        isDebug={false}
        isRunning={false}
        output={output}
        error={null}
        cleanTraceback={(err) => err}
      />
    );
    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });

  it('renders image output correctly', () => {
    const output = [
        'Text before',
        { type: 'image', content: 'base64mock' }
    ];
    render(
      <OutputPane
        t={t}
        isDebug={false}
        isRunning={false}
        output={output}
        error={null}
        cleanTraceback={(err) => err}
      />
    );
    expect(screen.getByText('Text before')).toBeInTheDocument();
    const img = screen.getByAltText('Plot');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,base64mock');
  });

  it('renders without crashing when aiExplanation contains no code', () => {
    render(
      <OutputPane
        t={t}
        isDebug={false}
        isRunning={false}
        output={[]}
        error="Some error"
        cleanTraceback={(err) => err}
        aiExplanation="This is a simple explanation."
        loadingAi={false}
      />
    );
    expect(screen.getByText('This is a simple explanation.')).toBeInTheDocument();
  });

  it('renders block code with copy button (wrapped in custom PreBlock)', () => {
    const explanationWithCode = `
Here is some code:
\`\`\`python
print("Hello")
\`\`\`
    `;

    render(
      <OutputPane
        t={t}
        isDebug={false}
        isRunning={false}
        output={[]}
        error="Some error"
        cleanTraceback={(err) => err}
        aiExplanation={explanationWithCode}
        loadingAi={false}
      />
    );

    // Check if the copy button exists (part of PreBlock)
    const copyButton = screen.getByTitle('Copia codice');
    expect(copyButton).toBeInTheDocument();

    // Check if code content is present
    expect(screen.getByText('print("Hello")')).toBeInTheDocument();
  });

  it('renders inline code as standard code tag (not wrapped in PreBlock)', () => {
    const explanationWithInline = `This is \`inline code\`.`;

    render(
      <OutputPane
        t={t}
        isDebug={false}
        isRunning={false}
        output={[]}
        error="Some error"
        cleanTraceback={(err) => err}
        aiExplanation={explanationWithInline}
        loadingAi={false}
      />
    );

    // Verify 'inline code' text exists
    const codeElement = screen.getByText('inline code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.tagName).toBe('CODE');

    // Verify it is NOT inside a PreBlock (which adds a specific button)
    const buttons = screen.queryAllByTitle('Copia codice');
    expect(buttons.length).toBe(0);
  });
});
