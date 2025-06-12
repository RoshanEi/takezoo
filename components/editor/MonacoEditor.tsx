'use client'

import { useEffect, useRef, useState } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { FileNode } from '@/types/fileSystem'
import { AIService } from '@/lib/aiService'

interface MonacoEditorProps {
  file: FileNode
  content: string
  onChange: (content: string) => void
  onSave: () => void
  aiService: AIService
}

export function MonacoEditor({
  file,
  content,
  onChange,
  onSave,
  aiService
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.getValue()) {
      editorRef.current.setValue(content)
    }
  }, [content])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    setIsReady(true)

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showUsers: true,
        showIssues: true
      }
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave()
    })

    // Add AI assistance command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      showAIAssistance()
    })

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const newContent = editor.getValue()
      onChange(newContent)
    })

    // Add context menu items
    editor.addAction({
      id: 'ai-explain-code',
      label: 'Ask AI to Explain',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 1,
      run: () => {
        const selection = editor.getSelection()
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection)
          if (selectedText) {
            requestAIExplanation(selectedText)
          }
        }
      }
    })

    editor.addAction({
      id: 'ai-improve-code',
      label: 'Ask AI to Improve',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 2,
      run: () => {
        const selection = editor.getSelection()
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection)
          if (selectedText) {
            requestAIImprovement(selectedText)
          }
        }
      }
    })

    editor.addAction({
      id: 'ai-fix-code',
      label: 'Ask AI to Fix',
      contextMenuGroupId: 'ai',
      contextMenuOrder: 3,
      run: () => {
        const selection = editor.getSelection()
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection)
          if (selectedText) {
            requestAIFix(selectedText)
          }
        }
      }
    })
  }

  const showAIAssistance = () => {
    // Dispatch event to show AI chat panel
    window.dispatchEvent(new CustomEvent('show-ai-chat', {
      detail: {
        context: {
          currentFile: file.path,
          selectedText: getSelectedText(),
          fileContent: content
        }
      }
    }))
  }

  const getSelectedText = (): string | undefined => {
    if (!editorRef.current) return undefined
    
    const selection = editorRef.current.getSelection()
    if (!selection) return undefined
    
    return editorRef.current.getModel()?.getValueInRange(selection)
  }

  const requestAIExplanation = (code: string) => {
    window.dispatchEvent(new CustomEvent('ai-request', {
      detail: {
        type: 'explain',
        code,
        file: file.path,
        language: file.language
      }
    }))
  }

  const requestAIImprovement = (code: string) => {
    window.dispatchEvent(new CustomEvent('ai-request', {
      detail: {
        type: 'improve',
        code,
        file: file.path,
        language: file.language
      }
    }))
  }

  const requestAIFix = (code: string) => {
    window.dispatchEvent(new CustomEvent('ai-request', {
      detail: {
        type: 'fix',
        code,
        file: file.path,
        language: file.language
      }
    }))
  }

  const getTheme = () => {
    // Use VS Code Dark+ theme
    return 'vs-dark'
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={file.language || 'plaintext'}
        value={content}
        theme={getTheme()}
        onMount={handleEditorDidMount}
        options={{
          readOnly: false,
          domReadOnly: false,
          selectOnLineNumbers: true,
          roundedSelection: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: true,
          useTabStops: false,
          fontSize: 14,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          wordWrapColumn: 80,
          wordWrapMinified: true,
          wrappingIndent: 'indent',
          wrappingStrategy: 'advanced',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          minimap: {
            enabled: true,
            side: 'right',
            showSlider: 'mouseover',
            renderCharacters: true,
            maxColumn: 120
          },
          find: {
            addExtraSpaceOnTop: false,
            autoFindInSelection: 'never',
            seedSearchStringFromSelection: 'always'
          },
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'mouseover',
          unfoldOnClickAfterEndOfLine: false,
          foldingHighlight: true,
          foldingImportsByDefault: false,
          links: true,
          colorDecorators: true,
          lightbulb: {
            enabled: true
          },
          codeActionsOnSave: {
            'source.fixAll': true
          },
          formatOnSave: true,
          formatOnPaste: true,
          formatOnType: true
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading editor...</div>
          </div>
        }
      />
    </div>
  )
}
