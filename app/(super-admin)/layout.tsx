export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark min-h-screen bg-zinc-950 text-zinc-50">
      {children}
    </div>
  )
}
