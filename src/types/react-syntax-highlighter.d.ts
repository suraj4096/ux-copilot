import type { CSSProperties, ComponentType, HTMLAttributes } from "react"

declare module "react-syntax-highlighter" {
  export interface SyntaxHighlighterProps {
    language?: string
    style?: Record<string, CSSProperties>
    customStyle?: CSSProperties
    PreTag?: string
    codeTagProps?: HTMLAttributes<HTMLElement>
    children?: string | undefined
    className?: string
  }

  export const Light: ComponentType<SyntaxHighlighterProps>
}

declare module "react-syntax-highlighter/dist/cjs/styles/hljs" {
  export const googlecode: Record<string, CSSProperties>
}
