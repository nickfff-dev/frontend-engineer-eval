'use client'
import { useCallback } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode } from '@lexical/code'
import { LinkNode } from '@lexical/link'
import { TRANSFORMERS, $convertToMarkdownString, $convertFromMarkdownString } from '@lexical/markdown'
import type { EditorState, LexicalEditor } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    Heading1, Heading2, Quote, Code,
} from 'lucide-react'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar() {
    const [editor] = useLexicalComposerContext()

    const formatText = (format: 'bold' | 'italic' | 'strikethrough') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
    }

    const formatHeading = (level: 'h1' | 'h2') => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(level))
            }
        })
    }

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode())
            }
        })
    }

    return (
        <div className="flex flex-wrap items-center gap-1 border-b p-2 bg-muted/30">
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => formatText('bold')} title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => formatText('italic')} title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => formatText('strikethrough')} title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => formatHeading('h1')} title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => formatHeading('h2')} title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={formatQuote} title="Quote"
            >
                <Quote className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button" size="icon" variant="ghost" className="h-8 w-8"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <span className="text-xs text-muted-foreground ml-1">
                Markdown shortcuts supported
            </span>
        </div>
    )
}

// ── Main Editor ───────────────────────────────────────────────────────────────

interface MarkdownEditorProps {
    value?: string               // initial markdown string
    onChange?: (markdown: string) => void
    placeholder?: string
    className?: string
    minHeight?: string
}

export function MarkdownEditor({
    value = '',
    onChange,
    placeholder = 'Start writing…',
    className,
    minHeight = 'min-h-48',
}: MarkdownEditorProps) {
    const handleChange = useCallback(
        (editorState: EditorState) => {
            editorState.read(() => {
                const markdown = $convertToMarkdownString(TRANSFORMERS)
                onChange?.(markdown)
            })
        },
        [onChange]
    )

    const initialConfig = {
        namespace: 'TaskflowEditor',
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode],
        onError: (error: Error) => console.error(error),
        // Load initial markdown if provided
        editorState: value
            ? () => $convertFromMarkdownString(value, TRANSFORMERS)
            : undefined,
        theme: {
            // Map Lexical classes to Tailwind
            paragraph: 'mb-2 text-sm',
            heading: {
                h1: 'text-2xl font-bold mb-3',
                h2: 'text-xl font-semibold mb-2',
                h3: 'text-lg font-medium mb-2',
            },
            quote: 'border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-2',
            list: {
                ul: 'list-disc list-inside mb-2 text-sm space-y-1',
                ol: 'list-decimal list-inside mb-2 text-sm space-y-1',
            },
            text: {
                bold: 'font-bold',
                italic: 'italic',
                strikethrough: 'line-through',
                code: 'bg-muted px-1 rounded font-mono text-xs',
            },
            code: 'block bg-muted p-3 rounded-md font-mono text-xs my-2',
        },
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className={cn('rounded-md border overflow-hidden', className)}>
                <Toolbar />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className={cn(
                                    'outline-none px-4 py-3 text-sm',
                                    minHeight
                                )}
                            />
                        }
                        placeholder={
                            <div className="absolute top-3 left-4 text-sm text-muted-foreground pointer-events-none select-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
            </div>

            {/* Plugins */}
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <OnChangePlugin onChange={handleChange} />
        </LexicalComposer>
    )
}