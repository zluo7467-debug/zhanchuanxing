import { Icon } from './Visuals'
import type { IconName } from './content'
import type { ReactNode } from 'react'
export type Panel = { kind: 'route' | 'exhibit' | 'movie' | 'game'; index: number } | { kind: 'connect' | 'search' | 'settings' | 'collection' | 'card' }
export type Saved = { favorites: string[]; visited: string[]; completed: string[] }
export function Action({ children, onClick, secondary = false, disabled = false, icon }: { children: ReactNode; onClick: () => void; secondary?: boolean; disabled?: boolean; icon?: IconName }) {
  return <button className={`action ${secondary ? 'secondary' : ''}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={18}/>}<span>{children}</span>{!icon && <Icon name="arrow" size={19}/>}</button>
}
export function SectionTitle({ title, more, onClick }: { title: string; more?: string; onClick?: () => void }) { return <div className="section-title"><h2>{title}</h2>{more && <button onClick={onClick}>{more}<Icon name="chevron" size={12}/></button>}</div> }
export function PageHeader({ label, title, action, icon = 'search' }: { label: string; title: string; action: () => void; icon?: IconName }) { return <header className="page-header"><div><span className="eyebrow">{label}</span><h1>{title}</h1></div><button className="circle-button glass" aria-label={icon === 'search' ? '搜索' : '阅读设置'} onClick={action}><Icon name={icon} size={21}/></button></header> }
export function DeviceRow({ connected, connect }: { connected: boolean; connect: () => void }) { return <button className="companion-row" onClick={connect}><span className="companion-icon"><Icon name="robot" size={25}/></span><span><strong>{connected ? '栈川行 01，与你同行' : '你的随行向导'}</strong><small>{connected ? '已连接 · 演示设备' : '连接栈川行，开启陪伴式游览'}</small></span><span className={`device-label ${connected ? 'is-connected' : ''}`}>{connected ? '已连接' : '连接'}<Icon name="chevron" size={12}/></span></button> }
