export interface Webview {
  userAgent(): Promise<string>

  open(url: string, userAgent?: string): Promise<void>
  close(): Promise<void>

  onNavigate(fn: (url: string) => void): Promise<() => Promise<void>>
  onClosed(fn: (url: string) => void): Promise<() => Promise<void>>
}
