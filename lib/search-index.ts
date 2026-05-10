export type SearchResultType = 'worker' | 'incident' | 'site'

export interface SearchItem {
  type:     SearchResultType
  title:    string
  subtitle: string
  keywords: string[]
  href:     string
}

export const SEARCH_INDEX: SearchItem[] = [
  // ── Workers ──────────────────────────────────────────────────────
  { type: 'worker', title: 'Tarek Haddad',        subtitle: 'HG-1042 · Structural Steel Worker · Crew A · Zone B · Palm Jebel Ali', keywords: ['tarek', 'haddad', 'hg-1042', '1042', 'steel', 'crew a', 'zone b', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Khaled Saeed',         subtitle: 'HG-1103 · Scaffolding Technician · Crew A · Zone B · Palm Jebel Ali',  keywords: ['khaled', 'saeed', 'hg-1103', '1103', 'scaffold', 'crew a', 'zone b', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Mohammed Al Rashid',   subtitle: 'HG-0229 · Heavy Equipment Operator · Crew A · Zone B · Palm Jebel Ali', keywords: ['mohammed', 'rashid', 'hg-0229', '0229', 'equipment', 'crane', 'crew a', 'zone b', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Rajesh Iyer',          subtitle: 'HG-0877 · Concrete Finisher · Crew B · Zone A · Palm Jebel Ali',       keywords: ['rajesh', 'iyer', 'hg-0877', '0877', 'concrete', 'crew b', 'zone a', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Vinay Barad',          subtitle: 'HG-0692 · Electrician · Crew B · Zone A · Palm Jebel Ali',              keywords: ['vinay', 'barad', 'hg-0692', '0692', 'electrician', 'crew b', 'zone a', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Santhosh Kumar',       subtitle: 'HG-1220 · Bar Bender · Crew B · Zone A · Palm Jebel Ali',              keywords: ['santhosh', 'kumar', 'hg-1220', '1220', 'bar bender', 'crew b', 'zone a', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'George Adam',          subtitle: 'HG-0541 · Crane Operator · Crew C · Zone C · Palm Jebel Ali',          keywords: ['george', 'adam', 'hg-0541', '0541', 'crane', 'crew c', 'zone c', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Indira Comar',         subtitle: 'HG-0318 · Site Safety Officer · Crew C · Zone C · Palm Jebel Ali',     keywords: ['indira', 'comar', 'hg-0318', '0318', 'safety', 'officer', 'crew c', 'zone c', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Ahmed Al Mansoori',    subtitle: 'HG-0140 · Foreman · Crew C · Zone C · Palm Jebel Ali',                 keywords: ['ahmed', 'mansoori', 'hg-0140', '0140', 'foreman', 'crew c', 'zone c', 'palm jebel ali'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Priya Nair',           subtitle: 'HG-0455 · Civil Engineer · Crew D · Zone D · Dubai Creek Harbour',     keywords: ['priya', 'nair', 'hg-0455', '0455', 'civil', 'engineer', 'crew d', 'zone d', 'dubai creek'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Omar Farouk',          subtitle: 'HG-0612 · Waterproofing Specialist · Crew D · Zone D · Dubai Creek Harbour', keywords: ['omar', 'farouk', 'hg-0612', '0612', 'waterproof', 'crew d', 'zone d', 'dubai creek'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Fatima Al Zaabi',      subtitle: 'HG-0991 · HSE Inspector · Crew D · Zone D · Dubai Creek Harbour',      keywords: ['fatima', 'zaabi', 'hg-0991', '0991', 'hse', 'inspector', 'crew d', 'zone d', 'dubai creek'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Liu Wei',              subtitle: 'HG-0788 · MEP Coordinator · Crew E · Zone D · Dubai Creek Harbour',    keywords: ['liu', 'wei', 'hg-0788', '0788', 'mep', 'crew e', 'zone d', 'dubai creek'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Bilal Chaudhry',       subtitle: 'HG-1340 · Plumbing Foreman · Crew E · Zone D · Dubai Creek Harbour',  keywords: ['bilal', 'chaudhry', 'hg-1340', '1340', 'plumbing', 'crew e', 'zone d', 'dubai creek'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Carlos Mendes',        subtitle: 'HG-1455 · Facade Engineer · Crew F · Zone F · Expo City',             keywords: ['carlos', 'mendes', 'hg-1455', '1455', 'facade', 'crew f', 'zone f', 'expo city'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Nadia El Masri',       subtitle: 'HG-1510 · Surveyor · Crew F · Zone F · Expo City',                    keywords: ['nadia', 'masri', 'hg-1510', '1510', 'survey', 'crew f', 'zone f', 'expo city'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Thabo Molefe',         subtitle: 'HG-1600 · Precast Concrete Installer · Crew F · Zone F · Expo City',  keywords: ['thabo', 'molefe', 'hg-1600', '1600', 'precast', 'crew f', 'zone f', 'expo city'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Arjun Menon',          subtitle: 'HG-1655 · Painter & Decorator · Crew G · Zone G · Expo City',         keywords: ['arjun', 'menon', 'hg-1655', '1655', 'painter', 'crew g', 'zone g', 'expo city'], href: '/dashboard/workers' },
  { type: 'worker', title: 'Kenji Tanaka',         subtitle: 'HG-1720 · Quality Control Inspector · Crew G · Zone G · Expo City',   keywords: ['kenji', 'tanaka', 'hg-1720', '1720', 'quality', 'crew g', 'zone g', 'expo city'], href: '/dashboard/workers' },

  // ── Open Incidents ───────────────────────────────────────────────
  { type: 'incident', title: 'INC-001 · Heat Exhaustion',    subtitle: 'George Adam (HG-0541) · Zone C · CRITICAL · Pending',       keywords: ['inc-001', 'inc001', 'george', 'adam', 'heat exhaustion', 'critical', 'zone c'], href: '/dashboard/incidents' },
  { type: 'incident', title: 'INC-002 · Dizziness Reported', subtitle: 'Vinay Barad (HG-0692) · Zone A · HIGH · Under Review',      keywords: ['inc-002', 'inc002', 'vinay', 'barad', 'dizziness', 'high', 'zone a'], href: '/dashboard/incidents' },
  { type: 'incident', title: 'INC-003 · High Heat Index',    subtitle: 'Indira Comar (HG-0318) · Zone C · WARNING · Monitoring',    keywords: ['inc-003', 'inc003', 'indira', 'comar', 'heat index', 'warning', 'zone c'], href: '/dashboard/incidents' },

  // ── Sites ────────────────────────────────────────────────────────
  { type: 'site', title: 'Palm Jebel Ali',     subtitle: 'Zone B–C · Dubai · 3 crews · primary site', keywords: ['palm jebel ali', 'jebel ali', 'zone b', 'zone c', 'palm'], href: '/dashboard' },
  { type: 'site', title: 'Dubai Creek Harbour', subtitle: 'Zone D · Dubai · 2 crews',                  keywords: ['dubai creek', 'creek harbour', 'harbour', 'zone d'], href: '/dashboard' },
  { type: 'site', title: 'Expo City Site',      subtitle: 'Jebel Ali / Dubai South · Zone F–G · 2 crews', keywords: ['expo city', 'expo', 'dubai south', 'zone f', 'zone g'], href: '/dashboard' },
]

export function searchIndex(query: string): SearchItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.keywords.some(k => k.includes(q))
  ).slice(0, 7)
}
