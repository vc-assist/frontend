export interface NativeAPI {
  launchUrl(url: string): Promise<void>
  userAgent(): Promise<string>

  openWebview(url: string, userAgent?: string): Promise<void>
  closeWebview(): Promise<void>
  onWebviewNavigate(fn: (url: string) => void): Promise<() => Promise<void>>
  onWebviewClosed(fn: () => void): Promise<() => Promise<void>>
}
