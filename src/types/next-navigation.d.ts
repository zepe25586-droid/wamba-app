declare module 'next/navigation' {
  export function redirect(url: string): never
  export function useRouter(): {
    push: (url: string) => void
    replace: (url: string) => void
    back: () => void
  }
  export function usePathname(): string | null
  export function useSearchParams(): any
}
