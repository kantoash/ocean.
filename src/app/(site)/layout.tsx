import { Navbar } from "@/src/components/nav/navbar"

export default function LandingLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
        <main>
        <Navbar />
        {children}
      </main>
    )
  }