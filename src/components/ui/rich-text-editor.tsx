'use client'

import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import tippy from 'tippy.js'
import { MentionList } from './mention-list'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Baseline,
  Highlighter,
  Eraser
} from 'lucide-react'
import { Button } from './button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './select'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('הכנס כתובת URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const setHeading = (value: string) => {
    if (value === 'paragraph') {
      editor.chain().focus().setParagraph().run()
    } else {
      const level = parseInt(value) as 1 | 2 | 3
      editor.chain().focus().toggleHeading({ level }).run()
    }
  }

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return '1'
    if (editor.isActive('heading', { level: 2 })) return '2'
    if (editor.isActive('heading', { level: 3 })) return '3'
    return 'paragraph'
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10" dir="rtl">
      <div className="flex items-center gap-1 pe-2 border-e border-slate-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 rounded-md"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 rounded-md"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 px-2 border-e border-slate-200">
        <Select value={getCurrentHeading()} onValueChange={setHeading}>
          <SelectTrigger className="h-8 w-[130px] rounded-md border-none bg-transparent hover:bg-slate-200 transition-colors font-bold text-xs flex-row-reverse">
            <SelectValue placeholder="סגנון טקסט" />
          </SelectTrigger>
          <SelectContent dir="rtl" className="rounded-xl border-slate-200">
            <SelectItem value="paragraph" className="font-bold">טקסט רגיל</SelectItem>
            <SelectItem value="1" className="text-xl font-black">כותרת גדולה</SelectItem>
            <SelectItem value="2" className="text-lg font-black">כותרת בינונית</SelectItem>
            <SelectItem value="3" className="text-base font-black">כותרת קטנה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 px-2 border-e border-slate-200">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('bold') && "bg-slate-200")}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('italic') && "bg-slate-200")}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('underline') && "bg-slate-200")}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 px-2 border-e border-slate-200">
        <input
          type="color"
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 p-1 rounded-md cursor-pointer border-none bg-transparent"
          title="צבע טקסט"
        />
        <Button
          type="button"
          variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('highlight') && "bg-yellow-100 text-yellow-900")}
          title="מרקר"
        >
          <Highlighter className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 px-2 border-e border-slate-200">
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('bulletList') && "bg-slate-200")}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive('orderedList') && "bg-slate-200")}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 px-2 border-e border-slate-200">
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive({ textAlign: 'right' }) && "bg-slate-200")}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive({ textAlign: 'center' }) && "bg-slate-200")}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive({ textAlign: 'left' }) && "bg-slate-200")}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn("h-8 w-8 rounded-md", editor.isActive({ textAlign: 'justify' }) && "bg-slate-200")}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 px-2">
        <Button
          type="button"
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="icon"
          onClick={addLink}
          className={cn("h-8 w-8 rounded-md", editor.isActive('link') && "bg-slate-200")}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        {editor.isActive('link') && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="h-8 w-8 rounded-md"
          >
            <Unlink className="w-4 h-4" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="h-8 w-8 rounded-md"
          title="נקה עיצוב"
        >
          <Eraser className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

const suggestion = {
  items: ({ query }: { query: string }) => {
    return [
      { id: '{{name}}', label: 'שם המשתמש' },
      { id: '{{org_name}}', label: 'שם האקדמיה' },
      { id: '{{course_name}}', label: 'שם הקורס' },
      { id: '{{lesson_name}}', label: 'שם השיעור' },
      { id: '{{login_url}}', label: 'קישור התחברות' },
    ].filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) || 
      item.id.toLowerCase().includes(query.toLowerCase())
    )
  },

  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        if (popup && popup[0]) {
          popup[0].destroy()
        }
        if (component) {
          component.destroy()
        }
      },
    }
  },
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: placeholder || 'הקלד תוכן כאן...',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-primary font-bold bg-primary/10 px-1 rounded',
        },
        suggestion,
        renderText({ node }) {
          return `${node.attrs.id}`
        },
        renderHTML({ node }) {
          return [
            'span',
            { 'data-type': 'mention', 'data-id': node.attrs.id, class: 'mention text-primary font-bold' },
            `${node.attrs.id}`
          ]
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] px-8 py-6 text-right',
        dir: 'rtl'
      },
    },
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-right: 1.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-right: 1.5rem;
        }
        .tiptap h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1.5rem; }
        .tiptap h2 { font-size: 1.875rem; font-weight: 800; margin-bottom: 1.25rem; }
        .tiptap h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .tiptap p { font-size: 1.125rem; line-height: 1.75; }
      `}</style>
    </div>
  )
}
